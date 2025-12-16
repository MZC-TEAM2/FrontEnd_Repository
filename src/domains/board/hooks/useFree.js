import { getFreeDetail, createFree } from '../../../api/freeApi';
import { usePostDetail } from './usePostDetail';

/**
 * 자유 게시판 상세/폼 전용 훅
 * 목록 조회는 useBoard('FREE')를 사용
 * 
 * 제공 기능:
 * - fetchFreeDetail: 상세 조회
 * - handleBackToList: 목록으로 돌아가기
 * - createFreePost: 게시글 생성
 * - updateFreePost: 게시글 수정
 * - loadFreeForEdit: 수정용 데이터 로드
 */
export const useFree = () => {
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
    categoryId: 2,
    listPath: '/free',
    detailApi: getFreeDetail,
    createApi: createFree,
    boardName: '자유 게시판',
  });

  return {
    loading,
    error,
    setError,
    setLoading,
    fetchFreeDetail: fetchDetail,
    handleBackToList,
    createFreePost: createPost,
    updateFreePost: updatePostData,
    loadFreeForEdit: loadForEdit,
  };
};
