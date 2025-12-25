# 프론트엔드 개발 가이드

## 개발 환경 설정

### 필수 도구

```bash
node --version  # v14 이상
npm --version
```

### 라이브러리 설치

```bash
npm install @reduxjs/toolkit react-redux react-router-dom axios
```

### 환경 변수 (.env)

```
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

---

## 페이지 만들기

```javascript
// src/pages/HomePage.jsx
function HomePage() {
  return <h1>학습 관리 시스템</h1>;
}
export default HomePage;
```

---

## API 연동

### Axios 설정

```javascript
// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
```

### API 함수

```javascript
// src/domains/user/userApi.js
import axiosInstance from '../../api/axiosInstance';

export const login = async (email, password) => {
  const res = await axiosInstance.post('/user/login', { email, password });
  return res.data;
};
```

### 사용

```javascript
import { login } from './userApi';

const handleLogin = async () => {
  const data = await login(email, password);
  localStorage.setItem('token', data.token);
};
```

---

## Redux

### Store 설정

```javascript
// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: { auth: authReducer }
});
```

### Slice

```javascript
// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuthenticated: false },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    }
  }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
```

### Provider

```javascript
// src/main.jsx
import { Provider } from 'react-redux';
import { store } from './store/store';

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

### 사용

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './store/slices/authSlice';

function Header() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  return isAuthenticated ? (
    <button onClick={() => dispatch(logout())}>로그아웃</button>
  ) : (
    <a href="/login">로그인</a>
  );
}
```

---

## 라우팅

### 기본

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 보호된 라우트

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector(state => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// 사용
<Route path="/dashboard" element={
  <ProtectedRoute><DashboardPage /></ProtectedRoute>
} />
```

---

## 스타일링

```css
/* src/styles/variables.css */
:root {
  --primary: #007bff;
  --spacing-md: 16px;
  --font-md: 16px;
}

/* src/styles/global.css */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-size: var(--font-md); }
.container { max-width: 1200px; margin: 0 auto; }
```

---

## 배포

```bash
npm run build
```

**.env.production**

```
REACT_APP_API_BASE_URL=https://api.example.com
```

---

마지막 업데이트: 2025-12-02
