# 공통 페이지

도메인에 속하지 않는 공통 페이지

## 페이지 목록
- `HomePage.jsx` - 메인 홈
- `DashboardPage.jsx` - 대시보드 (여러 도메인 통합)
- `NotFoundPage.jsx` - 404 에러
- `ErrorPage.jsx` - 일반 에러

## 사용법

### 라우팅에서 사용
```javascript
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

## 구분
- **pages/**: 공통 페이지
- **domains/**: 도메인별 페이지
