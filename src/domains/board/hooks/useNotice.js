import { getNoticeDetail, createNotice } from '../../../api/noticeApi';
import { usePostDetail } from './usePostDetail';

/**
 * 공지사항 상세/폼 전용 훅
 * 목록 조회는 useBoard('NOTICE')를 사용
 * 
 * 제공 기능:
 * - fetchNoticeDetail: 상세 조회
 * - handleBackToList: 목록으로 돌아가기
 * - createNoticePost: 게시글 생성
 * - updateNoticePost: 게시글 수정
 * - loadNoticeForEdit: 수정용 데이터 로드
 */
export const useNotice = () => {
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
    categoryId: 1,
    listPath: '/notices',
    detailApi: getNoticeDetail,
    createApi: createNotice,
    boardName: '공지사항',
  });

  return {
    loading,
    error,
    setError,
    setLoading,
    fetchNoticeDetail: fetchDetail,
    handleBackToList,
    createNoticePost: createPost,
    updateNoticePost: updatePostData,
    loadNoticeForEdit: loadForEdit,
  };
};

