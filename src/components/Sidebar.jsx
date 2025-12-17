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

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import profileService from '../services/profileService';
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
import PersonIcon from '@mui/icons-material/Person';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import QuizIcon from '@mui/icons-material/Quiz';
import ClassIcon from '@mui/icons-material/Class';

/**
 * 학생용 메뉴 아이템
 */
const studentMenuItems = [
  {
    title: '학습 홈',
    path: '/dashboard',
    icon: <DashboardIcon />,
    description: '나의 학습 현황',
  },
  {
    title: '수강 과목',
    path: '/courses',
    icon: <SchoolIcon />,
    description: '이번 학기 수강 과목',
    children: [
      { title: '전체 과목', path: '/courses/all', icon: <MenuBookIcon /> },
      { title: '수강 중', path: '/courses/my', icon: <VideoLibraryIcon /> },
      { title: '시간표', path: '/courses/schedule', icon: <CalendarMonthIcon /> },
    ],
  },
  {
    title: '수강신청',
    path: '/registration',
    icon: <HowToRegIcon />,
    description: '수강신청 및 정정',
  },
  {
    divider: true, // 구분선
  },
  {
    title: '커뮤니티',
    path: '/community',
    icon: <ForumIcon />,
    description: '학교 커뮤니티',
    children: [
      { title: '학사 공지', path: '/community/notices', icon: <NotificationsIcon /> },
      { title: '자유게시판', path: '/community/board', icon: <ForumIcon /> },
      { title: '스터디 모집', path: '/community/study', icon: <GroupIcon /> },
      { title: '질문/답변', path: '/community/qna', icon: <QuizIcon /> },
    ],
  },
  {
    title: '성적 조회',
    path: '/grades',
    icon: <AssessmentIcon />,
    description: '성적 및 학점 확인',
  },
  {
    title: '학사 일정',
    path: '/calendar',
    icon: <CalendarMonthIcon />,
    description: '학사 일정 확인',
  },
  {
    divider: true, // 구분선
  },
  {
    title: '내 정보',
    path: '/profile',
    icon: <PersonIcon />,
    description: '학생 정보 관리',
  },
  {
    title: '설정',
    path: '/settings',
    icon: <SettingsIcon />,
    description: '알림 설정',
  },
];

/**
 * 교수용 메뉴 아이템
 */
const professorMenuItems = [
  {
    title: '대시보드',
    path: '/dashboard',
    icon: <DashboardIcon />,
    description: '강의 현황',
  },
  {
    title: '강의 관리',
    path: '/professor/my-courses',
    icon: <SchoolIcon />,
    description: '담당 강의 목록',
  },
  {
    title: '강의 등록',
    path: '/professor/courses',
    icon: <ClassIcon />,
    description: '강의 개설 및 삭제',
  },
  {
    divider: true, // 구분선
  },
  {
    title: '커뮤니티',
    path: '/community',
    icon: <ForumIcon />,
    description: '학교 커뮤니티',
    children: [
      { title: '학사 공지', path: '/community/notices', icon: <NotificationsIcon /> },
      { title: '자유게시판', path: '/community/board', icon: <ForumIcon /> },
      { title: '질문/답변', path: '/community/qna', icon: <QuizIcon /> },
    ],
  },
  {
    title: '학사 일정',
    path: '/calendar',
    icon: <CalendarMonthIcon />,
    description: '학사 일정 확인',
  },
  {
    divider: true, // 구분선
  },
  {
    title: '내 정보',
    path: '/profile',
    icon: <PersonIcon />,
    description: '교수 정보 관리',
  },
  {
    title: '설정',
    path: '/settings',
    icon: <SettingsIcon />,
    description: '알림 설정',
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
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (authService.isAuthenticated()) {
        try {
          const data = await profileService.getMyProfile();
          setProfile(data);
        } catch (err) {
          console.error('프로필 조회 실패:', err);
        }
      }
    };
    fetchProfile();
  }, []);

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
   * 사용자 타입에 따른 메뉴 아이템 반환
   */
  const getMenuItems = () => {
    const userType = profile?.userType || authService.getCurrentUser()?.userType;
    return userType === 'PROFESSOR' ? professorMenuItems : studentMenuItems;
  };

  const menuItems = getMenuItems();

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
            fontSize: '1.2rem',
            fontWeight: 700,
          }}
        >
          MZC
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            MZC 대학교
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            학습관리시스템
          </Typography>
        </Box>
      </Box>

      {/* 사용자 정보 영역 */}
      <Box
        sx={{
          p: 2,
          mx: 2,
          mt: 2,
          borderRadius: 2,
          bgcolor: theme.palette.primary.light + '20',
          border: `1px solid ${theme.palette.primary.light}40`,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: theme.palette.primary.light + '30',
          },
        }}
        onClick={() => navigate('/profile')}
      >
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
          {profile?.name || '사용자'}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          {profile?.collegeName || '-'} | {profile?.departmentName || '-'} | {profile?.studentId || profile?.professorId || '-'}
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
          © 2025 MZC University
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
