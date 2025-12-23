/**
 * 교수용 강의 관리 API 함수
 * 
 * 주요 기능:
 * - 내가 담당하는 강의 목록 조회
 * - 강의 등록
 * - 강의 수정
 * - 강의 삭제
 * - 주차별 콘텐츠 관리
 */

import axiosInstance from './axiosInstance';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 강의 등록 기간 조회 (교수용)
 * @returns {Promise} 강의 등록 기간 정보 (periodType: COURSE_REGISTRATION)
 */
export const getCurrentCourseRegistrationPeriod = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/api/v1/enrollments/periods/current?type=COURSE_REGISTRATION`);
  
  // periodType이 COURSE_REGISTRATION인 기간만 필터링
  if (response.data?.success && response.data.data?.currentPeriod) {

    const period = response.data.data.currentPeriod;
    if (period.periodType?.typeCode === 'COURSE_REGISTRATION') {
      return response.data;
    } else {
      // 강의 등록 기간이 아닌 경우
      return {
        success: false,
        error: {
          code: 'COURSE_REGISTRATION_PERIOD_NOT_ACTIVE',
          message: '현재 강의 등록 기간이 아닙니다.',
        },
        data: null,
      };
    }
  }
  
  return response.data;
};

/**
 * 내가 담당하는 강의 목록 조회
 * @param {Object} params - 쿼리 파라미터
 * @param {number} params.academicTermId - 학기 ID (필수)
 * @param {string} params.status - 강의 상태 (DRAFT, PUBLISHED, CLOSED)
 * @returns {Promise} 강의 목록
 */
export const getMyCourses = async (params = {}) => {
  const { academicTermId, status } = params;
  
  const queryParams = new URLSearchParams();
  
  // academicTermId는 0일 수도 있으므로(null/undefined만 제외)
  if (academicTermId !== null && academicTermId !== undefined) {
    queryParams.append('academicTermId', academicTermId);
  }
  
  if (status) {
    queryParams.append('status', status);
  }

  const url = queryParams.toString() 
    ? `${BASE_URL}/api/v1/professor/courses?${queryParams.toString()}`
    : `${BASE_URL}/api/v1/professor/courses`;
    
  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    // 404 에러를 명확히 전달
    if (error.response?.status === 404) {
      throw {
        status: 404,
        message: 'API 엔드포인트를 찾을 수 없습니다. 백엔드 API가 구현되었는지 확인해주세요.',
        response: error.response,
      };
    }
    throw error;
  }
};

/**
 * 강의 등록
 * @param {Object} courseData - 강의 정보
 * @returns {Promise} 등록된 강의 정보
 */
export const createCourse = async (courseData) => {
  
  const response = await axiosInstance.post(
    `${BASE_URL}/api/v1/professor/courses`,
    courseData
  );
  
  return response.data;
};

/**
 * 강의 수정
 * @param {number} courseId - 강의 ID
 * @param {Object} courseData - 수정할 강의 정보
 * @returns {Promise} 수정된 강의 정보
 */
export const updateCourse = async (courseId, courseData) => {
  const response = await axiosInstance.put(
    `${BASE_URL}/api/v1/professor/courses/${courseId}`,
    courseData
  );
  return response.data;
};

/**
 * 강의 삭제
 * @param {number} courseId - 강의 ID
 * @returns {Promise} 삭제 결과
 */
export const deleteCourse = async (courseId) => {
  const response = await axiosInstance.delete(
    `${BASE_URL}/api/v1/professor/courses/${courseId}`
  );
  return response.data;
};

/**
 * 강의 상세 조회 (교수용)
 * @param {number} courseId - 강의 ID
 * @returns {Promise} 강의 상세 정보
 */
export const getCourseDetailForProfessor = async (courseId) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/api/v1/professor/courses/${courseId}`
  );
  return response.data;
};

/**
 * 주차 생성
 * @param {number} courseId - 강의 ID
 * @param {Object} weekData - 주차 정보
 * @param {number} weekData.weekNumber - 주차 번호
 * @param {string} weekData.weekTitle - 주차 제목
 * @param {Array} weekData.contents - 콘텐츠 배열 (선택)
 * @param {string} weekData.contents[].contentType - 콘텐츠 유형 (VIDEO, DOCUMENT, LINK, QUIZ)
 * @param {string} weekData.contents[].title - 콘텐츠 제목
 * @param {string} weekData.contents[].contentUrl - 콘텐츠 URL
 * @param {string} weekData.contents[].duration - 재생 시간 (VIDEO인 경우, 형식: "HH:MM:SS" 또는 "MM:SS")
 * @param {number} weekData.contents[].order - 콘텐츠 순서 (선택, 기본값: 마지막 순서)
 * @returns {Promise} 생성된 주차 정보
 */
export const createWeek = async (courseId, weekData) => {

  const response = await axiosInstance.post(
    `${BASE_URL}/api/v1/professor/courses/${courseId}/weeks`,
    weekData
  );
  
  return response.data;
};

/**
 * 주차 수정
 * @param {number} courseId - 강의 ID
 * @param {number} weekId - 주차 ID
 * @param {Object} weekData - 수정할 주차 정보
 * @returns {Promise} 수정된 주차 정보
 */
export const updateWeek = async (courseId, weekId, weekData) => {
  const response = await axiosInstance.put(
    `${BASE_URL}/api/v1/professor/courses/${courseId}/weeks/${weekId}`,
    weekData
  );
  return response.data;
};

/**
 * 주차 삭제
 * @param {number} courseId - 강의 ID
 * @param {number} weekId - 주차 ID
 * @returns {Promise} 삭제 결과
 */
export const deleteWeek = async (courseId, weekId) => {
  const response = await axiosInstance.delete(
    `${BASE_URL}/api/v1/professor/courses/${courseId}/weeks/${weekId}`
  );
  return response.data;
};

/**
 * 주차별 콘텐츠 추가
 * @param {number} courseId - 강의 ID
 * @param {number} weekId - 주차 ID
 * @param {Object} contentData - 콘텐츠 정보 (application/json)
 * @param {string} contentData.contentType - 콘텐츠 유형 (DOCUMENT, LINK, ...)
 * @param {string} contentData.title - 제목
 * @param {string} [contentData.description] - 설명(선택)
 * @param {string} contentData.contentUrl - 자료/강의 링크 URL
 * @returns {Promise} 생성된 콘텐츠 정보
 */
export const createContent = async (courseId, weekId, contentData) => {
  const response = await axiosInstance.post(
    `${BASE_URL}/api/v1/professor/courses/${courseId}/weeks/${weekId}/contents`,
    contentData
  );
  return response.data;
};

/**
 * 콘텐츠 수정
 * @param {number} contentId - 콘텐츠 ID
 * @param {Object} contentData - 수정할 콘텐츠 정보
 * @returns {Promise} 수정된 콘텐츠 정보
 */
export const updateContent = async (contentId, contentData) => {
  const response = await axiosInstance.put(
    `${BASE_URL}/api/v1/professor/contents/${contentId}`,
    contentData
  );
  return response.data;
};

/**
 * 콘텐츠 삭제
 * @param {number} contentId - 콘텐츠 ID
 * @returns {Promise} 삭제 결과
 */
export const deleteContent = async (contentId) => {
  const response = await axiosInstance.delete(
    `${BASE_URL}/api/v1/professor/contents/${contentId}`
  );
  return response.data;
};

/**
 * 주차 목록 조회 (교수용 - 콘텐츠 포함)
 * @param {number} courseId - 강의 ID
 * @returns {Promise} 주차 목록
 */
export const getWeeksForProfessor = async (courseId) => {
  // 최신 스펙(12.1): 교수/수강중 학생 공용
  // GET /api/v1/courses/{courseId}/weeks
  // 교수 페이지에서도 "목록 조회"는 공용 경로를 사용.
  const commonUrl = `${BASE_URL}/api/v1/courses/${courseId}/weeks`;


  try {
    const response = await axiosInstance.get(commonUrl);
    return response.data;
  } catch (eCommon) {
    // 구버전 백엔드 fallback (기존 professor 경로가 살아있는 환경)
    if (eCommon?.status === 404 || eCommon?.status === 405) {
      const legacyUrl = `${BASE_URL}/api/v1/professor/courses/${courseId}/weeks`;
      const response = await axiosInstance.get(legacyUrl);
      return response.data;
    }
    throw eCommon;
  }
};

/**
 * 과목 검색 (간단 버전, 페이징 지원)
 * @param {string} query - 검색어 (과목명 또는 과목코드, 최소 2글자)
 * @param {number} page - 페이지 번호 (기본값: 0)
 * @param {number} size - 페이지 크기 (기본값: 20, 최대: 50)
 * @returns {Promise} 과목 목록 (페이징)
 */
export const searchSubjects = async (query, page = 0, size = 20) => {
  const queryParams = new URLSearchParams();
  queryParams.append('q', query);
  queryParams.append('page', page);
  queryParams.append('size', size);
  
  const url = `${BASE_URL}/api/v1/subjects/search?${queryParams.toString()}`;
  const response = await axiosInstance.get(url);
  return response.data;
};

/**
 * 과목 목록 조회
 * @param {Object} params - 쿼리 파라미터
 * @param {number} params.page - 페이지 번호 (기본값: 0)
 * @param {number} params.size - 페이지 크기 (기본값: 20)
 * @param {string} params.keyword - 과목명 또는 과목코드 검색
 * @param {number} params.departmentId - 학과 필터
 * @param {string} params.courseType - 이수구분 필터
 * @param {number} params.credits - 학점 필터
 * @param {boolean} params.isActive - 활성 과목만 조회 (기본값: true)
 * @returns {Promise} 과목 목록 (페이징)
 */
export const getSubjects = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.departmentId) queryParams.append('departmentId', params.departmentId);
  if (params.courseType) queryParams.append('courseType', params.courseType);
  if (params.credits) queryParams.append('credits', params.credits);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
  
  const url = queryParams.toString()
    ? `${BASE_URL}/api/v1/subjects?${queryParams.toString()}`
    : `${BASE_URL}/api/v1/subjects`;
  
  
  const response = await axiosInstance.get(url);
  return response.data;
};

/**
 * 과목 상세 조회
 * @param {number} subjectId - 과목 ID
 * @returns {Promise} 과목 상세 정보
 */
export const getSubjectDetail = async (subjectId) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/api/v1/subjects/${subjectId}`
  );
  return response.data;
};

