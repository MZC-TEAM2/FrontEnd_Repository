import axiosInstance from './axiosInstance';

/**
 * 질문 게시판 전용 API
 */

// 질문 게시판 목록 조회
export const getQuestionList = async (params = {}) => {
  const { page = 0, size = 20, search = '' } = params;
  const response = await axiosInstance.get('/api/v1/boards/QUESTION/posts', {
    params: { page, size, search }
  });
  return response.data;
};

// 질문 게시판 상세 조회
export const getQuestionDetail = async (id) => {
  const response = await axiosInstance.get(`/api/v1/boards/QUESTION/posts/${id}`);
  return response.data;
};

// 질문 게시판 작성
export const createQuestion = async (data) => {
  const response = await axiosInstance.post('/api/v1/boards/QUESTION/posts', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};
