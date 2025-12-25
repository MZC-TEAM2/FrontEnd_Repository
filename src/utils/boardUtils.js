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
        NOTICE: {label: '공지', color: 'error'},
        URGENT: {label: '긴급', color: 'error'},
        IMPORTANT: {label: '중요', color: 'warning'},
        GENERAL: {label: '일반', color: 'default'},
        NORMAL: {label: '일반', color: 'default'},
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

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 포맷팅
 * @param {number} bytes - 파일 크기 (바이트)
 * @returns {string} 포맷팅된 파일 크기 (예: "1.5 MB")
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * 마감일 상태를 계산하여 라벨과 색상 반환
 * @param {string|Date} dueDate - 마감일
 * @returns {object} { label: string, color: string } - Chip에 사용할 라벨과 색상
 */
export const getDueDateStatus = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return {label: '마감', color: 'error'};
    } else if (diffDays === 0) {
        return {label: '오늘 마감', color: 'warning'};
    } else if (diffDays <= 3) {
        return {label: `D-${diffDays}`, color: 'warning'};
    } else {
        return {label: `D-${diffDays}`, color: 'success'};
    }
};
