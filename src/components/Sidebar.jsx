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
import messageService from '../services/messageService';
import { getCurrentEnrollmentPeriod } from '../api/courseApi';
import { getCurrentCourseRegistrationPeriod } from '../api/professorApi';

// 읽지 않은 메시지 폴링 주기 (10초)
const UNREAD_COUNT_POLLING_INTERVAL = 10000;
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
import PersonIcon from '@mui/icons-material/Person';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import QuizIcon from '@mui/icons-material/Quiz';
import ClassIcon from '@mui/icons-material/Class';
import CampaignIcon from '@mui/icons-material/Campaign';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import MailIcon from '@mui/icons-material/Mail';

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
      { title: '학사 공지', path: '/notices', icon: <CampaignIcon /> },
      { title: '자유게시판', path: '/free', icon: <ForumIcon /> },
      { title: '질문게시판', path: '/questions', icon: <HelpOutlineIcon /> },
      { title: '토론게시판', path: '/discussions', icon: <RecordVoiceOverIcon /> },
      { title: '학과게시판', path: '/departments', icon: <AccountBalanceIcon /> },
      { title: '학생 게시판', path: '/boards/student', icon: <GroupsIcon />, requiredRole: 'STUDENT' },
      { title: '공모전', path: '/contest', icon: <EmojiEventsIcon /> },
      { title: '취업정보', path: '/career', icon: <WorkIcon /> },
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
    title: '메시지',
    path: '/messages',
    icon: <MailIcon />,
    description: '쪽지 보내기/받기',
    hasBadge: true, // 동적 뱃지 표시 플래그
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
    title: '시간표',
    path: '/professor/schedule',
    icon: <CalendarMonthIcon />,
    description: '담당 강의 시간표',
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
      { title: '학사 공지', path: '/notices', icon: <CampaignIcon /> },
      { title: '자유게시판', path: '/free', icon: <ForumIcon /> },
      { title: '질문게시판', path: '/questions', icon: <HelpOutlineIcon /> },
      { title: '토론게시판', path: '/discussion', icon: <RecordVoiceOverIcon /> },
      { title: '학과게시판', path: '/departments', icon: <AccountBalanceIcon /> },
      { title: '교수 게시판', path: '/boards/professor', icon: <SchoolIcon />, requiredRole: 'PROFESSOR' },
      { title: '공모전', path: '/contest', icon: <EmojiEventsIcon /> },
      { title: '취업정보', path: '/career', icon: <WorkIcon /> },
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
    title: '메시지',
    path: '/messages',
    icon: <MailIcon />,
    description: '쪽지 보내기/받기',
    hasBadge: true, // 동적 뱃지 표시 플래그
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

  // 기간 기반 메뉴 노출 제어
  // - STUDENT: ENROLLMENT 기간이 아닐 때 '/registration' 숨김
  // - PROFESSOR: COURSE_REGISTRATION 기간이 아닐 때 '/professor/courses' 숨김
  const [isStudentEnrollmentPeriodActive, setIsStudentEnrollmentPeriodActive] = useState(null); // null=unknown
  const [isProfessorCourseRegPeriodActive, setIsProfessorCourseRegPeriodActive] = useState(null); // null=unknown
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // 현재 기간 조회해서 메뉴 노출 제어
  useEffect(() => {
    if (!authService.isAuthenticated()) return;

    const userType = profile?.userType || authService.getCurrentUser()?.userType;
    if (!userType) return;

    let cancelled = false;

    const fetchPeriodFlags = async () => {
      try {
        if (userType === 'PROFESSOR') {
          const res = await getCurrentCourseRegistrationPeriod();
          // professorApi는 기간이 아니면 success:false로 내려줌
          const active = !!(res?.success && res?.data?.currentPeriod);
          if (!cancelled) setIsProfessorCourseRegPeriodActive(active);
        } else {
          const res = await getCurrentEnrollmentPeriod('ENROLLMENT');
          // 스펙 기준: currentPeriod.periodType.typeCode === ENROLLMENT
          const active = !!(
            res?.success &&
            res?.data?.currentPeriod &&
            res.data.currentPeriod?.periodType?.typeCode === 'ENROLLMENT'
          );
          if (!cancelled) setIsStudentEnrollmentPeriodActive(active);
        }
      } catch (err) {
        // 기간 조회 실패 시에는 UX 상 메뉴를 숨기지 않음(일시 장애로 메뉴 소실 방지)
        console.error('기간 조회 실패(사이드 메뉴 노출 제어):', err);
        if (!cancelled) {
          if (userType === 'PROFESSOR') setIsProfessorCourseRegPeriodActive(null);
          else setIsStudentEnrollmentPeriodActive(null);
        }
      }
    };

    fetchPeriodFlags();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  // 화면 포커스 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 읽지 않은 메시지 수 초기 로드
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (authService.isAuthenticated()) {
        try {
          const count = await messageService.getUnreadCount();
          setUnreadCount(count || 0);
        } catch (err) {
          console.error('읽지 않은 메시지 수 조회 실패:', err);
        }
      }
    };
    fetchUnreadCount();
  }, []);

  // 읽지 않은 메시지 수 폴링 (10초 주기)
  useEffect(() => {
    if (!isPageVisible || !authService.isAuthenticated()) return;

    const pollUnreadCount = setInterval(async () => {
      try {
        const count = await messageService.getUnreadCount();
        setUnreadCount(count || 0);
      } catch (err) {
        console.error('읽지 않은 메시지 수 폴링 실패:', err);
      }
    }, UNREAD_COUNT_POLLING_INTERVAL);

    return () => clearInterval(pollUnreadCount);
  }, [isPageVisible]);

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
    const items = userType === 'PROFESSOR' ? professorMenuItems : studentMenuItems;

    const filtered = items.filter((item) => {
      // divider는 후처리에서 정리
      if (item.divider) return true;

      // 학생: 수강신청 기간이 "확실히" 아닐 때만 숨김
      if (userType !== 'PROFESSOR' && item.path === '/registration') {
        return isStudentEnrollmentPeriodActive !== false;
      }

      // 교수: 강의 등록 기간이 "확실히" 아닐 때만 숨김
      if (userType === 'PROFESSOR' && item.path === '/professor/courses') {
        return isProfessorCourseRegPeriodActive !== false;
      }

      return true;
    });

    // divider 정리: 첫/마지막 divider 제거, 연속 divider 제거
    const cleaned = [];
    for (const it of filtered) {
      if (it.divider) {
        if (cleaned.length === 0) continue;
        if (cleaned[cleaned.length - 1].divider) continue;
      }
      cleaned.push(it);
    }
    while (cleaned.length && cleaned[cleaned.length - 1].divider) cleaned.pop();

    return cleaned;
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
