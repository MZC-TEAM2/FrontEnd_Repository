# MZC 1st Frontend Project - LMS (Learning Management System)

대학교 학습 관리 시스템 프론트엔드 클라이언트

---

## Tech Stack

| Category         | Technology                           |
|------------------|--------------------------------------|
| Language         | JavaScript (ES6+)                    |
| Framework        | React 19.2                           |
| Build Tool       | Vite 7.2                             |
| State Management | React Context API                    |
| UI Library       | MUI (Material-UI) 7.3                |
| HTTP Client      | Axios 1.13                           |
| Routing          | React Router DOM 7.10                |
| Date Handling    | date-fns 4.1                         |
| File Upload      | tus-js-client 4.3 (Resumable Upload) |
| PDF Export       | jsPDF 3.0, html2canvas 1.4           |
| Code Quality     | ESLint 9.39                          |

---

## Documentation

| Document                                         | Description     |
|--------------------------------------------------|-----------------|
| [API Specification](./docs/API_SPECIFICATION.md) | 프론트엔드 API 호출 명세 |
| [Development Guide](./docs/DEVELOPMENT_GUIDE.md) | 개발 환경 설정 및 가이드  |
| [Package Structure](./docs/PACKAGE_STRUCTURE.md) | 패키지 구조 설명       |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Browser (Client)                                │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         React Application                              │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │   Pages     │  │ Components  │  │   Layouts   │  │   Contexts  │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  │         │                │                │                │          │  │
│  │         └────────────────┴────────────────┴────────────────┘          │  │
│  │                                   │                                    │  │
│  │  ┌────────────────────────────────┴────────────────────────────────┐  │  │
│  │  │                 React Context API (State Management)            │  │  │
│  │  └────────────────────────────────┬────────────────────────────────┘  │  │
│  │                                   │                                    │  │
│  │  ┌────────────────────────────────┴────────────────────────────────┐  │  │
│  │  │                    API Layer (Axios Instance)                   │  │  │
│  │  │  • JWT Token 자동 첨부                                           │  │  │
│  │  │  • Request/Response Interceptor                                 │  │  │
│  │  │  • Error Handling                                               │  │  │
│  │  └────────────────────────────────┬────────────────────────────────┘  │  │
│  └───────────────────────────────────┼───────────────────────────────────┘  │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Backend API Server                                 │
│                    http://localhost:8080 (Spring Boot)                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Features / Pages

| Page                   | Description                    |
|------------------------|--------------------------------|
| **Dashboard**          | 학생/교수 대시보드 (오늘 강의, 미제출 과제, 알림) |
| **Login / SignUp**     | 로그인, 회원가입, 비밀번호 찾기             |
| **Courses**            | 강의 목록, 강의 상세, 수강신청             |
| **CourseRegistration** | 수강신청, 장바구니                     |
| **CourseSchedule**     | 시간표 조회                         |
| **Grades**             | 성적 조회                          |
| **Community**          | 게시판 (공지, 자유, 질문 )              |
| **Messages**           | 1:1 메시지                        |
| **Notifications**      | 알림 목록                          |
| **Profile / Settings** | 프로필 관리, 설정                     |
| **Assessment**         | 시험/퀴즈 응시                       |
| **Professor Pages**    | 교수 전용 (강의 관리, 일정 관리)           |

---

## Project Structure

```
src/
├── api/                    # API 호출 모듈
│   ├── axiosInstance.js    # Axios 인스턴스 설정
│   ├── courseApi.js        # 강의 API
│   ├── assessmentApi.js    # 시험/퀴즈 API
│   ├── assignmentApi.js    # 과제 API
│   ├── postApi.js          # 게시글 API
│   └── ...
├── components/             # 재사용 컴포넌트
│   ├── Header.jsx          # 헤더
│   ├── Sidebar.jsx         # 사이드바
│   ├── ErrorDialog.jsx     # 에러 다이얼로그
│   └── attendance/         # 출석 관련 컴포넌트
├── contexts/               # React Context
├── domains/                # 도메인별 비즈니스 로직
├── hooks/                  # 커스텀 훅
├── layouts/                # 레이아웃 컴포넌트
├── pages/                  # 페이지 컴포넌트
│   ├── Dashboard.jsx       # 대시보드
│   ├── Login.jsx           # 로그인
│   ├── Courses.jsx         # 강의 목록
│   └── ...
├── services/               # 서비스 레이어
├── store/                  # 상태 관리 (미사용)
├── styles/                 # 스타일 파일
├── theme/                  # MUI 테마 설정
└── utils/                  # 유틸리티 함수
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

```

---

### Access Points

| Service     | URL                   |
|-------------|-----------------------|
| Dev Server  | http://localhost:5173 |
| Backend API | http://localhost:8080 |

---
