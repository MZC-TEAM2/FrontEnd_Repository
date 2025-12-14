import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  getCurrentEnrollmentPeriod, 
  getCourses,
  getCarts,
  addToCarts,
  removeFromCarts,
  clearCarts,
  enrollFromCart,
  getMyEnrollments,
  cancelEnrollments,
} from '../../../api/courseApi';
import { checkScheduleConflict } from '../utils/scheduleUtils';
import { isCreditLimitExceeded, calculateTotalCredits } from '../utils/creditUtils';
import { courseTypeMap } from '../constants/courseTypes';
import { transformCourseData, transformCartData, transformEnrollmentData } from '../transformers/courseTransformers';

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

  // 수강신청 확인 다이얼로그 상태
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [pendingEnrollCourse, setPendingEnrollCourse] = useState(null);



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

  // 검색어와 필터를 ref로 관리하여 fetchCourses 재생성 방지
  const searchTermRef = useRef(searchTerm);
  const selectedDepartmentRef = useRef(selectedDepartment);
  const selectedCourseTypeRef = useRef(selectedCourseType);
  const selectedCreditsRef = useRef(selectedCredits);
  
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);
  
  useEffect(() => {
    selectedDepartmentRef.current = selectedDepartment;
  }, [selectedDepartment]);
  
  useEffect(() => {
    selectedCourseTypeRef.current = selectedCourseType;
  }, [selectedCourseType]);
  
  useEffect(() => {
    selectedCreditsRef.current = selectedCredits;
  }, [selectedCredits]);

  // 강의 목록 조회
  const fetchCourses = useCallback(async (page = null, silent = false) => {
    if (!enrollmentPeriodId) return;

    console.log('[API 호출] fetchCourses', { page, silent, timestamp: new Date().toISOString() });

    try {
      if (!silent) {
        setLoading(true);
      }
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

      // 학과 필터 (ref 사용)
      if (selectedDepartmentRef.current !== 'all') {
        params.departmentId = parseInt(selectedDepartmentRef.current);
      }

      // 이수구분 필터 (ref 사용)
      if (selectedCourseTypeRef.current !== 'all') {
        params.courseType = courseTypeMap[selectedCourseTypeRef.current];
      }

      // 학점 필터 (ref 사용)
      if (selectedCreditsRef.current !== 'all') {
        params.credits = parseInt(selectedCreditsRef.current);
      }

      const response = await getCourses(params);

      console.log('[API 응답] fetchCourses', { response, timestamp: new Date().toISOString() });

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
      if (!silent) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentPeriodId, sortBy, pagination.size]); // 필터는 ref로 관리하여 재생성 방지

  // enrollmentPeriodId가 설정되면 강의 목록, 장바구니, 수강신청 목록 조회
  useEffect(() => {
    if (enrollmentPeriodId && !initialLoadCompleteRef.current) {
      // 초기 로딩 시 loading 상태를 한 번만 관리
      setLoading(true);
      initialLoadCompleteRef.current = false; // 초기 로딩 시작
      
      // 병렬로 실행하되, 모든 API 완료 후 loading을 false로 설정
      Promise.all([
        fetchCourses(0, true), // silent 모드로 실행 (loading 변경 없음)
        fetchCarts(), // 장바구니 조회 (loading 변경 없음)
        fetchEnrollments(enrollmentPeriodId), // 수강신청 목록 조회 (loading 변경 없음)
      ]).then(() => {
        setLoading(false);
        initialLoadCompleteRef.current = true; // 초기 로딩 완료
      }).catch(err => {
        console.error('초기 데이터 로딩 실패:', err);
        setLoading(false);
        initialLoadCompleteRef.current = true; // 에러 발생 시에도 완료로 표시
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentPeriodId]); // fetchCourses, fetchCarts, fetchEnrollments는 ref로 관리하여 무한 루프 방지

  // 초기 로딩 완료 플래그
  const initialLoadCompleteRef = useRef(false);
  
  // 검색어 debounce (초기 로딩 완료 후에만 실행)
  useEffect(() => {
    if (!enrollmentPeriodId || !initialLoadCompleteRef.current) return;
    // if (searchTerm === '') return; // 빈 검색어는 무시 (초기 로딩과 중복 방지)

    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 0 }));
      fetchCoursesRef.current(0); // ref 사용하여 불필요한 API 호출 방지
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, enrollmentPeriodId]); // fetchCourses 제거하여 리렌더링 시 불필요한 API 호출 방지
  
  // 필터 변경 시 강의 목록 다시 조회 (초기 로딩 완료 후에만)
  useEffect(() => {
    if (!enrollmentPeriodId || !initialLoadCompleteRef.current) return;
    
    setPagination(prev => ({ ...prev, page: 0 }));
    fetchCoursesRef.current(0);
  }, [selectedDepartment, selectedCourseType, selectedCredits, enrollmentPeriodId]);

  // fetchCourses 함수를 ref로 관리하여 메모이제이션 사용
  const fetchCoursesRef = useRef(fetchCourses);
  useEffect(() => {
    fetchCoursesRef.current = fetchCourses;
  }, [fetchCourses]);

  // 페이지 변경 핸들러 (fetchCoursesRef 사용하여 재생성 방지)
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchCoursesRef.current(newPage);
  }, []); // dependency 없음 - ref 사용

  // 장바구니 조회
  const fetchCarts = useCallback(async () => {
    console.log('[API 호출] fetchCarts', { timestamp: new Date().toISOString() });
    try {
      const response = await getCarts();

      console.log('[API 응답] fetchCarts', { response, timestamp: new Date().toISOString() });

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

  // 수강신청 목록 조회
  const fetchEnrollments = useCallback(async (periodId = null) => {
    console.log('[API 호출] fetchEnrollments', { periodId, timestamp: new Date().toISOString() });
    try {
      const response = await getMyEnrollments(periodId || enrollmentPeriodId);

      console.log('[API 응답] fetchEnrollments', { response, timestamp: new Date().toISOString() });

      if (response.success && response.data?.enrollments) {
        const transformedEnrollments = response.data.enrollments.map(transformEnrollmentData);
        setRegistered(transformedEnrollments);
      } else {
        // 응답이 없거나 실패한 경우 빈 배열로 설정
        setRegistered([]);
      }
    } catch (err) {
      console.error('수강신청 목록 조회 실패:', err);
      // 에러 발생 시에도 빈 배열로 설정하여 UI가 정상 작동하도록
      setRegistered([]);
    }
  }, []);

  // 장바구니에 추가
  // 주의: 장바구니 추가는 정원이 꽉 차도 가능 (정원 체크 제외)
  // 검증 항목: 시간표 충돌, 학점 초과만 체크
  const addToCart = useCallback(async (course) => {
    try {
      console.log('[API 호출] addToCart', { course, timestamp: new Date().toISOString() });

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

      // 동일 과목코드 다른 분반 체크 (장바구니 + 신청 완료 강의 모두 포함)
      const duplicateSubject = [...cart, ...registered].find(
        (c) => c.subjectCode === course.subjectCode && c.id !== course.id
      );
      if (duplicateSubject) {
        setToast({ 
          open: true, 
          message: `[분반 중복] ${course.subjectName}(${course.subjectCode})는 이미 다른 분반이 장바구니에 있거나 수강신청되어 있습니다.`, 
          severity: 'error' 
        });
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

      const response = await addToCarts([course.id]);

      if (response.success) {
        // 장바구니 다시 조회
        await fetchCarts();
        // 강의 목록에서 직접 isInCart 상태 업데이트 (불필요한 API 호출 제거)
        setCourses(prevCourses => 
          prevCourses.map(c => 
            c.id === course.id ? { ...c, isInCart: true } : c
          )
        );
        
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
  }, [cart, registered, fetchCarts]);

  // 장바구니에서 제거
  const removeFromCart = useCallback(async (courseIdOrCartId) => {
    try {
      console.log('[API 호출] removeFromCart', { courseIdOrCartId, timestamp: new Date().toISOString() });
      setLoading(true);
      setError(null);

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
        // 강의 목록에서 직접 isInCart 상태 업데이트 (불필요한 API 호출 제거)
        setCourses(prevCourses => 
          prevCourses.map(c => 
            c.id === cartItem.id ? { ...c, isInCart: false } : c
          )
        );
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
  }, [cart, fetchCarts]);

  // 장바구니 전체 제거
  const clearAllCarts = useCallback(async () => {
    try {
      console.log('[API 호출] clearAllCarts', { timestamp: new Date().toISOString() });
      setLoading(true);
      setError(null);

      const response = await clearCarts();

      if (response.success) {
        // 장바구니 다시 조회
        await fetchCarts();
        // 강의 목록에서 직접 isInCart 상태 업데이트 (불필요한 API 호출 제거)
        setCourses(prevCourses => 
          prevCourses.map(c => ({ ...c, isInCart: false }))
        );
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
  }, [fetchCarts]);

  // 수강신청 확정 (장바구니에서)
  const confirmRegistration = useCallback(async () => {
    if (cart.length === 0) {
      setError('장바구니가 비어있습니다.');
      return;
    }

    try {
      console.log('[API 호출] confirmRegistration', { timestamp: new Date().toISOString() });
      
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

        // 성공한 항목이 있으면 장바구니를 다시 조회 (서버에서 자동 제거됨)
        if (succeeded.length > 0) {
          await fetchCarts(); // 장바구니 다시 조회
          await fetchEnrollments(enrollmentPeriodId); // 수강신청 목록 다시 조회
          await fetchCourses(currentPage); // 강의 목록 다시 조회 (현재 페이지 유지)
        }

        // 결과 메시지 표시
        if (failed.length > 0) {
          const failedMessages = failed.map((f) => `${f.courseName}: ${f.message}`).join(', ');
          setToast({ 
            open: true, 
            message: succeeded.length > 0 
              ? `${succeeded.length}개 과목 수강신청 완료, 일부 실패: ${failedMessages}` 
              : `수강신청 실패: ${failedMessages}`, 
            severity: succeeded.length > 0 ? 'warning' : 'error' 
          });
        } else {
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
  }, [cart, pagination, enrollmentPeriodId, fetchCarts, fetchCourses, fetchEnrollments]);

  // 직접 수강신청 클릭 - 확인 다이얼로그 열기
  const handleEnrollClick = useCallback((course) => {
    setPendingEnrollCourse(course);
    setEnrollDialogOpen(true);
  }, []);

  // 확인 다이얼로그 닫기
  const handleEnrollDialogClose = useCallback(() => {
    setEnrollDialogOpen(false);
    setPendingEnrollCourse(null);
  }, []);

  // 직접 수강신청 (개별 강의) - 실제 신청 처리
  const handleEnroll = useCallback(async (course) => {
    try {
      // 이미 신청 완료된 강의인지 확인
      if (registered.find((c) => c.id === course.id)) {
        setToast({ open: true, message: '이미 수강신청이 완료된 강의입니다.', severity: 'warning' });
        handleEnrollDialogClose();
        return;
      }

      // 클라이언트 측 검증: 정원 체크
      if (course.isFull || course.currentStudents >= course.maxStudents) {
        setToast({ open: true, message: '[정원 마감] 수강 정원이 마감되었습니다.', severity: 'error' });
        handleEnrollDialogClose();
        return;
      }

      // 클라이언트 측 검증: 시간표 충돌 체크 (장바구니 + 신청 완료 강의 모두 포함, 단 동일 과목 제외)
      const existingCourses = [...cart, ...registered].filter((c) => c.id !== course.id);
      const conflict = checkScheduleConflict(course, existingCourses);
      if (conflict.hasConflict) {
        const conflictingCourseName = conflict.conflictingCourse?.subjectName || '다른 강의';
        setToast({ 
          open: true, 
          message: `[시간표 충돌] ${course.subjectName}의 시간표가 ${conflictingCourseName}와 충돌합니다.`, 
          severity: 'error' 
        });
        handleEnrollDialogClose();
        return;
      }

      // 클라이언트 측 검증: 학점 제한 체크
      // 장바구니에 있는 과목을 직접 신청하는 경우, 장바구니에서 제거되므로 해당 과목의 학점은 제외하고 계산
      const cartItem = cart.find((c) => c.id === course.id);
      const coursesForCreditCheck = cartItem 
        ? [...cart.filter((c) => c.id !== course.id), ...registered]  // 장바구니에 있으면 제외
        : [...cart, ...registered];  // 장바구니에 없으면 그대로
      const currentTotalCredits = calculateTotalCredits(coursesForCreditCheck);
      const newTotalCredits = currentTotalCredits + course.credits;
      if (isCreditLimitExceeded(currentTotalCredits, course.credits)) {
        const remainingCredits = 21 - currentTotalCredits;
        setToast({ 
          open: true, 
          message: `[학점 초과] 최대 수강 가능 학점(21학점)을 초과합니다. (현재: ${currentTotalCredits}학점, 추가 시: ${newTotalCredits}학점, 남은 학점: ${remainingCredits}학점)`, 
          severity: 'error' 
        });
        handleEnrollDialogClose();
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
          await fetchCarts(); // 장바구니 다시 조회 (서버에서 자동 제거됨)
          await fetchEnrollments(enrollmentPeriodId); // 수강신청 목록 다시 조회
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
      handleEnrollDialogClose(); // 다이얼로그 닫기
    }
  }, [cart, registered, pagination, enrollmentPeriodId, fetchCarts, fetchCourses, fetchEnrollments, handleEnrollDialogClose]);

  // Enter 키 입력 시 즉시 검색
  const handleSearchKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && enrollmentPeriodId) {
      setPagination(prev => ({ ...prev, page: 0 }));
      fetchCourses(0);
    }
  }, [enrollmentPeriodId, fetchCourses]);

  // 수강신청 취소
  const handleCancelEnrollment = useCallback(async (enrollmentId) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = pagination.page;

      const response = await cancelEnrollments([enrollmentId]);

      if (response.success) {
        const { cancelled = [], failed = [] } = response.data || {};
        
        if (cancelled.length > 0) {
          // 취소된 강의를 registered에서 제거
          setRegistered(prev => prev.filter(c => c.enrollmentId !== enrollmentId));
          setToast({ open: true, message: '수강신청이 취소되었습니다.', severity: 'success' });
        }

        if (failed.length > 0) {
          setToast({ open: true, message: failed[0].message || '수강신청 취소에 실패했습니다.', severity: 'error' });
        } else {
          // 취소 성공 시 목록 다시 조회
          await fetchEnrollments(enrollmentPeriodId);
          await fetchCourses(currentPage);
        }
      } else {
        setToast({ open: true, message: response.message || '수강신청 취소 중 오류가 발생했습니다.', severity: 'error' });
      }
    } catch (err) {
      console.error('수강신청 취소 실패:', err);
      setToast({ open: true, message: err.response?.data?.message || err.message || '수강신청 취소 중 오류가 발생했습니다.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [pagination, enrollmentPeriodId, fetchEnrollments, fetchCourses]);

  // 장바구니 학점 계산 (메모이제이션으로 불필요한 재계산 방지)
  const cartCredits = useMemo(() => 
    cart.reduce((sum, course) => sum + course.credits, 0), 
    [cart]
  );
  const registeredCredits = useMemo(() => 
    registered.reduce((sum, course) => sum + course.credits, 0), 
    [registered]
  );

  // pagination 객체 메모이제이션 (참조 안정화)
  const memoizedPagination = useMemo(() => pagination, [
    pagination.page,
    pagination.size,
    pagination.total,
    pagination.totalPages,
  ]);

  // toast를 ref로 관리하여 리렌더링 방지
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // 반환 객체를 완전히 메모이제이션하여 리렌더링 방지
  const stableReturn = useMemo(() => ({
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
    pagination: memoizedPagination,
    cartCredits,
    registeredCredits,
    
    // 핸들러
    handlePageChange,
    addToCart,
    removeFromCart,
    clearAllCarts,
    confirmRegistration,
    handleSearchKeyPress,
    handleEnrollClick,  // 확인 다이얼로그 열기
    handleEnroll,        // 실제 신청 처리
    handleEnrollDialogClose,  // 다이얼로그 닫기
    handleCancelEnrollment,
    setError,
    setToast,
    // 다이얼로그 상태
    enrollDialogOpen,
    pendingEnrollCourse,
    // toast ref (리렌더링 방지)
    toastRef,
  }), [
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
    memoizedPagination,
    cartCredits,
    registeredCredits,
    handlePageChange,
    addToCart,
    removeFromCart,
    clearAllCarts,
    confirmRegistration,
    handleSearchKeyPress,
    handleEnrollClick,
    handleEnroll,
    handleEnrollDialogClose,
    handleCancelEnrollment,
    setError,
    setToast,
    enrollDialogOpen,
    pendingEnrollCourse,
  ]);

  return stableReturn;
};

export default useCourseRegistration;
