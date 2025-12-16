import { getPost, createPost } from '../../../api/postApi';
import { usePostDetail } from './usePostDetail';

/**
 * 토론 게시판 상세/폼 전용 훅
 * 목록 조회는 useBoard('DISCUSSION')를 사용
 * 
 * 제공 기능:
 * - fetchDiscussionDetail: 상세 조회
 * - handleBackToList: 목록으로 돌아가기
 * - createDiscussionPost: 게시글 생성
 * - updateDiscussionPost: 게시글 수정
 * - loadDiscussionForEdit: 수정용 데이터 로드
 */
export const useDiscussion = () => {
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
    categoryId: 4,
    listPath: '/discussions',
    detailApi: (id) => getPost('DISCUSSION', id),
    createApi: (data) => createPost('DISCUSSION', data),
    boardName: '토론 게시판',
  });

  return {
    loading,
    error,
    setError,
    setLoading,
    fetchDiscussionDetail: fetchDetail,
    handleBackToList,
    createDiscussionPost: createPostFn,
    updateDiscussionPost: updatePostData,
    loadDiscussionForEdit: loadForEdit,
  };
};
