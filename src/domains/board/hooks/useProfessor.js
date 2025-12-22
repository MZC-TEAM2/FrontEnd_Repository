import { getPost, createPost } from '../../../api/postApi';
import { usePostDetail } from './usePostDetail';

/**
 * 교수 게시판 상세/폼 전용 훅
 * 목록 조회는 useBoard('PROFESSOR')를 사용
 * 
 * 제공 기능:
 * - fetchProfessorDetail: 상세 조회
 * - handleBackToList: 목록으로 돌아가기
 * - createProfessorPost: 게시글 생성
 * - updateProfessorPost: 게시글 수정
 * - loadProfessorForEdit: 수정용 데이터 로드
 */
export const useProfessor = () => {
  const {
    loading,
    error,
    setError,
    setLoading,
    fetchDetail,
    handleBackToList,
    createPost: createPostFn,
    updatePostData,
    loadForEdit,
  } = usePostDetail({
    categoryId: 6,
    listPath: '/professor',
    detailApi: (id) => getPost('PROFESSOR', id),
    createApi: (data) => createPost('PROFESSOR', data),
    boardName: '교수 게시판',
  });

  return {
    loading,
    error,
    setError,
    setLoading,
    fetchProfessorDetail: fetchDetail,
    handleBackToList,
    createProfessorPost: createPostFn,
    updateProfessorPost: updatePostData,
    loadProfessorForEdit: loadForEdit,
  };
};
