/**
 * App 컴포넌트
 *
 * LMS 시스템의 최상위 컴포넌트입니다.
 * Material UI 테마 설정과 라우팅을 관리합니다.
 *
 * 구조:
 * - ThemeProvider: Material UI 커스텀 테마 적용
 * - BrowserRouter: React Router 설정
 * - MainLayout: 전체 레이아웃 (헤더, 사이드바, 콘텐츠)
 *
 * 사용 방법:
 * 1. 새 페이지 추가 시 pages 폴더에 컴포넌트 생성
 * 2. 아래 라우터에 Route 추가
 * 3. Sidebar.jsx의 menuItems에 메뉴 추가
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// App.css 제거 - Material UI 스타일 사용

// 테마 설정 임포트
import theme from './theme/theme';

// 레이아웃 컴포넌트
import MainLayout from './layouts/MainLayout';

// 페이지 컴포넌트들
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Community from './pages/Community';
import CourseRegistration from './pages/CourseRegistration';
import CourseDetail from './pages/CourseDetail';
import CourseSchedule from './pages/CourseSchedule';
import Grades from './pages/Grades';

// 인증 관련 페이지
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Notifications from './pages/Notifications';

// 임시 페이지 컴포넌트 (나중에 실제 페이지로 교체)
import { Box, Typography, Paper } from '@mui/material';

/**
 * 임시 페이지 컴포넌트
 * 아직 구현되지 않은 페이지를 위한 플레이스홀더
 *
 * @param {string} title - 페이지 제목
 */
const TempPage = ({ title }) => (
  <Box>
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        이 페이지는 아직 준비 중입니다.
      </Typography>
    </Paper>
  </Box>
);

/**
 * App 컴포넌트
 */
function App() {
  return (
    // Material UI 테마 제공자
    <ThemeProvider theme={theme}>
      {/* CSS 기본값 초기화 */}
      <CssBaseline />

      {/* React Router 설정 */}
      <Router>
        <Routes>
          {/* 인증 관련 라우트 (MainLayout 없음) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 메인 앱 라우트 (MainLayout 포함) */}
          <Route element={<MainLayout />}>
            {/* 기본 경로 - 로그인 페이지로 리다이렉트 */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 대시보드 */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* 강의 관련 라우트 - 순서 중요: 구체적인 경로를 먼저 */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/all" element={<Courses />} />
            <Route path="/courses/my" element={<Courses />} />
            <Route path="/courses/schedule" element={<CourseSchedule />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />

            {/* 수강신청 */}
            <Route path="/registration" element={<CourseRegistration />} />

            {/* 과제 */}
            <Route path="/assignments" element={<TempPage title="과제" />} />

            {/* 퀴즈/시험 */}
            <Route path="/exams" element={<TempPage title="퀴즈/시험" />} />

            {/* 커뮤니티 관련 라우트 */}
            <Route path="/community" element={<Community />} />
            <Route path="/community/notices" element={<Community />} />
            <Route path="/community/board" element={<Community />} />
            <Route path="/community/qna" element={<Community />} />

            {/* 학습자 관리 */}
            <Route path="/students" element={<TempPage title="학습자 관리" />} />

            {/* 성적 조회 */}
            <Route path="/grades" element={<Grades />} />

            {/* 알림 */}
            <Route path="/notifications" element={<Notifications />} />

            {/* 설정 */}
            <Route path="/settings" element={<TempPage title="설정" />} />

            {/* 404 페이지 */}
            <Route
              path="*"
              element={
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                  <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 700, color: 'primary.main' }}>
                    404
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    페이지를 찾을 수 없습니다
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    요청하신 페이지가 존재하지 않습니다.
                  </Typography>
                </Box>
              }
            />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
