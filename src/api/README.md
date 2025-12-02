# API 통신

Axios를 사용한 백엔드 API 통신 설정

## 파일 구조
```
api/
├── axiosInstance.js    # Axios 인스턴스 설정
└── interceptors.js     # 요청/응답 인터셉터 (선택)
```

## 사용법

### 기본 사용
```javascript
import axiosInstance from './api/axiosInstance';

// GET 요청
const data = await axiosInstance.get('/users');

// POST 요청
const result = await axiosInstance.post('/login', { email, password });
```

### 도메인 API에서 사용
```javascript
// domains/user/userApi.js
import axiosInstance from '../../api/axiosInstance';

export const login = async (credentials) => {
  const response = await axiosInstance.post('/user/login', credentials);
  return response.data;
};
```
