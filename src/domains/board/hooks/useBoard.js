import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import authService from '../../../services/authService';

/**
 * 범용 게시판 커스텀 훅
 * 모든 게시판 타입에서 재사용 가능
 * 
 * @param {string} boardType - 게시판 타입 (NOTICE, PROFESSOR, STUDENT, FREE, etc.)
 * @returns {object} 게시판 상태 및 함수들
 */
export const useBoard = (boardType) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // 게시글 목록 조회
  const fetchPosts = async (pageNum = 0, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: pageNum,
        size: 20,
      };
      
      if (search) {
        params.search = search; // title -> search로 변경
      }
      
      const response = await axiosInstance.get(
        `/api/v1/boards/${boardType}/posts`,
        { params }
      );
      
      const data = response.data;
      setPosts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(`${boardType} 게시판 목록 조회 실패:`, err);
      
      // RBAC 에러 처리
      if (err.response?.status === 403) {
        setError('이 게시판에 접근할 권한이 없습니다.');
      } else if (err.response?.status === 404) {
        setError('게시판을 찾을 수 없습니다.');
      } else {
        setError('게시글을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // URL 변경 감지하여 자동으로 데이터 다시 불러오기
  useEffect(() => {
    const currentPage = parseInt(searchParams.get('page') || '0', 10);
    const currentSearch = searchParams.get('search') || '';
    
    setSearchTerm(currentSearch);
    setPage(currentPage);
    
    fetchPosts(currentPage, currentSearch);
  }, [searchParams, boardType]);

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
    setSearchParams(params);
  };

  // 검색어 Enter 키 처리
  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // 게시글 상세 조회
  const fetchPostDetail = async (postId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/v1/posts/${postId}`);
      return response.data;
    } catch (err) {
      console.error('게시글 조회 실패:', err);
      
      if (err.response?.status === 403) {
        setError('이 게시글에 접근할 권한이 없습니다.');
      } else if (err.response?.status === 404) {
        setError('게시글을 찾을 수 없습니다.');
      } else {
        setError('게시글을 불러오는데 실패했습니다.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 목록으로 돌아가기 (검색 상태 유지)
  const handleBackToList = (basePath) => {
    const previousSearch = location.state?.search || searchParams.get('search') || '';
    const previousPage = location.state?.page || parseInt(searchParams.get('page') || '0', 10);
    
    const params = {};
    if (previousSearch) params.search = previousSearch;
    if (previousPage > 0) params.page = previousPage.toString();
    
    const queryString = new URLSearchParams(params).toString();
    navigate(`${basePath}${queryString ? `?${queryString}` : ''}`);
  };

  // 상세 페이지로 이동 (현재 검색 상태 전달)
  const handleRowClick = (id, basePath) => {
    navigate(`${basePath}/${id}`, {
      state: { search: searchTerm, page }
    });
  };

  // 게시글 생성
  const createPost = async (formData, attachmentIds) => {
    const currentUser = authService.getCurrentUser();
    
    const requestData = {
      boardType,
      authorId: currentUser?.userId,
      title: formData.title,
      content: formData.content,
      postType: formData.postType || 'NORMAL',
      isAnonymous: formData.isAnonymous || false,
      attachmentIds: attachmentIds || [],
    };
    
    const response = await axiosInstance.post(
      `/api/v1/boards/${boardType}/posts`,
      requestData
    );
    return response.data;
  };

  // 게시글 수정
  const updatePost = async (postId, formData, attachmentIds, deletedFileIds) => {
    const requestData = {
      boardType,
      title: formData.title,
      content: formData.content,
      postType: formData.postType || 'NORMAL',
      isAnonymous: formData.isAnonymous || false,
      attachmentIds: attachmentIds || [],
      deleteAttachmentIds: deletedFileIds || [],
    };
    
    await axiosInstance.put(`/api/v1/posts/${postId}`, requestData);
  };

  // 폼 데이터 로드 (수정용)
  const loadPostForEdit = async (postId, setFormData, setExistingFiles) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPostDetail(postId);
      setFormData({
        title: data.title || '',
        content: data.content || '',
        postType: data.postType || 'NORMAL',
        isAnonymous: data.isAnonymous || false,
      });
      setExistingFiles(data.attachments || []);
    } catch (err) {
      console.error('게시글 조회 실패:', err);
      setError('게시글을 불러오는데 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    posts,
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
    fetchPostDetail,
    handleBackToList,
    handleRowClick,
    refreshPosts: () => fetchPosts(page, searchTerm),
    createPost,
    updatePost,
    loadPostForEdit,
  };
};
