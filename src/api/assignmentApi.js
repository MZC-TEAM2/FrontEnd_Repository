/**
 * 과제 관련 API 함수
 *
 * 주요 기능:
 * - 과제 등록 (교수)
 * - 과제 목록 조회 (강의별)
 * - 과제 상세 조회
 * - 과제 수정 (교수)
 * - 과제 삭제 (교수)
 * - 과제 제출 (학생)
 * - 과제 제출 목록 조회 (교수)
 * - 과제 채점 (교수)
 * - 내 제출 조회 (학생)
 */

import axiosInstance from './axiosInstance';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 과제 등록 (교수)
 * @param {Object} data - 과제 등록 데이터
 * @param {number} data.courseId - 강의 ID
 * @param {string} data.title - 과제 제목
 * @param {string} data.description - 과제 설명
 * @param {string} data.dueDate - 마감일 (ISO 8601 형식)
 * @param {number} data.maxScore - 만점
 * @param {string[]} data.attachmentUrls - 첨부파일 URL 목록
 * @returns {Promise} 생성된 과제 정보
 */
export const createAssignment = async (data) => {
    const response = await axiosInstance.post(`${BASE_URL}/api/v1/assignments`, data);
    return response.data;
};

/**
 * 과제 목록 조회 (강의별 또는 전체)
 * @param {number} courseId - 강의 ID (선택, null이면 전체 조회)
 * @returns {Promise} 과제 목록
 */
export const getAssignmentsByCourse = async (courseId) => {
    const params = {};
    if (courseId !== null && courseId !== undefined) {
        params.courseId = courseId;
    }
    const response = await axiosInstance.get(`${BASE_URL}/api/v1/assignments`, {params});
    return response.data;
};

/**
 * 과제 상세 조회
 * @param {number} assignmentId - 과제 ID
 * @returns {Promise} 과제 상세 정보
 */
export const getAssignment = async (assignmentId) => {
    const response = await axiosInstance.get(`${BASE_URL}/api/v1/assignments/${assignmentId}`);
    return response.data;
};

/**
 * 과제 수정 (교수)
 * @param {number} assignmentId - 과제 ID
 * @param {Object} data - 수정 데이터
 * @param {string} data.title - 과제 제목
 * @param {string} data.description - 과제 설명
 * @param {string} data.dueDate - 마감일 (ISO 8601 형식)
 * @param {number} data.maxScore - 만점
 * @param {string[]} data.attachmentUrls - 첨부파일 URL 목록
 * @returns {Promise} 수정된 과제 정보
 */
export const updateAssignment = async (assignmentId, data) => {
    const response = await axiosInstance.put(`${BASE_URL}/api/v1/assignments/${assignmentId}`, data);
    return response.data;
};

/**
 * 과제 삭제 (교수)
 * @param {number} assignmentId - 과제 ID
 * @returns {Promise} void
 */
export const deleteAssignment = async (assignmentId) => {
    const response = await axiosInstance.delete(`${BASE_URL}/api/v1/assignments/${assignmentId}`);
    return response.data;
};

/**
 * 과제 제출 (학생)
 * @param {number} assignmentId - 과제 ID
 * @param {Object} data - 제출 데이터
 * @param {string} data.submissionText - 제출 내용
 * @param {string[]} data.attachmentUrls - 첨부파일 URL 목록
 * @returns {Promise} 제출 정보
 */
export const submitAssignment = async (assignmentId, data) => {
    const response = await axiosInstance.post(`${BASE_URL}/api/v1/assignments/${assignmentId}/submit`, data);
    return response.data;
};

/**
 * 과제 제출 목록 조회 (교수)
 * @param {number} assignmentId - 과제 ID
 * @returns {Promise} 제출 목록
 */
export const getSubmissions = async (assignmentId) => {
    const response = await axiosInstance.get(`${BASE_URL}/api/v1/assignments/${assignmentId}/submissions`);
    return response.data;
};

/**
 * 과제 채점 (교수)
 * @param {number} submissionId - 제출 ID
 * @param {Object} data - 채점 데이터
 * @param {number} data.score - 점수
 * @param {string} data.feedback - 피드백
 * @returns {Promise} 채점된 제출 정보
 */
export const gradeSubmission = async (submissionId, data) => {
    const response = await axiosInstance.put(`${BASE_URL}/api/v1/assignments/submissions/${submissionId}/grade`, data);
    return response.data;
};

/**
 * 내 제출 조회 (학생)
 * @param {number} assignmentId - 과제 ID
 * @returns {Promise} 내 제출 정보
 */
export const getMySubmission = async (assignmentId) => {
    const response = await axiosInstance.get(`${BASE_URL}/api/v1/assignments/${assignmentId}/my-submission`);
    return response.data;
};

/**
 * 재제출 허용 (교수)
 * @param {number} submissionId - 제출 ID
 * @param {string} deadline - 재제출 마감일 (ISO 8601 형식, 선택)
 * @returns {Promise} 업데이트된 제출 정보
 */
export const allowResubmission = async (submissionId, deadline = null) => {
    const response = await axiosInstance.post(
        `${BASE_URL}/api/v1/assignments/submissions/${submissionId}/allow-resubmission`,
        null,
        {params: {deadline}}
    );
    return response.data;
};
