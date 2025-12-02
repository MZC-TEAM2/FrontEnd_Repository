# 커스텀 훅

재사용 가능한 로직을 훅으로 추상화

## 주요 훅
- `useAuth.js` - 인증 상태 및 함수
- `useFetch.js` - API 호출 및 로딩 상태
- `useForm.js` - 폼 입력 및 검증

## 사용법

### useAuth
```javascript
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return isAuthenticated ? (
    <div>
      <span>{user.name}님</span>
      <button onClick={logout}>로그아웃</button>
    </div>
  ) : (
    <a href="/login">로그인</a>
  );
}
```
