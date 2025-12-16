import { getQuestionDetail, createQuestion } from '../../../api/questionApi';
import { usePostDetail } from './usePostDetail';

/**
 * 질문 게시판 상세/폼 전용 훅
 * 목록 조회는 useBoard('QUESTION')를 사용
 * 
 * 제공 기능:
 * - fetchQuestionDetail: 상세 조회
 * - handleBackToList: 목록으로 돌아가기
 * - createQuestionPost: 게시글 생성
 * - updateQuestionPost: 게시글 수정
 * - loadQuestionForEdit: 수정용 데이터 로드
 */
export const useQuestion = () => {
  const {
    loading,
    error,
    setError,
    setLoading,
    fetchDetail,
    handleBackToList,
    createPost,
    updatePostData,
    loadForEdit,
  } = usePostDetail({
    categoryId: 3,
    listPath: '/questions',
    detailApi: getQuestionDetail,
    createApi: createQuestion,
    boardName: '질문 게시판',
  });

  return {
    loading,
    error,
    setError,
    setLoading,
    fetchQuestionDetail: fetchDetail,
    handleBackToList,
    createQuestionPost: createPost,
    updateQuestionPost: updatePostData,
    loadQuestionForEdit: loadForEdit,
  };
};
