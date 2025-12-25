import axiosInstance from '../api/axiosInstance';

/**
 * 유저 탐색 관련 API 서비스
 */
const userService = {
    /**
     * 유저 검색 (커서 기반 페이징)
     * @param {Object} params - 검색 파라미터
     * @param {number} params.collegeId - 단과대 ID
     * @param {number} params.departmentId - 학과 ID
     * @param {string} params.name - 이름 검색
     * @param {string} params.userType - STUDENT / PROFESSOR
     * @param {string} params.sortBy - ID / NAME
     * @param {number} params.size - 페이지 크기
     * @param {number} params.cursorId - 커서 ID
     * @param {string} params.cursorName - 커서 이름
     */
    searchUsers: async (params = {}) => {
        const queryParams = {};

        if (params.collegeId) queryParams.collegeId = params.collegeId;
        if (params.departmentId) queryParams.departmentId = params.departmentId;
        if (params.name) queryParams.name = params.name;
        if (params.userType) queryParams.userType = params.userType;
        if (params.sortBy) queryParams.sortBy = params.sortBy;
        if (params.size) queryParams.size = params.size;
        if (params.cursorId) queryParams.cursorId = params.cursorId;
        if (params.cursorName) queryParams.cursorName = params.cursorName;

        const response = await axiosInstance.get('/api/v1/users/search', {params: queryParams});
        return response.data;
    },

    /**
     * 단과대 목록 조회
     */
    getColleges: async () => {
        const response = await axiosInstance.get('/api/v1/users/colleges');
        return response.data;
    },

    /**
     * 학과 목록 조회 (단과대별)
     * @param {number} collegeId - 단과대 ID
     */
    getDepartmentsByCollege: async (collegeId) => {
        const response = await axiosInstance.get(`/api/v1/users/colleges/${collegeId}/departments`);
        return response.data;
    },

    /**
     * 전체 학과 목록 조회
     */
    getAllDepartments: async () => {
        const response = await axiosInstance.get('/api/v1/users/departments');
        return response.data;
    },
};

export default userService;
