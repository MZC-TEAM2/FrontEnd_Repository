import axiosInstance from './axiosInstance';

/**
 * 공지사항 전용 API
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
