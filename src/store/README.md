# Redux 상태 관리

Redux Toolkit을 사용한 전역 상태 관리

## 구조

```
store/
├── store.js           # Store 설정
└── slices/
    ├── authSlice.js   # 인증 상태
    └── userSlice.js   # 사용자 정보
```

## 사용법

### Slice에서 상태 가져오기

```javascript
import { useSelector } from 'react-redux';

function MyComponent() {
  const { user, isAuthenticated } = useSelector(state => state.auth);
}
```

### 액션 dispatch

```javascript
import { useDispatch } from 'react-redux';
import { logout } from './store/slices/authSlice';

function Header() {
  const dispatch = useDispatch();
  return <button onClick={() => dispatch(logout())}>로그아웃</button>;
}
```
