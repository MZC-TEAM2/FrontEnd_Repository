import axiosInstance from './axiosInstance';

/**
 * 해시태그 API
 * 해시태그 검색 및 자동완성 기능
 */

/**
 * 해시태그 검색 (자동완성용)
 * @param {string} keyword - 검색 키워드
 * @returns {Promise<Array>} 해시태그 검색 결과
 */
export const searchHashtags = async (keyword) => {
    if (!keyword || keyword.trim().length === 0) {
        return [];
    }

    const response = await axiosInstance.get('/api/v1/hashtags/search', {
        params: {keyword: keyword.trim()}
    });
    return response.data;
};
