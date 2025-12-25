import axiosInstance from '../api/axiosInstance';

/**
 * 프로필 관련 API 서비스
 */
const profileService = {
    /**
     * 내 프로필 조회
     * @returns {Promise<Object>} 프로필 정보
     */
    getMyProfile: async () => {
        const response = await axiosInstance.get('/api/v1/profile/me');
        return response.data;
    },

    /**
     * 프로필 수정
     * @param {Object} data - 수정할 프로필 정보
     * @param {string} data.name - 이름
     * @param {string} data.mobileNumber - 휴대폰 번호
     * @param {string} data.homeNumber - 자택 번호
     * @param {string} data.officeNumber - 사무실 번호
     * @returns {Promise<Object>} 수정된 프로필 정보
     */
    updateProfile: async (data) => {
        const response = await axiosInstance.patch('/api/v1/profile/me', data);
        return response.data;
    },

    /**
     * 프로필 이미지 업로드
     * @param {File} file - 이미지 파일
     * @returns {Promise<void>}
     */
    uploadProfileImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        await axiosInstance.post('/api/v1/profile/me/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * 프로필 이미지 삭제
     * @returns {Promise<void>}
     */
    deleteProfileImage: async () => {
        await axiosInstance.delete('/api/v1/profile/me/image');
    },
};

export default profileService;
