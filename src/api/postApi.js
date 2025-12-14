import axiosInstance from './axiosInstance';

/**
 * 공통 게시글 API
 * 모든 게시판 타입(NOTICE, QNA, FREE 등)에서 사용 가능
 */

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
    params: { userId }
  });
  return response.data;
};

// 좋아요 여부 조회
export const checkLiked = async (postId, userId) => {
  const response = await axiosInstance.get(`/api/v1/boards/posts/${postId}/liked`, {
    params: { userId }
  });
  return response.data;
};
