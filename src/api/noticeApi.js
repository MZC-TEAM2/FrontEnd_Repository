import axiosInstance from './axiosInstance';

// ============================================
// 공지사항 API
// ============================================

/**
 * 공지사항 목록 조회
 * @param {number} courseId - 강의 ID
 * @param {object} params - 페이지네이션 파라미터
 * @param {number} params.page - 페이지 번호 (0부터 시작)
 * @param {number} params.size - 페이지 크기
 * @param {string} params.sort - 정렬 (예: 'createdAt,desc')
 */
export const getNotices = async (courseId, {page = 0, size = 10, sort = 'createdAt,desc'} = {}) => {
    const response = await axiosInstance.get(`/api/v1/courses/${courseId}/notices`, {
        params: {page, size, sort},
    });
    return response.data;
};

/**
 * 공지사항 상세 조회
 * @param {number} courseId - 강의 ID
 * @param {number} noticeId - 공지사항 ID
 */
export const getNoticeDetail = async (courseId, noticeId) => {
    const response = await axiosInstance.get(`/api/v1/courses/${courseId}/notices/${noticeId}`);
    return response.data;
};

/**
 * 공지사항 생성 (담당 교수만)
 * @param {number} courseId - 강의 ID
 * @param {object} data - 공지사항 데이터
 * @param {string} data.title - 제목 (필수, 최대 200자)
 * @param {string} data.content - 내용 (필수)
 * @param {boolean} data.allowComments - 댓글 허용 여부 (필수)
 */
export const createNotice = async (courseId, data) => {
    const response = await axiosInstance.post(`/api/v1/courses/${courseId}/notices`, data);
    return response.data;
};

/**
 * 공지사항 수정 (담당 교수만)
 * @param {number} courseId - 강의 ID
 * @param {number} noticeId - 공지사항 ID
 * @param {object} data - 수정할 데이터
 */
export const updateNotice = async (courseId, noticeId, data) => {
    const response = await axiosInstance.put(`/api/v1/courses/${courseId}/notices/${noticeId}`, data);
    return response.data;
};

/**
 * 공지사항 삭제 (담당 교수만)
 * @param {number} courseId - 강의 ID
 * @param {number} noticeId - 공지사항 ID
 */
export const deleteNotice = async (courseId, noticeId) => {
    const response = await axiosInstance.delete(`/api/v1/courses/${courseId}/notices/${noticeId}`);
    return response.data;
};

// ============================================
// 댓글 API
// ============================================

/**
 * 댓글 작성 (수강생 + 담당 교수)
 * @param {number} courseId - 강의 ID
 * @param {number} noticeId - 공지사항 ID
 * @param {object} data - 댓글 데이터
 * @param {string} data.content - 댓글 내용 (필수)
 */
export const createComment = async (courseId, noticeId, data) => {
    const response = await axiosInstance.post(
        `/api/v1/courses/${courseId}/notices/${noticeId}/comments`,
        data
    );
    return response.data;
};

/**
 * 대댓글 작성 (수강생 + 담당 교수)
 * @param {number} courseId - 강의 ID
 * @param {number} noticeId - 공지사항 ID
 * @param {number} parentId - 부모 댓글 ID
 * @param {object} data - 대댓글 데이터
 * @param {string} data.content - 대댓글 내용 (필수)
 */
export const createReply = async (courseId, noticeId, parentId, data) => {
    const response = await axiosInstance.post(
        `/api/v1/courses/${courseId}/notices/${noticeId}/comments/${parentId}/replies`,
        data
    );
    return response.data;
};

/**
 * 댓글 수정 (작성자만)
 * @param {number} courseId - 강의 ID
 * @param {number} noticeId - 공지사항 ID
 * @param {number} commentId - 댓글 ID
 * @param {object} data - 수정할 데이터
 * @param {string} data.content - 수정할 내용
 */
export const updateComment = async (courseId, noticeId, commentId, data) => {
    const response = await axiosInstance.put(
        `/api/v1/courses/${courseId}/notices/${noticeId}/comments/${commentId}`,
        data
    );
    return response.data;
};

/**
 * 댓글 삭제 (작성자만)
 * @param {number} courseId - 강의 ID
 * @param {number} noticeId - 공지사항 ID
 * @param {number} commentId - 댓글 ID
 */
export const deleteComment = async (courseId, noticeId, commentId) => {
    const response = await axiosInstance.delete(
        `/api/v1/courses/${courseId}/notices/${noticeId}/comments/${commentId}`
    );
    return response.data;
};
