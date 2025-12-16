import axiosInstance from './axiosInstance';

/**
 * 학과 게시판 전용 API
 */

// 학과 게시판 목록 조회
export const getDepartmentList = async (params = {}) => {
  const { page = 0, size = 20, search = '' } = params;
  const response = await axiosInstance.get('/api/v1/boards/DEPARTMENT/posts', {
    params: { page, size, search }
  });
  return response.data;
};

// 학과 게시판 상세 조회
export const getDepartmentDetail = async (id) => {
  const response = await axiosInstance.get(`/api/v1/boards/DEPARTMENT/posts/${id}`);
  return response.data;
};

// 학과 게시판 작성
export const createDepartment = async (data) => {
  const response = await axiosInstance.post('/api/v1/boards/DEPARTMENT/posts', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};
