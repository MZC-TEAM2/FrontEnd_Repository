/**
 * 강의 관련 API 함수
 * 
 * 주요 기능:
 * - 수강신청 기간 조회
 * - 강의 목록 조회 (검색, 필터링, 정렬, 페이지네이션)
 * - 강의 상세 조회
 */

import axiosInstance from './axiosInstance';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 현재 수강신청 기간 조회 (학생용 - ENROLLMENT 타입)
 * @returns {Promise} 수강신청 기간 정보 (enrollmentPeriodId, periodType 포함)
 */
export const getCurrentEnrollmentPeriod = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/api/v1/enrollments/periods/current`);

  if (response.data?.success && response.data.data?.currentPeriod) {
    const period = response.data.data.currentPeriod;
    
    console.log(period);
  }
  return response.data;
};

/**
 * 강의 목록 조회 (검색, 필터링, 정렬, 페이지네이션)
 * 
 * @param {Object} params - 쿼리 파라미터
 * @param {number} params.page - 페이지 번호 (기본값: 0)
 * @param {number} params.size - 페이지 크기 (기본값: 10)
 * @param {string} params.keyword - 검색어 (과목명, 과목코드, 교수명)
 * @param {number|null} params.departmentId - 학과 ID (전체: null)
 * @param {string|null} params.courseType - 이수구분 (MAJOR_REQ, MAJOR_ELEC, GEN_REQ, GEN_ELEC)
 * @param {number|null} params.credits - 학점 (1, 2, 3, 4)
 * @param {number} params.enrollmentPeriodId - 학기 수강신청 기간 ID (필수)
 * @param {string} params.sort - 정렬 (기본값: courseCode,asc)
 * @returns {Promise} 강의 목록 및 페이지네이션 정보
 */
export const getCourses = async (params = {}) => {
  const {
    page = 0,
    size = 10,
    keyword = '',
    departmentId = null,
    courseType = null,
    credits = null,
    enrollmentPeriodId,
    sort = 'courseCode,asc',
  } = params;

  // 쿼리 파라미터 구성
  const queryParams = new URLSearchParams();
  
  queryParams.append('page', page);
  queryParams.append('size', size);
  queryParams.append('sort', sort);
  
  if (enrollmentPeriodId) {
    queryParams.append('enrollmentPeriodId', enrollmentPeriodId);
  }
  
  if (keyword) {
    queryParams.append('keyword', keyword);
  }
  
  if (departmentId !== null && departmentId !== '') {
    queryParams.append('departmentId', departmentId);
  }
  
  if (courseType) {
    queryParams.append('courseType', courseType);
  }
  
  if (credits !== null && credits !== '') {
    queryParams.append('credits', credits);
  }

  // 수강신청 기간 중 강의 목록 조회는 /api/v1/enrollment/courses 사용
  const response = await axiosInstance.get(
    `${BASE_URL}/api/v1/enrollments/courses?${queryParams.toString()}`
  );

  return response.data;
};

/**
 * 강의 상세 조회
 * 
 * @param {number} courseId - 강의 ID
 * @returns {Promise} 강의 상세 정보
 */
export const getCourseDetail = async (courseId) => {
  const response = await axiosInstance.get(`${BASE_URL}/api/v1/courses/${courseId}`);
  return response.data;
};

/**
 * 학과 목록 조회 (필터용)
 * TODO: API 스펙 확인 후 구현
 * @returns {Promise} 학과 목록
 */
export const getDepartments = async () => {
  // API 엔드포인트 확인 필요
  // const response = await axiosInstance.get('/api/v1/departments');
  // return response.data;
  
  // 임시로 빈 배열 반환
  return { success: true, data: [] };
};

/**
 * 장바구니 조회
 * @returns {Promise} 장바구니 목록
 */
export const getCarts = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/api/v1/carts`);
  return response.data;
};

/**
 * 장바구니에 강의 추가 (bulk)
 * @param {number[]} courseIds - 강의 ID 배열
 * @returns {Promise} 추가 결과
 */
export const addToCarts = async (courseIds) => {
  const response = await axiosInstance.post(`${BASE_URL}/api/v1/carts/bulk`, {
    courseIds,
  });
  return response.data;
};

/**
 * 장바구니에서 강의 제거 (bulk)
 * @param {number[]} cartIds - 장바구니 ID 배열
 * @returns {Promise} 제거 결과
 */
export const removeFromCarts = async (cartIds) => {
  const response = await axiosInstance.delete(`${BASE_URL}/api/v1/carts/bulk`, {
    data: { cartIds },
  });
  return response.data;
};

/**
 * 장바구니 전체 제거
 * @returns {Promise} 제거 결과
 */
export const clearCarts = async () => {
  const response = await axiosInstance.delete(`${BASE_URL}/api/v1/carts`);
  return response.data;
};

/**
 * 장바구니에서 수강신청 확정
 * @param {number[]} courseIds - 강의 ID 배열
 * @returns {Promise} 수강신청 결과
 */
export const enrollFromCart = async (courseIds) => {
  const response = await axiosInstance.post(`${BASE_URL}/api/v1/enrollments/bulk`, {
    courseIds,
  });
  return response.data;
};

/**
 * 내 수강신청 목록 조회
 * @param {number|null} enrollmentPeriodId - 학기 수강신청 기간 ID (선택, 미입력시 현재 학기)
 * @returns {Promise} 수강신청 목록 및 요약 정보
 */
export const getMyEnrollments = async (enrollmentPeriodId = null) => {
  const queryParams = new URLSearchParams();
  
  if (enrollmentPeriodId) {
    queryParams.append('enrollmentPeriodId', enrollmentPeriodId);
  }

  const url = queryParams.toString() 
    ? `${BASE_URL}/api/v1/enrollments/my?${queryParams.toString()}`
    : `${BASE_URL}/api/v1/enrollments/my`;
    
  const response = await axiosInstance.get(url);
  return response.data;
};

/**
 * 수강신청 취소 (bulk)
 * @param {number[]} enrollmentIds - 수강신청 ID 배열
 * @returns {Promise} 취소 결과
 */
export const cancelEnrollments = async (enrollmentIds) => {
  const response = await axiosInstance.delete(`${BASE_URL}/api/v1/enrollments/bulk`, {
    data: { enrollmentIds },
  });
  return response.data;
};