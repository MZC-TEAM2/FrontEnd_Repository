/**
 * 텍스트 유틸리티 함수들
 */

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표를 추가
 * @param {string} text - 원본 텍스트
 * @param {number} maxLength - 최대 길이
 * @returns {string} 잘린 텍스트
 */
export const truncateText = (text, maxLength = 10) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * HTML 태그 제거
 * @param {string} html - HTML 텍스트
 * @returns {string} 태그가 제거된 텍스트
 */
export const stripHtmlTags = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};