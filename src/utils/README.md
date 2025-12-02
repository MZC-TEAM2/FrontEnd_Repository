# 유틸리티 함수

공통으로 사용되는 도우미 함수

## 파일
- `validation.js` - 검증 함수 (이메일, 비밀번호 등)
- `formatters.js` - 포맷팅 (숫자, 전화번호, 날짜)
- `storage.js` - 로컬 스토리지 관리

## 사용법

### validation
```javascript
import { validateEmail } from './utils/validation';

if (!validateEmail(email)) {
  alert('유효하지 않은 이메일입니다');
}
```

### formatters
```javascript
import { formatNumber } from './utils/formatters';

<p>가격: {formatNumber(50000)}원</p>  // "50,000원"
```

### storage
```javascript
import { saveToStorage, getFromStorage } from './utils/storage';

saveToStorage('token', 'abc123');
const token = getFromStorage('token');
```
