import { useState, useEffect } from 'react';
import { getNoticeList } from '../../../api/boardApi';

/**
 * 공지사항 게시판 커스텀 훅
 */
export const useNoticeBoard = () => {
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
      setPage(pageNum);
    } catch (err) {
      console.error('공지사항 목록 조회 실패:', err);
      setError('공지사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchNotices(0, searchTerm);
  }, []);

  // 페이지 변경
  const handlePageChange = (event, newPage) => {
    fetchNotices(newPage, searchTerm);
  };

  // 검색
  const handleSearch = () => {
    fetchNotices(0, searchTerm);
  };

  // 검색어 Enter 키 처리
  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
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
    handlePageChange,
    handleSearch,
    handleSearchKeyPress,
    refreshNotices: () => fetchNotices(page, searchTerm),
  };
};
