# 스타일

전역 스타일 및 CSS 변수

## 파일
- `global.css` - 전역 스타일
- `variables.css` - CSS 변수 (색상, 간격, 폰트)

## 사용법

### CSS 변수 사용
```css
/* variables.css에 정의 */
:root {
  --primary: #007bff;
  --spacing-md: 16x;
}

/* 컴포넌트 CSS에서 사용 */
.button {
  background-color: var(--primary);
  padding: var(--spacing-md);
}
```

### import
```javascript
// main.jsx에서
import './styles/global.css';
```
