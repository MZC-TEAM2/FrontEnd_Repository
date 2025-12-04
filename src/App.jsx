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

// 테마 설정 임포트
import theme from './theme/theme';

// 레이아웃 컴포넌트
import MainLayout from './layouts/MainLayout';

// 페이지 컴포넌트들
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Community from './pages/Community';

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
        {/* 메인 레이아웃으로 감싸기 */}
        <MainLayout>
          <Routes>
            {/* 기본 경로 - 대시보드로 리다이렉트 */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 대시보드 */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* 강의 관련 라우트 */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/all" element={<Courses />} />
            <Route path="/courses/my" element={<Courses />} />
            <Route path="/courses/schedule" element={<TempPage title="강의 일정" />} />

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

            {/* 성적/통계 */}
            <Route path="/analytics" element={<TempPage title="성적/통계" />} />

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
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
