import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getCurrentEnrollmentPeriod, 
  getCourses,
  getCarts,
  addToCarts,
  removeFromCarts,
  clearCarts,
  enrollFromCart,
} from '../../../api/courseApi';
import { checkScheduleConflict } from '../utils/scheduleUtils';
import { isCreditLimitExceeded, calculateTotalCredits } from '../utils/creditUtils';

// 이수구분 코드 매핑
const courseTypeMap = {
  '전공필수': 1,
  '전공선택': 2,
  '교양필수': 3,
  '교양선택': 4,
};

/**
 * 수강신청 관련 커스텀 훅
 */
const useCourseRegistration = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCourseType, setSelectedCourseType] = useState('all');
  const [selectedCredits, setSelectedCredits] = useState('all');
  const [sortBy] = useState('courseCode,asc');
  const [cart, setCart] = useState([]);
  const [registered, setRegistered] = useState([]);

  // API 관련 상태
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enrollmentPeriodId, setenrollmentPeriodId] = useState(null);
  // 토스트 메시지 상태
  const [toast, setToast] = useState({ open: false, message: '', severity: 'error' });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total: 0,
    totalPages: 0,
  });


  // API 응답 데이터를 UI 형식으로 변환
  const transformCourseData = (apiCourse) => {


    const transformed = {
      id: apiCourse.id,
      subjectCode: apiCourse.courseCode,
      subjectName: apiCourse.courseName,
      professor: apiCourse.professor?.name || '',
      department: apiCourse.department?.name || '',
      departmentId: apiCourse.department?.id || null,
      courseType: apiCourse.courseType?.name || '',
      courseTypeCode: apiCourse.courseType?.code || '',
      credits: apiCourse.credits,
      currentStudents: apiCourse.enrollment?.current || 0,
      maxStudents: apiCourse.enrollment?.max || 0,
      isFull: apiCourse.enrollment?.isFull || false,
      schedule: apiCourse.schedule || [],
      classroom: apiCourse.schedule?.[0]?.classroom || '',
      isInCart: apiCourse.isInCart || false,
      isEnrolled: apiCourse.isEnrolled || false,
      canEnroll: apiCourse.canEnroll, // API 응답값 그대로 사용
    };


    return transformed;
  };

  // 장바구니 API 응답 데이터를 UI 형식으로 변환
  const transformCartData = (cartItem) => {
    return {
      cartId: cartItem.cartId,
      id: cartItem.course?.id,
      subjectCode: cartItem.course?.code,
      subjectName: cartItem.course?.name,
      professor: cartItem.professor?.name || '',
      credits: cartItem.course?.credits || 0,
      courseType: cartItem.course?.courseType || '',
      schedule: cartItem.schedule || [],
      classroom: cartItem.schedule?.[0]?.classroom || '',
      currentStudents: cartItem.enrollment?.current || 0,
      maxStudents: cartItem.enrollment?.max || 0,
      isFull: cartItem.enrollment?.isFull || false,
      addedAt: cartItem.addedAt,
    };
  };

  // 수강신청 기간 조회
  useEffect(() => {
    const fetchEnrollmentPeriod = async () => {
      try {
        setLoading(true);
        const response = await getCurrentEnrollmentPeriod();
        
        if (response.success && response.data?.currentPeriod) {
          const periodData = response.data.currentPeriod;
          setenrollmentPeriodId(periodData.id);
        } else {
          setError('수강신청 기간 정보를 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('수강신청 기간 조회 실패:', err);
        setError(err.message || '수강신청 기간 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentPeriod();
  }, []);

  // 검색어를 ref로 관리하여 debounce 시 최신 값 참조
  const searchTermRef = useRef(searchTerm);
  
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  // 강의 목록 조회
  const fetchCourses = useCallback(async (page = null) => {
    if (!enrollmentPeriodId) return;

    try {
      setLoading(true);
      setError(null);

      const currentPage = page !== null ? page : pagination.page;

      const params = {
        page: currentPage,
        size: pagination.size,
        enrollmentPeriodId: enrollmentPeriodId,
        sort: sortBy,
      };

      // 검색어
      if (searchTermRef.current.trim()) {
        params.keyword = searchTermRef.current.trim();
      }

      // 학과 필터
      if (selectedDepartment !== 'all') {
        params.departmentId = parseInt(selectedDepartment);
      }

      // 이수구분 필터
      if (selectedCourseType !== 'all') {
        params.courseType = courseTypeMap[selectedCourseType];
      }

      // 학점 필터
      if (selectedCredits !== 'all') {
        params.credits = parseInt(selectedCredits);
      }

      const response = await getCourses(params);



      if (response.success && response.data) {
        const transformedCourses = response.data.content?.map(transformCourseData) || [];

        setCourses(transformedCourses);

        // 페이지네이션 정보 업데이트
        if (response.data.totalElements !== undefined) {
          setPagination(prev => ({
            ...prev,
            total: response.data.totalElements,
            totalPages: response.data.totalPages || 0,
            size: response.data.size || prev.size,
            page: page !== null ? page : (response.data.number !== undefined ? response.data.number : prev.page),
          }));
        }
      } else {
        setError('강의 목록을 불러올 수 없습니다.');
        setCourses([]);
      }
    } catch (err) {
      console.error('강의 목록 조회 실패:', err);
      setError(err.message || '강의 목록을 불러오는 중 오류가 발생했습니다.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentPeriodId, selectedDepartment, selectedCourseType, selectedCredits, sortBy, pagination.size, courseTypeMap]);

  // enrollmentPeriodId가 설정되면 강의 목록 및 장바구니 조회
  useEffect(() => {
    if (enrollmentPeriodId) {
      fetchCourses(0); // 명시적으로 page 0 전달
      fetchCarts(); // 장바구니 조회
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentPeriodId]); // fetchCourses, fetchCarts는 ref로 관리하여 무한 루프 방지

  // 검색어 debounce
  useEffect(() => {
    if (!enrollmentPeriodId) return;

    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 0 }));
      fetchCourses(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, enrollmentPeriodId, fetchCourses]);

  // fetchCourses 함수를 ref로 관리하여 메모이제이션 사용
  const fetchCoursesRef = useRef(fetchCourses);
  useEffect(() => {
    fetchCoursesRef.current = fetchCourses;
  }, [fetchCourses]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchCourses(newPage);
  }, [fetchCourses]);

  // 장바구니 조회
  const fetchCarts = useCallback(async () => {
    try {
      const response = await getCarts();
      if (response.success && response.data?.courses) {
        const transformedCarts = response.data.courses.map(transformCartData);
        setCart(transformedCarts);
      } else {
        // 응답이 없거나 실패한 경우 빈 배열로 설정
        setCart([]);
      }
    } catch (err) {
      console.error('장바구니 조회 실패:', err);
      // 에러 발생 시에도 빈 배열로 설정하여 UI가 정상 작동하도록
      setCart([]);
    }
  }, []);

  // 장바구니에 추가
  // 주의: 장바구니 추가는 정원이 꽉 차도 가능 (정원 체크 제외)
  // 검증 항목: 시간표 충돌, 학점 초과만 체크
  const addToCart = useCallback(async (course) => {
    try {
      // 이미 신청 완료된 강의인지 확인
      if (registered.find((c) => c.id === course.id)) {
        setToast({ open: true, message: '이미 수강신청이 완료된 강의입니다.', severity: 'warning' });
        return;
      }

      // 이미 장바구니에 있는지 확인
      if (cart.find((c) => c.id === course.id)) {
        setToast({ open: true, message: '이미 장바구니에 추가된 강의입니다.', severity: 'warning' });
        return;
      }

      // 프론트엔드 검증: 시간표 충돌 체크 (장바구니 + 신청 완료 강의 모두 포함)
      const existingCourses = [...cart, ...registered];
      const conflict = checkScheduleConflict(course, existingCourses);
      if (conflict.hasConflict) {
        const conflictingCourseName = conflict.conflictingCourse?.subjectName || '다른 강의';
        setToast({ 
          open: true, 
          message: `[시간표 충돌] ${course.subjectName}의 시간표가 ${conflictingCourseName}와 충돌합니다.`, 
          severity: 'error' 
        });
        return;
      }

      // 프론트엔드 검증: 학점 초과 체크 (장바구니 + 신청 완료 강의 모두 포함)
      const currentTotalCredits = calculateTotalCredits([...cart, ...registered]);
      const newTotalCredits = currentTotalCredits + course.credits;
      if (isCreditLimitExceeded(currentTotalCredits, course.credits)) {
        const remainingCredits = 21 - currentTotalCredits;
        setToast({ 
          open: true, 
          message: `[학점 초과] 최대 수강 가능 학점(21학점)을 초과합니다. (현재: ${currentTotalCredits}학점, 추가 시: ${newTotalCredits}학점, 남은 학점: ${remainingCredits}학점)`, 
          severity: 'error' 
        });
        return;
      }

      // 모든 검증 통과 후 API 호출
      setLoading(true);
      setError(null);

      // 현재 페이지 저장
      const currentPage = pagination.page;

      const response = await addToCarts([course.id]);

      if (response.success) {
        // 장바구니 다시 조회
        await fetchCarts();
        // 강의 목록도 다시 조회하여 isInCart 상태 업데이트 (현재 페이지 유지)
        await fetchCourses(currentPage);
        setToast({ open: true, message: `${course.subjectName}이(가) 장바구니에 추가되었습니다.`, severity: 'success' });
      } else {
        setToast({ open: true, message: response.message || '장바구니에 추가하는 중 오류가 발생했습니다.', severity: 'error' });
      }
    } catch (err) {
      console.error('장바구니 추가 실패:', err);
      setToast({ open: true, message: err.response?.data?.message || err.message || '장바구니에 추가하는 중 오류가 발생했습니다.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [cart, registered, pagination, fetchCarts, fetchCourses]);

  // 장바구니에서 제거
  const removeFromCart = useCallback(async (courseIdOrCartId) => {
    try {
      setLoading(true);
      setError(null);

      // 현재 페이지 저장
      const currentPage = pagination.page;

      // cartId 찾기 (courseId로도 찾을 수 있도록)
      const cartItem = cart.find((c) => c.id === courseIdOrCartId || c.cartId === courseIdOrCartId);
      if (!cartItem || !cartItem.cartId) {
        setError('장바구니 항목을 찾을 수 없습니다.');
        return;
      }

      const response = await removeFromCarts([cartItem.cartId]);

      if (response.success) {
        // 장바구니 다시 조회
        await fetchCarts();
        // 강의 목록도 다시 조회하여 isInCart 상태 업데이트 (현재 페이지 유지)
        await fetchCourses(currentPage);
        setToast({ open: true, message: '장바구니에서 제거되었습니다.', severity: 'success' });
      } else {
        setToast({ open: true, message: response.message || '장바구니에서 제거하는 중 오류가 발생했습니다.', severity: 'error' });
      }
    } catch (err) {
      console.error('장바구니 제거 실패:', err);
      setToast({ open: true, message: err.response?.data?.message || err.message || '장바구니에서 제거하는 중 오류가 발생했습니다.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [cart, pagination, fetchCarts, fetchCourses]);

  // 장바구니 전체 제거
  const clearAllCarts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await clearCarts();

      if (response.success) {
        // 장바구니 다시 조회
        await fetchCarts();
        // 강의 목록도 다시 조회하여 isInCart 상태 업데이트
        await fetchCourses(pagination.page);
        setToast({ open: true, message: '장바구니가 비워졌습니다.', severity: 'success' });
      } else {
        setToast({ open: true, message: response.message || '장바구니를 비우는 중 오류가 발생했습니다.', severity: 'error' });
      }
    } catch (err) {
      console.error('장바구니 전체 제거 실패:', err);
      setToast({ open: true, message: err.response?.data?.message || err.message || '장바구니를 비우는 중 오류가 발생했습니다.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [pagination, fetchCarts, fetchCourses]);

  // 수강신청 확정 (장바구니에서)
  const confirmRegistration = useCallback(async () => {
    if (cart.length === 0) {
      setError('장바구니가 비어있습니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 현재 페이지 저장
      const currentPage = pagination.page;

      const courseIds = cart.map((c) => c.id).filter(Boolean);
      const response = await enrollFromCart(courseIds);

      if (response.success) {
        const { succeeded = [], failed = [] } = response.data || {};
        
        if (succeeded.length > 0) {
          // 성공한 강의들을 registered에 추가
          const succeededCourses = succeeded.map((item) => {
            const cartItem = cart.find((c) => c.id === item.courseId);
            return cartItem ? { ...cartItem, enrollmentId: item.enrollmentId } : null;
          }).filter(Boolean);
          
          setRegistered(prev => [...prev, ...succeededCourses]);
        }

        if (failed.length > 0) {
          const failedMessages = failed.map((f) => `${f.courseName}: ${f.message}`).join(', ');
          setToast({ open: true, message: `일부 강의 수강신청에 실패했습니다: ${failedMessages}`, severity: 'error' });
        } else {
          // 모든 강의가 성공한 경우
          await fetchCarts(); // 장바구니 다시 조회 (서버에서 자동 제거됨)
          await fetchCourses(currentPage); // 강의 목록 다시 조회 (현재 페이지 유지)
          setToast({ open: true, message: '수강신청이 완료되었습니다.', severity: 'success' });
        }
      } else {
        setToast({ open: true, message: response.message || '수강신청 중 오류가 발생했습니다.', severity: 'error' });
      }
    } catch (err) {
      console.error('수강신청 실패:', err);
      setToast({ open: true, message: err.response?.data?.message || err.message || '수강신청 중 오류가 발생했습니다.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [cart, pagination, fetchCarts, fetchCourses]);

  // 직접 수강신청 (개별 강의)
  const handleEnroll = useCallback(async (course) => {
    try {
      // 이미 신청 완료된 강의인지 확인
      if (registered.find((c) => c.id === course.id)) {
        setToast({ open: true, message: '이미 수강신청이 완료된 강의입니다.', severity: 'warning' });
        return;
      }

      // 클라이언트 측 검증: 정원 체크
      if (course.isFull || course.currentStudents >= course.maxStudents) {
        setToast({ open: true, message: '[정원 마감] 수강 정원이 마감되었습니다.', severity: 'error' });
        return;
      }

      // 클라이언트 측 검증: 시간표 충돌 체크 (장바구니 + 신청 완료 강의 모두 포함)
      const existingCourses = [...cart, ...registered];
      const conflict = checkScheduleConflict(course, existingCourses);
      if (conflict.hasConflict) {
        const conflictingCourseName = conflict.conflictingCourse?.subjectName || '다른 강의';
        setToast({ 
          open: true, 
          message: `[시간표 충돌] ${course.subjectName}의 시간표가 ${conflictingCourseName}와 충돌합니다.`, 
          severity: 'error' 
        });
        return;
      }

      // 클라이언트 측 검증: 학점 제한 체크 (장바구니 + 신청 완료 강의 모두 포함)
      const currentTotalCredits = calculateTotalCredits([...cart, ...registered]);
      const newTotalCredits = currentTotalCredits + course.credits;
      if (isCreditLimitExceeded(currentTotalCredits, course.credits)) {
        const remainingCredits = 21 - currentTotalCredits;
        setToast({ 
          open: true, 
          message: `[학점 초과] 최대 수강 가능 학점(21학점)을 초과합니다. (현재: ${currentTotalCredits}학점, 추가 시: ${newTotalCredits}학점, 남은 학점: ${remainingCredits}학점)`, 
          severity: 'error' 
        });
        return;
      }

      // 모든 검증 통과 후 API 호출
      setLoading(true);
      setError(null);

      // 현재 페이지 저장
      const currentPage = pagination.page;

      const response = await enrollFromCart([course.id]);

      if (response.success) {
        const { succeeded = [], failed = [] } = response.data || {};
        
        if (succeeded.length > 0) {
          const enrolledCourse = { ...course, enrollmentId: succeeded[0].enrollmentId };
          setRegistered(prev => [...prev, enrolledCourse]);
        }

        if (failed.length > 0) {
          setToast({ open: true, message: failed[0].message || '수강신청에 실패했습니다.', severity: 'error' });
        } else {
          await fetchCarts(); // 장바구니 다시 조회
          await fetchCourses(currentPage); // 강의 목록 다시 조회 (현재 페이지 유지)
          setToast({ open: true, message: `${course.subjectName} 수강신청이 완료되었습니다.`, severity: 'success' });
        }
      } else {
        setToast({ open: true, message: response.message || '수강신청 중 오류가 발생했습니다.', severity: 'error' });
      }
    } catch (err) {
      console.error('수강신청 실패:', err);
      setToast({ open: true, message: err.response?.data?.message || err.message || '수강신청 중 오류가 발생했습니다.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [cart, registered, pagination, fetchCarts, fetchCourses]);

  // Enter 키 입력 시 즉시 검색
  const handleSearchKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && enrollmentPeriodId) {
      setPagination(prev => ({ ...prev, page: 0 }));
      fetchCourses(0);
    }
  }, [enrollmentPeriodId, fetchCourses]);

  // 총 학점 계산
  const totalCredits = cart.reduce((sum, course) => sum + course.credits, 0);
  const registeredCredits = registered.reduce((sum, course) => sum + course.credits, 0);

  return {
    // 상태
    tabValue,
    setTabValue,
    searchTerm,
    setSearchTerm,
    selectedDepartment,
    setSelectedDepartment,
    selectedCourseType,
    setSelectedCourseType,
    selectedCredits,
    setSelectedCredits,
    cart,
    registered,
    courses,
    loading,
    error,
    pagination,
    totalCredits,
    registeredCredits,
    
    // 핸들러
    handlePageChange,
    addToCart,
    removeFromCart,
    clearAllCarts,
    confirmRegistration,
    handleSearchKeyPress,
    handleEnroll,
    setError,
    // 토스트
    toast,
    setToast,
  };
};

export default useCourseRegistration;
