import axiosInstance from '../api/axiosInstance';
import {clearAuthCookies, getCookie, setCookie} from '../utils/cookieUtils';

/**
 * 인증 관련 API 서비스
 */
const authService = {
    /**
     * 이메일 인증 코드 발송
     * @param {string} email - 이메일 주소
     */
    sendVerificationCode: async (email) => {
        const response = await axiosInstance.post('/api/auth/signup/email-verification', {email});
        return response.data;
    },

    /**
     * 이메일 인증 코드 확인
     * @param {string} email - 이메일 주소
     * @param {string} code - 인증 코드
     */
    verifyCode: async (email, code) => {
        const response = await axiosInstance.post('/api/auth/signup/verify-code', {email, code});
        return response.data;
    },

    /**
     * 이메일 중복 확인
     * @param {string} email - 이메일 주소
     */
    checkEmail: async (email) => {
        const response = await axiosInstance.get('/api/auth/check-email', {params: {email}});
        return response.data;
    },

    /**
     * 회원가입
     * @param {Object} data - 회원가입 정보
     */
    signup: async (data) => {
        // emailCode 필드 제거 및 타입 변환 (문자열 -> 숫자)
        const {emailCode, ...signupData} = data;

        const requestData = {
            ...signupData,
            collegeId: Number(signupData.collegeId),
            departmentId: Number(signupData.departmentId),
            grade: signupData.grade ? Number(signupData.grade) : null,
        };

        const response = await axiosInstance.post('/api/auth/signup', requestData);
        return response.data;
    },

    /**
     * 로그인
     * @param {string} email - 이메일
     * @param {string} password - 비밀번호
     */
    login: async (email, password) => {
        // 백엔드는 username 필드를 사용
        const response = await axiosInstance.post('/api/auth/login', {
            username: email,
            password
        });

        // 토큰 저장 - 백엔드는 데이터를 직접 반환 (data 래핑 없음)
        if (response.data) {
            const {
                accessToken,
                refreshToken,
                userType,
                userNumber,
                name,
                email: userEmail,
                userId,
                thumbnailUrl,
                departmentId,
                departmentName
            } = response.data;

            // 토큰 저장
            setCookie('accessToken', accessToken);
            setCookie('refreshToken', refreshToken);

            // 사용자 정보 저장
            const user = {
                userType,
                userNumber,
                name,
                email: userEmail,
                userId,
                thumbnailUrl,
                departmentId,
                departmentName
            };
            setCookie('user', JSON.stringify(user));

            // Login.jsx에서 사용할 수 있도록 success 플래그 추가
            return {
                success: true,
                data: response.data,
                user
            };
        }

        return {
            success: false,
            message: '로그인에 실패했습니다.'
        };
    },

    /**
     * 로그아웃
     */
    logout: async () => {
        const refreshToken = getCookie('refreshToken');

        try {
            // 서버에 로그아웃 요청
            await axiosInstance.post('/api/auth/logout', null, {
                headers: {
                    'Refresh-Token': refreshToken,
                },
            });
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // 쿠키 정리
            clearAuthCookies();
        }
    },

    /**
     * 토큰 갱신
     * @param {string} refreshToken - 리프레시 토큰
     */
    refreshToken: async (refreshToken) => {
        const response = await axiosInstance.post('/api/auth/refresh', {refreshToken});

        // 새 토큰 저장 - 백엔드는 데이터를 직접 반환 (data 래핑 없음)
        if (response.data) {
            const {accessToken, refreshToken: newRefreshToken} = response.data;
            setCookie('accessToken', accessToken);
            setCookie('refreshToken', newRefreshToken);
        }

        return response.data;
    },

    /**
     * 현재 사용자 정보 가져오기
     */
    getCurrentUser: () => {
        const userString = getCookie('user');
        return userString ? JSON.parse(userString) : null;
    },

    /**
     * 인증 여부 확인
     */
    isAuthenticated: () => {
        return !!getCookie('accessToken');
    },
};

export default authService;
