import axiosInstance from './axiosInstance';

const BASE_URL = '/api/v1/board/comments';

// 댓글 목록 조회
export const getComments = async (postId) => {
    const response = await axiosInstance.get(BASE_URL, {
        params: {postId}
    });
    return response.data;
};

// 댓글 작성
export const createComment = async (data) => {
    const response = await axiosInstance.post(BASE_URL, data);
    return response.data;
};

// 댓글 수정
export const updateComment = async (commentId, data) => {
    const response = await axiosInstance.put(`${BASE_URL}/${commentId}`, data);
    return response.data;
};

// 댓글 삭제
export const deleteComment = async (commentId) => {
    const response = await axiosInstance.delete(`${BASE_URL}/${commentId}`);
    return response.data;
};
