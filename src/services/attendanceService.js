import axiosInstance from '../api/axiosInstance';

/**
 * 출석 관련 API 서비스
 */
const attendanceService = {
  // =====================
  // 학생용 API
  // =====================

  /**
   * 내 전체 출석 현황 조회
   * @returns {Promise<Object>} 전체 강의별 출석 현황
   */
  getMyAttendance: async () => {
    const response = await axiosInstance.get('/api/v1/attendance/my');
    return response.data;
  },

  /**
   * 특정 강의 출석 현황 조회 (주차별 상세 포함)
   * @param {number|string} courseId - 강의 ID
   * @returns {Promise<Object>} 강의 출석 상세 정보
   */
  getCourseAttendance: async (courseId) => {
    const response = await axiosInstance.get(`/api/v1/attendance/courses/${courseId}`);
    return response.data;
  },

  /**
   * 주차별 출석 상세 조회
   * @param {number|string} courseId - 강의 ID
   * @param {number|string} weekId - 주차 ID
   * @returns {Promise<Object>} 주차별 출석 상세 정보
   */
  getWeekAttendance: async (courseId, weekId) => {
    const response = await axiosInstance.get(`/api/v1/attendance/courses/${courseId}/weeks/${weekId}`);
    return response.data;
  },

  // =====================
  // 교수용 API
  // =====================

  /**
   * 강의 전체 출석 현황 조회 (교수용)
   * @param {number|string} courseId - 강의 ID
   * @returns {Promise<Object>} 강의 전체 출석 현황
   */
  getProfessorCourseAttendance: async (courseId) => {
    const response = await axiosInstance.get(`/api/v1/professor/courses/${courseId}/attendance`);
    return response.data;
  },

  /**
   * 학생별 출석 목록 조회 (교수용)
   * @param {number|string} courseId - 강의 ID
   * @returns {Promise<Object>} 학생별 출석 목록
   */
  getStudentsAttendance: async (courseId) => {
    const response = await axiosInstance.get(`/api/v1/professor/courses/${courseId}/attendance/students`);
    return response.data;
  },

  /**
   * 주차별 학생 출석 현황 조회 (교수용)
   * @param {number|string} courseId - 강의 ID
   * @param {number|string} weekId - 주차 ID
   * @returns {Promise<Object>} 주차별 학생 출석 현황
   */
  getWeekStudentsAttendance: async (courseId, weekId) => {
    const response = await axiosInstance.get(`/api/v1/professor/courses/${courseId}/weeks/${weekId}/attendance`);
    return response.data;
  },

  // =====================
  // 유틸리티 함수
  // =====================

  /**
   * 출석률에 따른 상태 색상 반환
   * @param {number} rate - 출석률 (0-100)
   * @returns {string} MUI 색상 키
   */
  getAttendanceColor: (rate) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'error';
  },

  /**
   * 출석 완료 일시 포맷팅
   * @param {string} dateString - ISO 8601 형식 날짜 문자열
   * @returns {string} 포맷팅된 날짜 문자열
   */
  formatCompletedAt: (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * 출석률 포맷팅
   * @param {number} rate - 출석률 (0-100)
   * @returns {string} 포맷팅된 출석률
   */
  formatAttendanceRate: (rate) => {
    if (rate === null || rate === undefined) return '-';
    return `${rate.toFixed(1)}%`;
  },
};

export default attendanceService;
