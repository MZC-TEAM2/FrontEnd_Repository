import axios from 'axios';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 리프레시 상태 관리
let isRefreshing = false;
let failedQueue = [];

// 대기 중인 요청들 처리
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 토큰 자동 첨부
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData 전송 시 Content-Type을 강제 지정하면 boundary가 누락되어 415가 날 수 있음
    // -> 브라우저/axios가 boundary 포함해서 자동 설정하도록 Content-Type 제거
    if (config.data instanceof FormData) {
      // axios는 headers가 object or AxiosHeaders일 수 있음
      try {
        // eslint-disable-next-line no-param-reassign
        delete config.headers['Content-Type'];
        // eslint-disable-next-line no-param-reassign
        delete config.headers['content-type'];
      } catch {
        // ignore
      }
    }

    // 개발 환경에서 요청 로깅
    if (import.meta.env.VITE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    // 개발 환경에서 응답 로깅
    if (import.meta.env.VITE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 처리 (토큰 만료)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 이미 리프레시 중이면 큐에 추가하고 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        isRefreshing = false;
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // 토큰 갱신 시도
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
          { refreshToken }
        );

        // 응답 구조에 따라 토큰 추출
        const tokenData = response.data.data || response.data;
        const { accessToken, refreshToken: newRefreshToken } = tokenData;

        // 새 토큰 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // 대기 중인 요청들에게 새 토큰 전달
        processQueue(null, accessToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 대기 중인 요청들도 실패 처리
        processQueue(refreshError, null);
        console.error('[Token Refresh Failed]', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 에러 로깅
    if (import.meta.env.VITE_ENV === 'development') {
      console.error('[API Response Error]', error.response?.data || error.message);
    }

    // 에러 메시지 처리
    const errorMessage = error.response?.data?.message || error.message || '서버 오류가 발생했습니다.';

    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
    });
  }
);

export default axiosInstance;