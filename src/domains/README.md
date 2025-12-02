# Domains (도메인별 기능)

백엔드와 동일한 구조로 도메인별 기능 관리

## 도메인 구조
```
domains/
├── user/      # 사용자: 로그인, 프로필, 알림
├── course/    # 강좌: 목록, 상세, 수강신청, 성적
└── board/     # 게시판: 토론, 질문
```

## 각 도메인 구성
```
user/
├── LoginPage.jsx      # 페이지
├── ProfilePage.jsx    # 페이지
├── LoginForm.jsx      # 컴포넌트
└── userApi.js         # API 함수
```

## 사용법
```javascript
// 페이지 import
import LoginPage from './domains/user/LoginPage';

// API 함수 사용
import { login } from './domains/user/userApi';
const data = await login(credentials);
```
