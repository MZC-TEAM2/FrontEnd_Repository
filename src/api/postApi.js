import axiosInstance from './axiosInstance';

/**
 * 공통 게시글 API
 * 모든 게시판 타입(NOTICE, FREE, QUESTION, DISCUSSION, DEPARTMENT, PROFESSOR, STUDENT 등)에서 사용 가능
 */

// 게시글 목록 조회 (검색 + 페이징)
export const getPostList = async (boardType, params = {}) => {
    const {page = 0, size = 20, search = '', hashtag = ''} = params;
    const response = await axiosInstance.get(`/api/v1/boards/${boardType}/posts`, {
        params: {page, size, search, hashtag}
    });
    return response.data;
};

// 게시글 상세 조회
export const getPost = async (boardType, postId) => {
    const response = await axiosInstance.get(`/api/v1/boards/${boardType}/posts/${postId}`);
    return response.data;
};

// 게시글 작성
export const createPost = async (boardType, data) => {
    const response = await axiosInstance.post(`/api/v1/boards/${boardType}/posts`, data, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

// 게시글 수정
export const updatePost = async (id, data) => {
    const response = await axiosInstance.put(`/api/v1/boards/posts/${id}`, data, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

// 게시글 삭제
export const deletePost = async (id) => {
    const response = await axiosInstance.delete(`/api/v1/boards/posts/${id}`);
    return response.data;
};

// 좋아요 토글
export const toggleLike = async (postId, userId) => {
    const response = await axiosInstance.post(`/api/v1/boards/posts/${postId}/like`, null, {
        params: {userId}
    });
    return response.data;
};

// 좋아요 여부 조회
export const checkLiked = async (postId, userId) => {
    const response = await axiosInstance.get(`/api/v1/boards/posts/${postId}/liked`, {
        params: {userId}
    });
    return response.data;
};
