import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Typography,
} from '@mui/material';
import {
    Announcement as AnnouncementIcon,
    Assignment as AssignmentIcon,
    ChatBubble as ChatBubbleIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    EventNote as EventNoteIcon,
    Grade as GradeIcon,
    Info as InfoIcon,
    Quiz as QuizIcon,
    Reply as ReplyIcon,
    School as SchoolIcon,
} from '@mui/icons-material';
import notificationService from '../services/notificationService';

/**
 * 알림 상세보기 다이얼로그
 *
 * @param {Object} props
 * @param {boolean} props.open - 다이얼로그 열림 상태
 * @param {Function} props.onClose - 다이얼로그 닫기 함수
 * @param {Object} props.notification - 알림 객체
 * @param {Function} props.onMarkAsRead - 읽음 처리 콜백
 * @param {Function} props.onDelete - 삭제 처리 콜백
 */
const NotificationDetailDialog = ({
                                      open,
                                      onClose,
                                      notification,
                                      onMarkAsRead,
                                      onDelete
                                  }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [detailedNotification, setDetailedNotification] = useState(null);

    // 알림 타입별 아이콘
    const getNotificationIcon = (type) => {
        const icons = {
            ASSIGNMENT: <AssignmentIcon/>,
            EXAM: <QuizIcon/>,
            ANNOUNCEMENT: <AnnouncementIcon/>,
            GRADE: <GradeIcon/>,
            LECTURE: <SchoolIcon/>,
            ATTENDANCE: <EventNoteIcon/>,
            SYSTEM: <InfoIcon/>,
            COMMENT_CREATED: <ChatBubbleIcon/>,
            REPLY_CREATED: <ReplyIcon/>,
        };
        return icons[type] || <InfoIcon/>;
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
            COMMENT_CREATED: 'info',
            REPLY_CREATED: 'info',
        };
        return colors[type] || 'default';
    };

    // 알림 상세 정보 가져오기
    useEffect(() => {
        if (open && notification?.id) {
            fetchNotificationDetail();
        }
    }, [open, notification?.id]);

    const fetchNotificationDetail = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await notificationService.getNotification(notification.id);
            setDetailedNotification(response);

            // 자동으로 읽음 처리
            if (!notification.isRead) {
                handleMarkAsRead();
            }
        } catch (error) {
            console.error('알림 상세 조회 실패:', error);
            setError('알림 상세 정보를 불러오는데 실패했습니다.');
            // 더미 데이터 사용
            setDetailedNotification(notification);
        } finally {
            setLoading(false);
        }
    };

    // 읽음 처리
    const handleMarkAsRead = async () => {
        if (notification && !notification.isRead) {
            try {
                await notificationService.markAsRead(notification.id);
                if (onMarkAsRead) {
                    onMarkAsRead(notification.id);
                }
            } catch (error) {
                console.error('알림 읽음 처리 실패:', error);
            }
        }
    };

    // 삭제 처리
    const handleDelete = async () => {
        try {
            await notificationService.deleteNotification(notification.id);
            if (onDelete) {
                onDelete(notification.id);
            }
            onClose();
        } catch (error) {
            console.error('알림 삭제 실패:', error);
            setError('알림 삭제에 실패했습니다.');
        }
    };


    if (!notification) return null;

    const displayNotification = detailedNotification || notification;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        {getNotificationIcon(displayNotification.typeCode || displayNotification.type)}
                        <Typography variant="h6">알림 상세</Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon/>
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                        <CircularProgress/>
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <>
                        {/* 알림 타입 및 상태 */}
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2}}>
                            <Chip
                                label={displayNotification.typeName || notificationService.getNotificationTypeLabel(displayNotification.typeCode || displayNotification.type)}
                                color={getTypeColor(displayNotification.typeCode || displayNotification.type)}
                                size="small"
                            />
                            {!displayNotification.isRead && (
                                <Chip label="NEW" color="error" size="small"/>
                            )}
                        </Box>

                        {/* 제목 */}
                        <Typography variant="h6" gutterBottom>
                            {displayNotification.title || '제목 없음'}
                        </Typography>

                        {/* 메시지 */}
                        <Typography variant="body1" paragraph>
                            {displayNotification.message || displayNotification.content || '내용 없음'}
                        </Typography>

                        <Divider sx={{my: 2}}/>

                        {/* 추가 정보 */}
                        <Box sx={{mt: 2}}>
                            {/* 발신자 정보 */}
                            {displayNotification.senderName && (
                                <Box sx={{mb: 1}}>
                                    <Typography variant="caption" color="text.secondary">
                                        발신자
                                    </Typography>
                                    <Typography variant="body2">
                                        {displayNotification.senderName}
                                    </Typography>
                                </Box>
                            )}

                            {/* 관련 과목 */}
                            {displayNotification.courseName && (
                                <Box sx={{mb: 1}}>
                                    <Typography variant="caption" color="text.secondary">
                                        관련 과목
                                    </Typography>
                                    <Typography variant="body2">
                                        {displayNotification.courseName}
                                    </Typography>
                                </Box>
                            )}

                            {/* 시간 정보 */}
                            <Box sx={{mb: 1}}>
                                <Typography variant="caption" color="text.secondary">
                                    발송 시간
                                </Typography>
                                <Typography variant="body2">
                                    {displayNotification.time ||
                                        notificationService.formatNotificationTime(displayNotification.createdAt) ||
                                        '시간 정보 없음'}
                                </Typography>
                            </Box>

                            {/* 읽은 시간 */}
                            {displayNotification.readAt && (
                                <Box sx={{mb: 1}}>
                                    <Typography variant="caption" color="text.secondary">
                                        읽은 시간
                                    </Typography>
                                    <Typography variant="body2">
                                        {notificationService.formatNotificationTime(displayNotification.readAt)}
                                    </Typography>
                                </Box>
                            )}

                        </Box>
                    </>
                )}
            </DialogContent>

            <DialogActions>
                {!displayNotification.isRead && (
                    <Button
                        startIcon={<CheckCircleIcon/>}
                        onClick={handleMarkAsRead}
                    >
                        읽음으로 표시
                    </Button>
                )}
                <Button
                    startIcon={<DeleteIcon/>}
                    onClick={handleDelete}
                    color="error"
                >
                    삭제
                </Button>
                <Button onClick={onClose} variant="contained">
                    닫기
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NotificationDetailDialog;
