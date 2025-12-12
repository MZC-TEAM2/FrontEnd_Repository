/**
 * 게시판 관련 유틸리티 함수들
 */

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @param {string} dateString - ISO 형식의 날짜 문자열
 * @param {object} options - 포맷 옵션 (기본값: 년-월-일)
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  };
  
  return date.toLocaleDateString('ko-KR', defaultOptions);
};

/**
 * 상세 날짜 포맷팅 (시간 포함)
 * @param {string} dateString - ISO 형식의 날짜 문자열
 * @returns {string} 포맷팅된 날짜 문자열 (년월일 시:분)
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 게시글 타입에 따른 라벨과 색상 반환
 * @param {string} postType - 게시글 타입 (NOTICE, URGENT, IMPORTANT, GENERAL, NORMAL)
 * @returns {object} { label: string, color: string }
 */
export const getPostTypeLabel = (postType) => {
  const types = {
    NOTICE: { label: '공지', color: 'error' },
    URGENT: { label: '긴급', color: 'error' },
    IMPORTANT: { label: '중요', color: 'warning' },
    GENERAL: { label: '일반', color: 'default' },
    NORMAL: { label: '일반', color: 'default' },
  };
  return types[postType] || types.GENERAL;
};

/**
 * 게시판 타입에 따른 한글 이름 반환
 * @param {string} boardType - 게시판 타입 (NOTICE, QNA, FREE)
 * @returns {string} 한글 이름
 */
export const getBoardTypeName = (boardType) => {
  const types = {
    NOTICE: '공지사항',
    QNA: 'Q&A',
    FREE: '자유게시판',
  };
  return types[boardType] || '게시판';
};
