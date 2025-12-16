import axiosInstance from './axiosInstance';

/**
 * 토론 게시판 전용 API
 */

// 토론 게시판 목록 조회
export const getDiscussionList = async (params = {}) => {
  const { page = 0, size = 20, search = '' } = params;
  const response = await axiosInstance.get('/api/v1/boards/DISCUSSION/posts', {
    params: { page, size, search }
  });
  return response.data;
};

// 토론 게시판 상세 조회
export const getDiscussionDetail = async (id) => {
  const response = await axiosInstance.get(`/api/v1/boards/DISCUSSION/posts/${id}`);
  return response.data;
};

// 토론 게시판 작성
export const createDiscussion = async (data) => {
  const response = await axiosInstance.post('/api/v1/boards/DISCUSSION/posts', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};
