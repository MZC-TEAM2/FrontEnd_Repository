# Assets (정적 자산)

이미지, 아이콘, 폰트 등의 정적 파일 저장

## 폴더 구조
```
assets/
├── images/    # 이미지 파일 (.png, .jpg, .svg)
├── icons/     # 아이콘 파일 (SVG 권장)
└── fonts/     # 커스텀 폰트
```

## 사용법

### 이미지 import
```javascript
import logo from './assets/images/logo.png';

function Header() {
  return <img src={logo} alt="Logo" />;
}
```

### SVG 아이콘
```javascript
import { ReactComponent as UserIcon } from './assets/icons/user.svg';

function Profile() {
  return <UserIcon className="icon" />;
}
```
