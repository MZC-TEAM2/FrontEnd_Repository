import axiosInstance from './axiosInstance';

/**
 * 게시판 API
 */

// 공지사항 목록 조회
export const getNoticeList = async (params = {}) => {
  const { page = 0, size = 20, search = '' } = params;
  const response = await axiosInstance.get('/api/v1/boards/NOTICE/posts', {
    params: { page, size, search }
  });
  return response.data;
};

// 공지사항 상세 조회
export const getNoticeDetail = async (id) => {
  const response = await axiosInstance.get(`/api/v1/boards/NOTICE/posts/${id}`);
  return response.data;
};

// 공지사항 작성
export const createNotice = async (formData) => {
  const response = await axiosInstance.post('/api/v1/boards/NOTICE/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// 공지사항 수정
export const updateNotice = async (id, formData) => {
  const response = await axiosInstance.put(`/api/v1/boards/posts/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// 공지사항 삭제
export const deleteNotice = async (id) => {
  const response = await axiosInstance.delete(`/api/v1/boards/posts/${id}`);
  return response.data;
};

// 좋아요
export const likePost = async (id) => {
  const response = await axiosInstance.post(`/api/v1/boards/posts/${id}/like`);
  return response.data;
};

// 좋아요 취소
export const unlikePost = async (id) => {
  const response = await axiosInstance.delete(`/api/v1/boards/posts/${id}/like`);
  return response.data;
};
