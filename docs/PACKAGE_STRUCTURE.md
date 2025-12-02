# 프론트엔드 패키지 구조

## 전체 구조

```
frontend/
├── src/
│   ├── api/                 # API 통신 (Axios)
│   ├── assets/              # 이미지, 아이콘, 폰트
│   ├── components/          # 공통 컴포넌트 (Button, Input, Layout)
│   ├── domains/             # 도메인별 기능
│   │   ├── user/            # LoginPage, ProfilePage, userApi.js
│   │   ├── course/          # CourseListPage, courseApi.js
│   │   └── board/           # DiscussionPage, boardApi.js
│   ├── hooks/               # 커스텀 훅 (useAuth, useFetch)
│   ├── pages/               # 공통 페이지 (HomePage, NotFoundPage)
│   ├── store/               # Redux (store.js, slices/)
│   ├── styles/              # 스타일 (global.css, variables.css)
│   ├── utils/               # 유틸리티 (validation, formatters)
│   ├── App.jsx              # 라우팅
│   └── main.jsx             # 엔트리
├── public/                  # 정적 파일
└── docs/                    # 문서
```

---

## 주요 폴더

### domains/ - 도메인별 기능
각 도메인의 페이지, 컴포넌트, API를 **평면적**으로 관리

```
user/
├── LoginPage.jsx        # 페이지
├── ProfilePage.jsx      # 페이지
├── LoginForm.jsx        # 컴포넌트
└── userApi.js           # API
```

### components/ - 공통 컴포넌트
재사용 가능한 UI: Button, Input, Card, Modal, Layout

### pages/ - 공통 페이지
도메인 외 페이지: HomePage, DashboardPage, NotFoundPage

### store/ - Redux
```
store/
├── store.js
└── slices/
    ├── authSlice.js
    └── userSlice.js
```

---

## 코드 예시

### API (domains/user/userApi.js)
```javascript
import axiosInstance from '../../api/axiosInstance';

export const login = async (credentials) => {
  const res = await axiosInstance.post('/user/login', credentials);
  return res.data;
};
```

### 페이지 (domains/user/LoginPage.jsx)
```javascript
import Layout from '../../components/Layout';
import LoginForm from './LoginForm';

function LoginPage() {
  return (
    <Layout showHeader={false}>
      <LoginForm />
    </Layout>
  );
}

export default LoginPage;
```

### Redux (store/slices/authSlice.js)
```javascript
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuthenticated: false },
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
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

### 라우팅 (App.jsx)
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './domains/user/LoginPage';

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

---

## 개발 순서

1. **도메인 파악**: user, course, board 중 선택
2. **페이지 생성**: `domains/[도메인]/[이름]Page.jsx`
3. **컴포넌트 작성**: 필요시 같은 폴더에 추가
4. **API 작성**: `domains/[도메인]/[이름]Api.js`
5. **라우팅 추가**: `App.jsx`에 Route 추가

---

## 파일 위치

| 기능 | 위치 |
|------|------|
| 사용자 | `src/domains/user/` |
| 강좌 | `src/domains/course/` |
| 게시판 | `src/domains/board/` |
| 공통 컴포넌트 | `src/components/` |
| 공통 페이지 | `src/pages/` |
| Redux | `src/store/slices/` |

---

## 구조 원칙

1. **도메인 기반**: 백엔드와 동일 (user, course, board)
2. **평면적 구조**: 폴더 깊이 최대 3단계
3. **명확한 분리**: pages(공통) vs domains(도메인별)
4. **함께 관리**: 페이지, 컴포넌트, API를 한 폴더에

---

마지막 업데이트: 2025-12-02
