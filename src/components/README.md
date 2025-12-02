# 공통 컴포넌트

전체 앱에서 재사용 가능한 UI 컴포넌트

## 주요 컴포넌트
- `Button.jsx` - 버튼
- `Input.jsx` - 입력 필드
- `Card.jsx` - 카드
- `Modal.jsx` - 모달
- `Loading.jsx` - 로딩 스피너
- `Layout.jsx` - 레이아웃

## 사용법

### Button
```javascript
import Button from './components/Button';

<Button variant="primary" onClick={handleClick}>
  클릭하기
</Button>
```

### Layout
```javascript
import Layout from './components/Layout';

<Layout>
  <YourPageContent />
</Layout>
```
