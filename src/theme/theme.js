/**
 * 테마 설정 파일
 *
 * 이 파일은 Material UI의 커스텀 테마를 정의합니다.
 * 파스텔톤 파란색을 기본 색상으로 사용하고 있습니다.
 *
 * 사용방법:
 * 1. App.js에서 ThemeProvider로 감싸서 사용
 * 2. 컴포넌트에서 useTheme() 훅으로 테마 접근 가능
 */

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    // Primary 색상: 파스텔 블루
    primary: {
      main: '#6FA3EB', // 메인 파스텔 블루
      light: '#9CC0F5', // 밝은 파스텔 블루
      dark: '#4B8FE8', // 진한 파스텔 블루
      contrastText: '#FFFFFF', // 텍스트 색상
    },
    // Secondary 색상: 연한 파스텔 블루
    secondary: {
      main: '#A5C9EA',
      light: '#C4DEF5',
      dark: '#7BB1E0',
      contrastText: '#FFFFFF',
    },
    // 배경 색상
    background: {
      default: '#F5F9FF', // 매우 연한 파스텔 블루 배경
      paper: '#FFFFFF', // 카드나 페이퍼 배경
    },
    // 텍스트 색상
    text: {
      primary: '#2C3E50', // 진한 네이비 그레이
      secondary: '#546E7A', // 중간 톤 그레이
    },
    // 구분선 색상
    divider: '#E3F2FD',
    // 성공, 에러, 경고, 정보 색상
    success: {
      main: '#81C784', // 파스텔 그린
    },
    error: {
      main: '#EF9A9A', // 파스텔 레드
    },
    warning: {
      main: '#FFD54F', // 파스텔 옐로우
    },
    info: {
      main: '#6FA3EB', // 파스텔 블루 (primary와 동일)
    },
  },
  // 타이포그래피 설정
  typography: {
    fontFamily: [
      'Pretendard', // 한글 폰트
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  // 컴포넌트별 기본 스타일 오버라이드
  components: {
    // 버튼 스타일 커스터마이징
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // 둥근 모서리
          textTransform: 'none', // 대문자 변환 비활성화
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(111, 163, 235, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(111, 163, 235, 0.3)',
          },
        },
      },
    },
    // 카드 스타일 커스터마이징
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(111, 163, 235, 0.15)',
          },
        },
      },
    },
    // 네비게이션 드로어 스타일
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FAFCFF', // 매우 연한 파스텔 블루
          borderRight: '1px solid #E3F2FD',
        },
      },
    },
    // 리스트 아이템 스타일
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(111, 163, 235, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(111, 163, 235, 0.25)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(111, 163, 235, 0.08)',
          },
        },
      },
    },
    // App Bar 스타일
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#2C3E50',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
  // 그림자 효과 커스터마이징
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 3px 6px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.05)',
    '0px 5px 10px rgba(0, 0, 0, 0.05)',
    '0px 6px 12px rgba(0, 0, 0, 0.06)',
    '0px 7px 14px rgba(0, 0, 0, 0.06)',
    '0px 8px 16px rgba(0, 0, 0, 0.06)',
    '0px 9px 18px rgba(0, 0, 0, 0.06)',
    '0px 10px 20px rgba(0, 0, 0, 0.07)',
    '0px 11px 22px rgba(0, 0, 0, 0.07)',
    '0px 12px 24px rgba(0, 0, 0, 0.07)',
    '0px 13px 26px rgba(0, 0, 0, 0.07)',
    '0px 14px 28px rgba(0, 0, 0, 0.08)',
    '0px 15px 30px rgba(0, 0, 0, 0.08)',
    '0px 16px 32px rgba(0, 0, 0, 0.08)',
    '0px 17px 34px rgba(0, 0, 0, 0.08)',
    '0px 18px 36px rgba(0, 0, 0, 0.09)',
    '0px 19px 38px rgba(0, 0, 0, 0.09)',
    '0px 20px 40px rgba(0, 0, 0, 0.09)',
    '0px 21px 42px rgba(0, 0, 0, 0.09)',
    '0px 22px 44px rgba(0, 0, 0, 0.10)',
    '0px 23px 46px rgba(0, 0, 0, 0.10)',
    '0px 24px 48px rgba(0, 0, 0, 0.10)',
    '0px 25px 50px rgba(0, 0, 0, 0.10)',
  ],
  // 브레이크포인트 (반응형 디자인)
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default theme;