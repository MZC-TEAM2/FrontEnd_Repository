import axiosInstance from './axiosInstance';

/**
 * 자유 게시판 전용 API
 */

// 자유 게시판 목록 조회
export const getFreeList = async (params = {}) => {
  const { page = 0, size = 20, search = '' } = params;
  const response = await axiosInstance.get('/api/v1/boards/FREE/posts', {
    params: { page, size, search }
  });
  return response.data;
};

// 자유 게시판 상세 조회
export const getFreeDetail = async (id) => {
  const response = await axiosInstance.get(`/api/v1/boards/FREE/posts/${id}`);
  return response.data;
};

// 자유 게시판 작성
export const createFree = async (data) => {
  const response = await axiosInstance.post('/api/v1/boards/FREE/posts', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};
