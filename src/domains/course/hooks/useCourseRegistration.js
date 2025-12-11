import { useState, useEffect, useCallback, useRef } from 'react';
import { getCurrentEnrollmentPeriod, getCourses } from '../../../api/courseApi';

/**
 * 수강신청 관련 커스텀 훅
 */
const useCourseRegistration = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCourseType, setSelectedCourseType] = useState('all');
  const [selectedCredits, setSelectedCredits] = useState('all');
  const [sortBy, setSortBy] = useState('courseCode,asc');
  const [cart, setCart] = useState([]);
  const [registered, setRegistered] = useState([]);

  // API 관련 상태
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enrollmentPeriodId, setenrollmentPeriodId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    total: 0,
    totalPages: 0,
  });

  // 이수구분 코드 매핑
  const courseTypeMap = {
    '전공필수': 1,
    '전공선택': 2,
    '교양필수': 3,
    '교양선택': 4,
  };

  // API 응답 데이터를 UI 형식으로 변환
  const transformCourseData = (apiCourse) => {
    return {
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
      canEnroll: apiCourse.canEnroll || false,
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
            page: response.data.number !== undefined ? response.data.number : currentPage,
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
  }, [enrollmentPeriodId, selectedDepartment, selectedCourseType, selectedCredits, sortBy, pagination.size]);

  // enrollmentPeriodId가 설정되면 강의 목록 조회
  useEffect(() => {
    if (enrollmentPeriodId) {
      fetchCourses(0); // 명시적으로 page 0 전달
    }
  }, [enrollmentPeriodId]); // fetchCourses 의존성 제거

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

  // 장바구니에 추가
  const addToCart = useCallback((course) => {
    setCart(prev => {
      if (!prev.find((c) => c.id === course.id)) {
        return [...prev, course];
      }
      return prev;
    });
  }, []);

  // 장바구니에서 제거
  const removeFromCart = useCallback((courseId) => {
    setCart(prev => prev.filter((c) => c.id !== courseId));
  }, []);

  // 수강신청 확정
  const confirmRegistration = useCallback(() => {
    setRegistered(prev => [...prev, ...cart]);
    setCart([]);
    alert('수강신청이 완료되었습니다!');
  }, [cart]);

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
    confirmRegistration,
    handleSearchKeyPress,
    setError,
  };
};

export default useCourseRegistration;
