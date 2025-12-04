/**
 * Sidebar 컴포넌트
 *
 * LMS 시스템의 왼쪽 사이드바 네비게이션을 담당하는 컴포넌트입니다.
 * 로그인 후 메인 메뉴를 표시하고 페이지 간 이동을 제공합니다.
 *
 * 기능:
 * - 메뉴 아이템 표시 및 네비게이션
 * - 현재 선택된 메뉴 하이라이트
 * - 반응형 디자인 (모바일에서는 임시 드로어로 동작)
 * - 메뉴 그룹화 및 계층 구조 지원
 *
 * 사용방법:
 * <Sidebar
 *   open={true}
 *   handleDrawerToggle={toggleFunction}
 *   drawerWidth={280}
 * />
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
} from '@mui/material';

// Material UI 아이콘 임포트
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import ForumIcon from '@mui/icons-material/Forum';
import GroupIcon from '@mui/icons-material/Group';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import NotificationsIcon from '@mui/icons-material/Notifications';

/**
 * 메뉴 아이템 설정
 *
 * title: 메뉴 이름
 * path: 이동할 경로
 * icon: 표시할 아이콘
 * badge: 알림 뱃지 (선택사항)
 * children: 하위 메뉴 (선택사항)
 * divider: 구분선 표시 여부 (선택사항)
 */
const menuItems = [
  {
    title: '대시보드',
    path: '/dashboard',
    icon: <DashboardIcon />,
    description: '전체 현황 보기',
  },
  {
    title: '강의',
    path: '/courses',
    icon: <SchoolIcon />,
    description: '수강 중인 강의',
    children: [
      { title: '전체 강의', path: '/courses/all', icon: <MenuBookIcon /> },
      { title: '내 강의', path: '/courses/my', icon: <VideoLibraryIcon /> },
      { title: '강의 일정', path: '/courses/schedule', icon: <CalendarMonthIcon /> },
    ],
  },
  {
    title: '과제',
    path: '/assignments',
    icon: <AssignmentIcon />,
    description: '과제 및 제출',
    badge: '3', // 미완료 과제 수
  },
  {
    title: '퀴즈/시험',
    path: '/exams',
    icon: <QuizIcon />,
    description: '평가 및 시험',
  },
  {
    divider: true, // 구분선
  },
  {
    title: '커뮤니티',
    path: '/community',
    icon: <ForumIcon />,
    description: '토론 및 Q&A',
    children: [
      { title: '공지사항', path: '/community/notices', icon: <NotificationsIcon /> },
      { title: '자유게시판', path: '/community/board', icon: <ForumIcon /> },
      { title: 'Q&A', path: '/community/qna', icon: <QuizIcon /> },
    ],
  },
  {
    title: '학습자 관리',
    path: '/students',
    icon: <GroupIcon />,
    description: '학생 정보 관리',
  },
  {
    title: '성적/통계',
    path: '/analytics',
    icon: <AssessmentIcon />,
    description: '성적 및 분석',
  },
  {
    divider: true, // 구분선
  },
  {
    title: '설정',
    path: '/settings',
    icon: <SettingsIcon />,
    description: '시스템 설정',
  },
];

/**
 * Sidebar 컴포넌트
 *
 * @param {Object} props
 * @param {boolean} props.open - 사이드바 열림/닫힘 상태
 * @param {Function} props.handleDrawerToggle - 사이드바 토글 함수
 * @param {number} props.drawerWidth - 사이드바 너비
 */
const Sidebar = ({ open, handleDrawerToggle, drawerWidth }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 서브메뉴 열림/닫힘 상태 관리
  const [openSubmenu, setOpenSubmenu] = useState({});

  /**
   * 메뉴 클릭 핸들러
   * @param {string} path - 이동할 경로
   */
  const handleMenuClick = (path) => {
    navigate(path);
    // 모바일에서는 메뉴 클릭 시 사이드바 닫기
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  /**
   * 서브메뉴 토글 핸들러
   * @param {string} title - 메뉴 제목
   */
  const handleSubmenuToggle = (title) => {
    setOpenSubmenu((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  /**
   * 현재 경로가 메뉴 경로와 일치하는지 확인
   * @param {string} path - 확인할 경로
   * @returns {boolean} 일치 여부
   */
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  /**
   * 사이드바 콘텐츠 렌더링
   */
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 로고/브랜드 영역 */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: theme.palette.primary.main,
            fontSize: '1.5rem',
            fontWeight: 600,
          }}
        >
          L
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            LMS System
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Learning Management
          </Typography>
        </Box>
      </Box>

      {/* 사용자 정보 영역 (옵션) */}
      <Box
        sx={{
          p: 2,
          mx: 2,
          mt: 2,
          borderRadius: 2,
          bgcolor: theme.palette.primary.light + '20',
          border: `1px solid ${theme.palette.primary.light}40`,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
          환영합니다!
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          백엔드 개발자님
        </Typography>
      </Box>

      {/* 메뉴 리스트 */}
      <List sx={{ flexGrow: 1, pt: 2, px: 1 }}>
        {menuItems.map((item, index) => {
          // 구분선 렌더링
          if (item.divider) {
            return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
          }

          // 하위 메뉴가 있는 경우
          if (item.children) {
            return (
              <Box key={item.title}>
                <ListItemButton
                  onClick={() => handleSubmenuToggle(item.title)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive(item.path)
                      ? theme.palette.primary.light + '20'
                      : 'transparent',
                  }}
                >
                  <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={item.description}
                    primaryTypographyProps={{ fontWeight: isActive(item.path) ? 600 : 400 }}
                  />
                  {openSubmenu[item.title] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                {/* 하위 메뉴 */}
                <Collapse in={openSubmenu[item.title]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.title}
                        onClick={() => handleMenuClick(child.path)}
                        sx={{
                          pl: 4,
                          borderRadius: 2,
                          mb: 0.5,
                          backgroundColor: isActive(child.path)
                            ? theme.palette.primary.light + '20'
                            : 'transparent',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>{child.icon}</ListItemIcon>
                        <ListItemText
                          primary={child.title}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: isActive(child.path) ? 600 : 400,
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          }

          // 일반 메뉴 아이템
          return (
            <ListItemButton
              key={item.title}
              onClick={() => handleMenuClick(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                backgroundColor: isActive(item.path)
                  ? theme.palette.primary.light + '20'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.primary.light + '10',
                },
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{item.title}</span>
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        color="error"
                        sx={{ height: 20, fontSize: '0.75rem' }}
                      />
                    )}
                  </Box>
                }
                secondary={item.description}
                primaryTypographyProps={{ fontWeight: isActive(item.path) ? 600 : 400 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* 하단 정보 영역 */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          © 2024 LMS System
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={handleDrawerToggle}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;