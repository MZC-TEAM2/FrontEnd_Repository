import axiosInstance from '../api/axiosInstance';

const BASE_URL = '/api/v1/dashboard/student';

/**
 * 학생 대시보드 API 서비스
 */
const dashboardService = {
  /**
   * 미제출 과제 목록 조회
   * @param {number} days - 마감일 기준 일수 (기본값: 7)
   */
  getPendingAssignments: async (days = 7) => {
    const response = await axiosInstance.get(`${BASE_URL}/pending-assignments`, {
      params: { days },
    });
    return response.data;
  },

  /**
   * 오늘의 강의 목록 조회
   */
  getTodayCourses: async () => {
    const response = await axiosInstance.get(`${BASE_URL}/today-courses`);
    return response.data;
  },

  /**
   * 최신 공지사항 목록 조회
   * @param {number} limit - 조회할 개수 (기본값: 5)
   */
  getNotices: async (limit = 5) => {
    const response = await axiosInstance.get(`${BASE_URL}/notices`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * 수강 현황 요약 조회
   */
  getEnrollmentSummary: async () => {
    const response = await axiosInstance.get(`${BASE_URL}/enrollment-summary`);
    return response.data;
  },

  /**
   * 다가오는 시험 목록 조회
   * @param {number} days - 시험일 기준 일수 (기본값: 7, 최대 30)
   */
  getUpcomingAssessments: async (days = 7) => {
    const response = await axiosInstance.get(`${BASE_URL}/upcoming-assessments`, {
      params: { days },
    });
    return response.data;
  },
};

export default dashboardService;
