import { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { getNoticeDetail, createNotice } from '../../../api/noticeApi';
import { updatePost } from '../../../api/postApi';
import authService from '../../../services/authService';

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
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 공지사항 상세 조회
  const fetchNoticeDetail = async (noticeId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNoticeDetail(noticeId);
      return data;
    } catch (err) {
      console.error('공지사항 조회 실패:', err);
      setError('공지사항을 불러오는데 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 목록으로 돌아가기 (검색 상태 유지)
  const handleBackToList = () => {
    const previousSearch = location.state?.search || searchParams.get('search') || '';
    const previousPage = location.state?.page || parseInt(searchParams.get('page') || '0', 10);
    
    const params = {};
    if (previousSearch) params.search = previousSearch;
    if (previousPage > 0) params.page = previousPage.toString();
    
    const queryString = new URLSearchParams(params).toString();
    navigate(`/notices${queryString ? `?${queryString}` : ''}`);
  };

  // 공지사항 생성 (폼용)
  const createNoticePost = async (formData, attachmentIds, categoryId = 1) => {
    const currentUser = authService.getCurrentUser();
    const requestData = {
      categoryId,
      authorId: currentUser?.userId,
      title: formData.title,
      content: formData.content,
      postType: formData.postType,
      isAnonymous: formData.isAnonymous,
      attachmentIds,
    };
    const response = await createNotice(requestData);
    return response;
  };

  // 공지사항 수정 (폼용)
  const updateNoticePost = async (noticeId, formData, attachmentIds, deletedFileIds, categoryId = 1) => {
    const requestData = {
      categoryId,
      title: formData.title,
      content: formData.content,
      postType: formData.postType,
      isAnonymous: formData.isAnonymous,
      attachmentIds,
      deleteAttachmentIds: deletedFileIds,
    };
    await updatePost(noticeId, requestData);
  };

  // 폼 데이터 로드 (수정용)
  const loadNoticeForEdit = async (noticeId, setFormData, setExistingFiles) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNoticeDetail(noticeId);
      setFormData({
        title: data.title || '',
        content: data.content || '',
        postType: data.postType || 'NORMAL',
        isAnonymous: data.isAnonymous || false,
      });
      setExistingFiles(data.attachments || []);
    } catch (err) {
      console.error('공지사항 조회 실패:', err);
      setError('공지사항을 불러오는데 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setError,
    setLoading,
    fetchNoticeDetail,
    handleBackToList,
    createNoticePost,
    updateNoticePost,
    loadNoticeForEdit,
  };
};

