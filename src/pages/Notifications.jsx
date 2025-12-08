import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  Announcement as AnnouncementIcon,
  Quiz as QuizIcon,
  Grade as GradeIcon,
  School as SchoolIcon,
  EventNote as EventNoteIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  DoneAll as DoneAllIcon,
  DeleteSweep as DeleteSweepIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import notificationService from '../services/notificationService';
import NotificationDetailDialog from '../components/NotificationDetailDialog';
import { truncateText } from '../utils/textUtils';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState(0); // 0: 전체, 1: 읽지 않음
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // 알림 타입별 아이콘
  const getNotificationIcon = (type) => {
    const icons = {
      ASSIGNMENT: <AssignmentIcon />,
      EXAM: <QuizIcon />,
      ANNOUNCEMENT: <AnnouncementIcon />,
      GRADE: <GradeIcon />,
      LECTURE: <SchoolIcon />,
      ATTENDANCE: <EventNoteIcon />,
      SYSTEM: <InfoIcon />,
    };
    return icons[type] || <NotificationsIcon />;
  };

  // 알림 타입별 색상
  const getTypeColor = (type) => {
    const colors = {
      ASSIGNMENT: 'primary',
      EXAM: 'error',
      ANNOUNCEMENT: 'info',
      GRADE: 'success',
      LECTURE: 'secondary',
      ATTENDANCE: 'warning',
      SYSTEM: 'default',
    };
    return colors[type] || 'default';
  };

  // 알림 목록 가져오기
  const fetchNotifications = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const response = await notificationService.getNotifications(
        isLoadMore ? cursor : null,
        20,
        selectedTab === 1 // 읽지 않음 탭인 경우
      );

      if (response.notifications) {
        if (isLoadMore) {
          setNotifications(prev => [...prev, ...response.notifications]);
        } else {
          setNotifications(response.notifications);
        }
        setCursor(response.nextCursor);
        setHasNext(response.hasNext);
        if (response.unreadCount !== undefined) {
          setUnreadCount(response.unreadCount);
        }
      }
    } catch (error) {
      console.error('알림 목록 조회 실패:', error);
      setError('알림을 불러오는데 실패했습니다.');

      // 더미 데이터 (개발 중)
      const dummyNotifications = [
        {
          id: 1,
          typeCode: 'ASSIGNMENT',
          typeName: '과제',
          title: '데이터베이스 설계 과제 제출',
          message: '12월 15일까지 데이터베이스 설계 과제를 제출해주세요.',
          createdAt: new Date().toISOString(),
          isRead: false,
        },
        {
          id: 2,
          typeCode: 'EXAM',
          typeName: '시험',
          title: '운영체제 중간고사 일정 공지',
          message: '12월 20일 오후 2시, 공학관 301호에서 중간고사가 진행됩니다.',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          isRead: false,
        },
        {
          id: 3,
          typeCode: 'ANNOUNCEMENT',
          typeName: '공지',
          title: '알고리즘 강의실 변경 안내',
          message: '이번 주 알고리즘 강의는 공학관 401호에서 진행됩니다.',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          isRead: true,
        },
        {
          id: 4,
          typeCode: 'GRADE',
          typeName: '성적',
          title: '프로그래밍 언어론 과제 채점 완료',
          message: '프로그래밍 언어론 1차 과제 채점이 완료되었습니다. 성적을 확인해주세요.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isRead: true,
        },
        {
          id: 5,
          typeCode: 'LECTURE',
          typeName: '강의',
          title: '컴퓨터 네트워크 보강 수업',
          message: '12월 18일 오전 10시에 보강 수업이 있습니다.',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          isRead: false,
        },
      ];

      if (selectedTab === 1) {
        setNotifications(dummyNotifications.filter(n => !n.isRead));
      } else {
        setNotifications(dummyNotifications);
      }
      setUnreadCount(dummyNotifications.filter(n => !n.isRead).length);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor, selectedTab]);

  // 읽지 않은 알림 개수 가져오기
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [selectedTab]);

  // 알림 클릭 처리 (상세보기)
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setDetailDialogOpen(true);
  };

  // 알림 읽음 처리
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
    }
  };

  // 알림 삭제
  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
      // 읽지 않은 알림이었다면 카운트 감소
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('알림 삭제 실패:', error);
    }
  };

  // 읽은 알림 삭제
  const handleDeleteReadNotifications = async () => {
    try {
      await notificationService.deleteReadNotifications();
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch (error) {
      console.error('읽은 알림 삭제 실패:', error);
    }
    handleMenuClose();
  };

  // 선택된 알림 삭제
  const handleDeleteSelected = async () => {
    for (const id of selectedNotifications) {
      await handleDeleteNotification(id);
    }
    setSelectedNotifications([]);
  };

  // 탭 변경
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setCursor(null);
    setSelectedNotifications([]);
  };

  // 메뉴 열기/닫기
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // 더 보기
  const handleLoadMore = () => {
    if (hasNext && !loadingMore) {
      fetchNotifications(true);
    }
  };

  // 선택 토글
  const handleToggleSelect = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // 전체 선택/해제
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedNotifications(notifications.map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationsIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight="600">
              알림
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {selectedNotifications.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteSelected}
                >
                  선택 삭제 ({selectedNotifications.length})
                </Button>
              </>
            )}

            <Tooltip title="새로고침">
              <IconButton onClick={() => fetchNotifications()}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="모두 읽음">
              <IconButton onClick={handleMarkAllAsRead}>
                <DoneAllIcon />
              </IconButton>
            </Tooltip>

            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        {/* 탭 */}
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="전체" />
          <Tab
            label={
              <Badge badgeContent={unreadCount} color="error">
                읽지 않음
              </Badge>
            }
          />
        </Tabs>

        <Divider sx={{ mb: 2 }} />

        {/* 전체 선택 체크박스 */}
        {notifications.length > 0 && (
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedNotifications.length === notifications.length}
                indeterminate={
                  selectedNotifications.length > 0 &&
                  selectedNotifications.length < notifications.length
                }
                onChange={handleSelectAll}
              />
            }
            label="전체 선택"
            sx={{ mb: 2 }}
          />
        )}

        {/* 에러 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 로딩 */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* 알림 목록 */}
            {notifications.length > 0 ? (
              <List>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        backgroundColor: notification.isRead
                          ? 'transparent'
                          : alpha('#1976d2', 0.05),
                        '&:hover': {
                          backgroundColor: alpha('#1976d2', 0.08),
                          cursor: 'pointer',
                        },
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <Checkbox
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleToggleSelect(notification.id)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ mr: 1 }}
                      />

                      <ListItemIcon>
                        {getNotificationIcon(notification.typeCode)}
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={notification.typeName || notificationService.getNotificationTypeLabel(notification.typeCode)}
                              size="small"
                              color={getTypeColor(notification.typeCode)}
                            />
                            <Typography variant="body1" fontWeight={notification.isRead ? 400 : 600}>
                              {notification.title}
                            </Typography>
                            {!notification.isRead && (
                              <Chip
                                label="NEW"
                                size="small"
                                color="error"
                                sx={{ height: 20 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            {notification.message && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {notification.message}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.disabled">
                              {notificationService.formatNotificationTime(notification.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!notification.isRead && (
                          <Tooltip title="읽음으로 표시">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="삭제">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {selectedTab === 1 ? '읽지 않은 알림이 없습니다' : '알림이 없습니다'}
                </Typography>
              </Box>
            )}

            {/* 더 보기 버튼 */}
            {hasNext && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? <CircularProgress size={20} /> : '더 보기'}
                </Button>
              </Box>
            )}
          </>
        )}

        {/* 메뉴 */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleDeleteReadNotifications}>
            <ListItemIcon>
              <DeleteSweepIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>읽은 알림 삭제</ListItemText>
          </MenuItem>
        </Menu>

        {/* 알림 상세보기 다이얼로그 */}
        <NotificationDetailDialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          notification={selectedNotification}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDeleteNotification}
        />
      </Paper>
    </Container>
  );
};

export default Notifications;