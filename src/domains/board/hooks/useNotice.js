import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { getNoticeList, getNoticeDetail, createNotice } from '../../../api/noticeApi';
import { updatePost } from '../../../api/postApi';
import authService from '../../../services/authService';

/**
 * 공지사항 게시판 커스텀 훅
 * URL query parameters를 사용하여 검색 상태 유지
 */
export const useNotice = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // 공지사항 목록 조회
  const fetchNotices = async (pageNum = 0, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getNoticeList({
        page: pageNum,
        size: 20,
        search: search,
      });
      
      setNotices(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('공지사항 목록 조회 실패:', err);
      setError('공지사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // URL 변경 감지하여 자동으로 데이터 다시 불러오기
  useEffect(() => {
    const currentPage = parseInt(searchParams.get('page') || '0', 10);
    const currentSearch = searchParams.get('search') || '';
    
    // searchTerm state 동기화
    setSearchTerm(currentSearch);
    setPage(currentPage);
    
    // 데이터 로드
    fetchNotices(currentPage, currentSearch);
  }, [searchParams]); // searchParams가 변경될 때마다 실행

  // 페이지 변경
  const handlePageChange = (event, newPage) => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (newPage > 0) params.page = newPage.toString();
    setSearchParams(params);
  };

  // 검색
  const handleSearch = () => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    // 검색 시 페이지는 0으로 리셋
    setSearchParams(params);
  };

  // 검색어 Enter 키 처리
  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // 1. 공지사항 상세 조회
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

  // 2. 목록으로 돌아가기 (검색 상태 유지)
  const handleBackToList = () => {
    const previousSearch = location.state?.search || searchParams.get('search') || '';
    const previousPage = location.state?.page || parseInt(searchParams.get('page') || '0', 10);
    
    const params = {};
    if (previousSearch) params.search = previousSearch;
    if (previousPage > 0) params.page = previousPage.toString();
    
    const queryString = new URLSearchParams(params).toString();
    navigate(`/notices${queryString ? `?${queryString}` : ''}`);
  };

  // 3. 상세 페이지로 이동 (현재 검색 상태 전달)
  const handleRowClick = (id) => {
    navigate(`/notices/${id}`, {
      state: { search: searchTerm, page }
    });
  };

  // 4. 공지사항 생성 (폼용)
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

  // 5. 공지사항 수정 (폼용)
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

  // 6. 폼 데이터 로드 (수정용)
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
    notices,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    searchTerm,
    setSearchTerm,
    setError,
    setLoading,
    handlePageChange,
    handleSearch,
    handleSearchKeyPress,
    fetchNoticeDetail,
    handleBackToList,
    handleRowClick,
    refreshNotices: () => fetchNotices(page, searchTerm),
    createNoticePost,
    updateNoticePost,
    loadNoticeForEdit,
  };
};
