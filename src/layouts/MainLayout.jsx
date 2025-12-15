/**
 * MainLayout 컴포넌트
 *
 * LMS 시스템의 메인 레이아웃을 구성하는 컴포넌트입니다.
 * 로그인 후 보여지는 전체 페이지의 구조를 정의합니다.
 *
 * 구성요소:
 * - Header: 상단 헤더 영역
 * - Sidebar: 왼쪽 네비게이션 메뉴
 * - Content: 메인 콘텐츠 영역
 *
 * 사용방법:
 * <MainLayout>
 *   <YourComponent />
 * </MainLayout>
 */

import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

// 사이드바 너비 상수 정의
const DRAWER_WIDTH = 280; // 사이드바 너비 (픽셀)

/**
 * 메인 콘텐츠 영역 스타일 컴포넌트
 *
 * 사이드바가 열려있을 때와 닫혀있을 때의
 * 콘텐츠 영역 너비를 자동으로 조정합니다.
 */
const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3), // 24px 패딩
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  width: '100%',
  // 사이드바가 열려있을 때 너비 조정
  ...(open && {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: `${DRAWER_WIDTH}px`,
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
  }),
}));

/**
 * MainLayout 컴포넌트
 *
 * React Router v6의 Outlet을 사용하여 중첩된 라우트를 렌더링합니다.
 */
const MainLayout = () => {
  // 사이드바 열림/닫힘 상태 관리
  // true: 사이드바 열림, false: 사이드바 닫힘
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /**
   * 사이드바 토글 함수
   * 사이드바를 열거나 닫습니다.
   */
  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* CSS 기본값 초기화 */}
      <CssBaseline />

      {/* 상단 헤더 컴포넌트 */}
      <Header
        open={sidebarOpen}
        handleDrawerToggle={handleDrawerToggle}
        drawerWidth={DRAWER_WIDTH}
      />

      {/* 왼쪽 사이드바 네비게이션 */}
      <Sidebar
        open={sidebarOpen}
        handleDrawerToggle={handleDrawerToggle}
        drawerWidth={DRAWER_WIDTH}
      />

      {/* 메인 콘텐츠 영역 */}
      <Main open={sidebarOpen}>
        {/* 헤더 높이만큼 여백 추가 */}
        <Toolbar />

        {/* 실제 콘텐츠가 표시되는 영역 */}
        <Box
          sx={{
            py: { xs: 2, sm: 3 }, // 상하 패딩
            px: { xs: 2, sm: 3 }, // 좌우 패딩
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          <Outlet />
        </Box>
      </Main>
    </Box>
  );
};

export default MainLayout;
