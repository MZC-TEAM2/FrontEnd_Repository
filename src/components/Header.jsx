/**
 * Header 컴포넌트
 *
 * LMS 시스템의 상단 헤더바를 구성하는 컴포넌트입니다.
 * 사이드바 토글, 검색, 알림, 사용자 메뉴 등을 제공합니다.
 *
 * 주요 기능:
 * - 사이드바 열기/닫기 토글
 * - 검색 기능
 * - 알림 표시
 * - 사용자 프로필 및 메뉴
 * - 반응형 디자인
 *
 * 사용방법:
 * <Header
 *   open={sidebarOpen}
 *   handleDrawerToggle={toggleFunction}
 *   drawerWidth={280}
 * />
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Badge,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// 아이콘 임포트
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import HelpIcon from '@mui/icons-material/Help';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import authService from '../services/authService';
import notificationService from '../services/notificationService';

/**
 * 검색창 컨테이너 스타일 컴포넌트
 * Material UI의 스타일드 컴포넌트를 사용하여
 * 커스텀 검색창을 구성합니다.
 */
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 2, // 더 둥근 모서리
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

/**
 * 검색 아이콘 래퍼 스타일 컴포넌트
 */
const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
}));

/**
 * 검색 입력 필드 스타일 컴포넌트
 */
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch', // 포커스 시 확장
      },
    },
  },
}));

/**
 * Header 컴포넌트
 *
 * @param {Object} props
 * @param {boolean} props.open - 사이드바 열림 상태
 * @param {Function} props.handleDrawerToggle - 사이드바 토글 함수
 * @param {number} props.drawerWidth - 사이드바 너비
 */
const Header = ({ open, handleDrawerToggle, drawerWidth }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // 상태 관리
  const [anchorEl, setAnchorEl] = useState(null); // 사용자 메뉴
  const [notificationAnchor, setNotificationAnchor] = useState(null); // 알림 메뉴
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null); // 모바일 메뉴
  const [darkMode, setDarkMode] = useState(false); // 다크모드 (임시)
  const [notifications, setNotifications] = useState([]); // 알림 목록
  const [unreadCount, setUnreadCount] = useState(0); // 읽지 않은 알림 개수
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // 현재 로그인한 사용자 정보

  // 알림 데이터 및 사용자 정보 가져오기
  useEffect(() => {
    // 인증된 사용자인 경우에만 알림 가져오기
    if (authService.isAuthenticated()) {
      // 사용자 정보 가져오기
      const user = authService.getCurrentUser();
      setCurrentUser(user);

      fetchNotifications();
      fetchUnreadCount();

      // 30초마다 알림 새로고침
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, []);

  /**
   * 알림 목록 가져오기
   */
  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const response = await notificationService.getNotifications(null, 5, true);
      // 백엔드 응답 구조에 맞게 수정 (notifications 배열)
      if (response.notifications) {
        // 알림 데이터 포맷팅
        const formattedNotifications = response.notifications.map(item => ({
          id: item.id,
          type: item.typeCode || item.category, // typeCode 또는 category 사용
          typeName: item.typeName, // 타입 이름 추가
          title: item.title,
          message: item.message, // content 대신 message
          time: notificationService.formatNotificationTime(item.createdAt),
          isRead: item.isRead,
        }));
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('알림 목록 조회 실패:', error);
      // API 연동 전까지는 더미 데이터 사용
      setNotifications([
        { id: 1, type: 'ASSIGNMENT', typeName: '과제', title: '데이터베이스 과제가 등록되었습니다', message: '과제 내용', time: '5분 전', isRead: false },
        { id: 2, type: 'ANNOUNCEMENT', typeName: '공지', title: '알고리즘 강의실이 변경되었습니다', message: '강의실 변경 안내', time: '1시간 전', isRead: false },
        { id: 3, type: 'EXAM', typeName: '시험', title: '운영체제 중간고사 공지', message: '시험 안내', time: '3시간 전', isRead: false },
      ]);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  /**
   * 읽지 않은 알림 개수 가져오기
   */
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error);
      // API 연동 전까지는 더미 데이터 사용
      setUnreadCount(3);
    }
  };

  /**
   * 알림 읽음 처리
   */
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        // 알림 목록 업데이트
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        // 읽지 않은 개수 감소
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
      }
    }
    handleMenuClose();
  };

  /**
   * 사용자 메뉴 열기
   */
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * 알림 메뉴 열기
   */
  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
    // 알림 메뉴를 열 때 최신 알림 가져오기
    if (authService.isAuthenticated()) {
      fetchNotifications();
    }
  };

  /**
   * 모바일 메뉴 열기
   */
  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  /**
   * 모든 메뉴 닫기
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchor(null);
    setMobileMenuAnchor(null);
  };

  /**
   * 다크모드 토글 (추후 구현)
   */
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // TODO: Redux나 Context를 통한 전역 테마 변경 구현
  };

  /**
   * 로그아웃 처리
   */
  const handleLogout = async () => {
    handleMenuClose();

    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 에러가 발생해도 로그인 페이지로 이동
      navigate('/login');
    }
  };


  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
        ml: { sm: open ? `${drawerWidth}px` : 0 },
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      <Toolbar>
        {/* 사이드바 토글 버튼 */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{
            mr: 2,
            color: theme.palette.primary.main,
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* 페이지 제목 (모바일에서는 숨김) */}
        {!isMobile && (
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
          >
            MZC 대학교 LMS
          </Typography>
        )}

        {/* 검색창 */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="검색..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        {/* 여백 채우기 */}
        <Box sx={{ flexGrow: 1 }} />

        {/* 데스크탑 아이콘 그룹 */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* 다크모드 토글 */}
            <Tooltip title="테마 변경">
              <IconButton onClick={toggleDarkMode} color="inherit">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {/* 메시지 아이콘 */}
            <Tooltip title="메시지">
              <IconButton color="inherit">
                <Badge badgeContent={2} color="error">
                  <MailIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* 알림 아이콘 */}
            <Tooltip title="알림">
              <IconButton
                color="inherit"
                onClick={handleNotificationMenuOpen}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* 도움말 */}
            <Tooltip title="도움말">
              <IconButton color="inherit">
                <HelpIcon />
              </IconButton>
            </Tooltip>

            {/* 사용자 프로필 */}
            <Tooltip title="내 프로필">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  {currentUser?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* 모바일 메뉴 버튼 */}
        {isMobile && (
          <IconButton
            color="inherit"
            onClick={handleMobileMenuOpen}
          >
            <MoreVertIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* 사용자 프로필 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* 사용자 정보 헤더 */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {currentUser?.name || '사용자'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentUser?.userNumber || currentUser?.userId || '학번 없음'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {currentUser?.email || '이메일 없음'}
          </Typography>
        </Box>
        <Divider />

        {/* 메뉴 아이템 */}
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>내 프로필</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>설정</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>로그아웃</ListItemText>
        </MenuItem>
      </Menu>

      {/* 알림 메뉴 */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 300,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            알림
          </Typography>
        </Box>
        <Divider />

        {/* 알림 리스트 */}
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.isRead ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2">
                  <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    [{notification.typeName || notificationService.getNotificationTypeLabel(notification.type)}]
                  </Box>{' '}
                  {notification.title || '제목 없음'}
                </Typography>
                {notification.message && (
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    {notification.message}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              {isLoadingNotifications ? '알림을 불러오는 중...' : '새로운 알림이 없습니다'}
            </Typography>
          </MenuItem>
        )}

        <Divider />
        <MenuItem onClick={() => {
          handleMenuClose();
          navigate('/notifications');
        }}>
          <Typography
            variant="body2"
            color="primary"
            sx={{ width: '100%', textAlign: 'center' }}
          >
            모든 알림 보기
          </Typography>
        </MenuItem>
      </Menu>

      {/* 모바일 메뉴 */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1.5 },
        }}
      >
        <MenuItem onClick={toggleDarkMode}>
          <ListItemIcon>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </ListItemIcon>
          <ListItemText>테마 변경</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Badge badgeContent={2} color="error">
              <MailIcon />
            </Badge>
          </ListItemIcon>
          <ListItemText>메시지</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleNotificationMenuOpen}>
          <ListItemIcon>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </ListItemIcon>
          <ListItemText>알림</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText>도움말</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleProfileMenuOpen}>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText>프로필</ListItemText>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;