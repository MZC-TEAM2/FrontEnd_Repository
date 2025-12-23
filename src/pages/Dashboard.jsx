/**
 * Dashboard 페이지
 *
 * MZC 대학교 LMS 시스템의 대시보드 페이지입니다.
 * 학생의 전체적인 학습 현황과 학사 정보를 한눈에 볼 수 있습니다.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  LinearProgress,
  Avatar,
  Chip,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Skeleton,
  Alert,
} from '@mui/material';

// 아이콘 임포트
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import GroupIcon from '@mui/icons-material/Group';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';

import dashboardService from '../services/dashboardService';
import { formatScheduleTime } from '../domains/course/utils/scheduleUtils';

/**
 * 통계 카드 컴포넌트
 */
const StatCard = ({ title, value, subtitle, icon, color = 'primary', onClick, clickable = false }) => (
  <Card
    sx={{
      height: '100%',
      transition: 'all 0.3s',
      cursor: clickable ? 'pointer' : 'default',
      '&:hover': clickable ? {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      } : {},
    }}
    onClick={clickable ? onClick : undefined}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1 }}>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 600 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: `${color}.light`,
            color: `${color}.main`,
            width: 48,
            height: 48,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

/**
 * 강의 카드 컴포넌트 (수강목록 스타일)
 */
const CourseCard = ({ course, onCourseClick }) => {
  const getCourseTypeColor = (type) => {
    switch (type) {
      case '전공필수':
      case 'MAJOR_REQUIRED':
        return 'error';
      case '전공선택':
      case 'MAJOR_ELECTIVE':
        return 'primary';
      case '교양필수':
      case 'GENERAL_REQUIRED':
        return 'warning';
      case '교양선택':
      case 'GENERAL_ELECTIVE':
        return 'success';
      default:
        return 'default';
    }
  };

  const courseData = course.course || course;
  const scheduleData = course.schedule || courseData.schedule || [];

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardActionArea onClick={() => onCourseClick(courseData.id)}>
        <Box
          sx={{
            height: 72,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(90deg, rgba(25,118,210,0.12), rgba(25,118,210,0.04))',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {courseData.courseCode}
          </Typography>
        </Box>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={courseData.courseCode}
              size="small"
              variant="outlined"
            />
            <Chip
              label={courseData.courseType?.name || courseData.courseType || '이수구분'}
              size="small"
              color={getCourseTypeColor(courseData.courseType?.code || courseData.courseType)}
            />
            <Chip
              label={`${courseData.credits || 0}학점`}
              size="small"
              variant="outlined"
            />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {courseData.courseName}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {course.professor?.name || '-'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {scheduleData.length ? scheduleData.map(formatScheduleTime).join(', ') : '-'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SchoolIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {scheduleData[0]?.classroom || '-'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              정원 {courseData.currentStudents ?? '-'} / {courseData.maxStudents ?? '-'}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>

      <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<PlayCircleOutlineIcon />}
          onClick={() => onCourseClick(courseData.id)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          강의실 입장
        </Button>
      </Box>
    </Card>
  );
};

/**
 * Dashboard 컴포넌트
 */
const Dashboard = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollmentSummary, setEnrollmentSummary] = useState(null);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [todayCourses, setTodayCourses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);

  // 데이터 로드
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        const [summaryRes, assignmentsRes, coursesRes, noticesRes] = await Promise.allSettled([
          dashboardService.getEnrollmentSummary(),
          dashboardService.getPendingAssignments(7),
          dashboardService.getTodayCourses(),
          dashboardService.getNotices(5),
        ]);

        if (summaryRes.status === 'fulfilled' && summaryRes.value.success) {
          setEnrollmentSummary(summaryRes.value.data);
        }
        if (assignmentsRes.status === 'fulfilled' && assignmentsRes.value.success) {
          setPendingAssignments(assignmentsRes.value.data || []);
        }
        if (coursesRes.status === 'fulfilled' && coursesRes.value.success) {
          setTodayCourses(coursesRes.value.data || []);
        }
        if (noticesRes.status === 'fulfilled' && noticesRes.value.success) {
          setNotices(noticesRes.value.data || []);
        }
      } catch (err) {
        console.error('대시보드 데이터 로드 실패:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 강의 클릭 핸들러
  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  // 수강 과목 카드 클릭 핸들러
  const handleEnrollmentClick = () => {
    navigate('/courses');
  };

  // 과제 카드 클릭 핸들러
  const handleAssignmentCardClick = () => {
    setAssignmentDialogOpen(true);
  };

  // 과제 상세 페이지 이동
  const handleAssignmentClick = (assignment) => {
    setAssignmentDialogOpen(false);
    navigate(`/assignment/${assignment.assignmentId}`);
  };

  // 공지사항 클릭 핸들러
  const handleNoticeClick = (noticeId) => {
    navigate(`/notices/${noticeId}`);
  };

  // D-day 계산
  const getDdayText = (daysRemaining) => {
    if (daysRemaining === 0) return 'D-Day';
    if (daysRemaining < 0) return `D+${Math.abs(daysRemaining)}`;
    return `D-${daysRemaining}`;
  };

  // 통계 카드 데이터
  const stats = [
    {
      title: '수강 과목',
      value: enrollmentSummary?.courseCount ?? '-',
      subtitle: `총 ${enrollmentSummary?.totalCredits ?? 0}학점`,
      icon: <SchoolIcon />,
      color: 'primary',
      clickable: true,
      onClick: handleEnrollmentClick,
    },
    {
      title: '이번주 미제출 과제',
      value: pendingAssignments.length,
      subtitle: pendingAssignments.filter(a => a.daysRemaining <= 1).length > 0
        ? `오늘/내일 마감 ${pendingAssignments.filter(a => a.daysRemaining <= 1).length}개`
        : '여유 있음',
      icon: <AssignmentIcon />,
      color: 'warning',
      clickable: true,
      onClick: handleAssignmentCardClick,
    },
    {
      title: '오늘의 강의',
      value: todayCourses.length,
      subtitle: todayCourses.length > 0 ? '수업이 있는 날입니다' : '오늘은 수업이 없습니다',
      icon: <QuizIcon />,
      color: 'info',
      clickable: false,
    },
  ];

  return (
    <Box>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          학습 홈
        </Typography>
        <Typography variant="body1" color="text.secondary">
          MZC 대학교 | 2026학년도 1학기
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 통계 카드 그리드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ height: 140 }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" height={48} />
                  <Skeleton variant="text" width="80%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <StatCard {...stat} />
            </Grid>
          ))
        )}
      </Grid>

      {/* 오늘의 강의 섹션 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            오늘의 강의
          </Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            size="small"
            onClick={() => navigate('/courses')}
          >
            전체 과목 보기
          </Button>
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 2 }).map((_, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ height: 300 }}>
                  <Skeleton variant="rectangular" height={72} />
                  <CardContent>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : todayCourses.length > 0 ? (
          <Grid container spacing={3}>
            {todayCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.enrollmentId}>
                <CourseCard course={course} onCourseClick={handleCourseClick} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              오늘은 수업이 없습니다
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 최신 공지사항 섹션 */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnnouncementIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              최신 공지사항
            </Typography>
          </Box>
          <Button
            endIcon={<ArrowForwardIcon />}
            size="small"
            onClick={() => navigate('/notices')}
          >
            전체보기
          </Button>
        </Box>

        {loading ? (
          <List>
            {Array.from({ length: 5 }).map((_, idx) => (
              <ListItem key={idx}>
                <Skeleton variant="text" width="100%" />
              </ListItem>
            ))}
          </List>
        ) : notices.length > 0 ? (
          <List disablePadding>
            {notices.map((notice, index) => (
              <React.Fragment key={notice.id}>
                <ListItem
                  sx={{
                    px: 1,
                    py: 1.5,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    borderRadius: 1,
                  }}
                  onClick={() => handleNoticeClick(notice.id)}
                >
                  <ListItemText
                    primary={notice.title}
                    secondary={new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      sx: {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
                    <VisibilityIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {notice.viewCount}
                    </Typography>
                  </Box>
                </ListItem>
                {index < notices.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <AnnouncementIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              공지사항이 없습니다
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 미제출 과제 목록 다이얼로그 */}
      <Dialog
        open={assignmentDialogOpen}
        onClose={() => setAssignmentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon color="warning" />
            이번주 미제출 과제
          </Box>
          <IconButton onClick={() => setAssignmentDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {pendingAssignments.length > 0 ? (
            <List disablePadding>
              {pendingAssignments.map((assignment, index) => (
                <React.Fragment key={assignment.assignmentId}>
                  <ListItem
                    sx={{
                      px: 1,
                      py: 2,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      borderRadius: 1,
                    }}
                    onClick={() => handleAssignmentClick(assignment)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight={600}>
                            {assignment.title}
                          </Typography>
                          <Chip
                            label={getDdayText(assignment.daysRemaining)}
                            size="small"
                            color={assignment.daysRemaining <= 1 ? 'error' : assignment.daysRemaining <= 3 ? 'warning' : 'default'}
                          />
                          {assignment.lateSubmissionAllowed && (
                            <Chip label="지각제출 허용" size="small" variant="outlined" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {assignment.courseName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            마감: {new Date(assignment.dueDate).toLocaleString('ko-KR')}
                          </Typography>
                        </Box>
                      }
                    />
                    <ArrowForwardIcon color="action" />
                  </ListItem>
                  {index < pendingAssignments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">
                이번주 미제출 과제가 없습니다
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialogOpen(false)}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
