/**
 * Dashboard 페이지
 *
 * LMS 시스템의 대시보드 페이지입니다.
 * 전체적인 학습 현황과 통계를 한눈에 볼 수 있습니다.
 *
 * 주요 기능:
 * - 학습 진행률 표시
 * - 최근 활동 내역
 * - 주요 통계 카드
 * - 일정 및 마감일 표시
 */

import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Paper,
  Button,
  IconButton,
} from '@mui/material';

// 아이콘 임포트
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';

/**
 * 통계 카드 컴포넌트
 * 대시보드에 표시할 주요 지표를 카드 형태로 표현
 */
const StatCard = ({ title, value, subtitle, icon, color = 'primary', progress }) => (
  <Card
    sx={{
      height: '100%',
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      },
    }}
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
          {progress !== undefined && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: `${color}.lighter`,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: `${color}.main`,
                  },
                }}
              />
            </Box>
          )}
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
 * Dashboard 컴포넌트
 */
const Dashboard = () => {
  // 예시 데이터 (실제로는 API에서 가져옴)
  const stats = [
    {
      title: '수강 중인 강의',
      value: '5',
      subtitle: '이번 주 2개 완료',
      icon: <SchoolIcon />,
      color: 'primary',
      progress: 65,
    },
    {
      title: '진행 중인 과제',
      value: '3',
      subtitle: '마감 임박 1개',
      icon: <AssignmentIcon />,
      color: 'warning',
      progress: 40,
    },
    {
      title: '예정된 시험',
      value: '2',
      subtitle: '다음 시험: 3일 후',
      icon: <QuizIcon />,
      color: 'error',
    },
    {
      title: '학습 시간',
      value: '24h',
      subtitle: '이번 주 누적',
      icon: <AccessTimeIcon />,
      color: 'success',
      progress: 80,
    },
  ];

  const recentActivities = [
    { title: 'React 기초 강의 완료', time: '2시간 전', type: 'course' },
    { title: '과제 제출: JavaScript 실습', time: '5시간 전', type: 'assignment' },
    { title: '퀴즈 응시: HTML/CSS', time: '1일 전', type: 'quiz' },
    { title: '토론 참여: 프론트엔드 트렌드', time: '2일 전', type: 'forum' },
  ];

  const upcomingSchedule = [
    { title: 'Node.js 라이브 세션', date: '12월 5일 14:00', type: 'live' },
    { title: '중간 프로젝트 제출', date: '12월 7일 23:59', type: 'deadline' },
    { title: 'React 심화 퀴즈', date: '12월 8일 10:00', type: 'quiz' },
  ];

  return (
    <Box>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          대시보드
        </Typography>
        <Typography variant="body1" color="text.secondary">
          안녕하세요! 오늘도 열심히 학습해보세요.
        </Typography>
      </Box>

      {/* 통계 카드 그리드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* 메인 콘텐츠 그리드 */}
      <Grid container spacing={3}>
        {/* 최근 활동 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                최근 활동
              </Typography>
              <Button endIcon={<ArrowForwardIcon />} size="small">
                전체보기
              </Button>
            </Box>

            <List>
              {recentActivities.map((activity, index) => (
                <ListItem
                  key={index}
                  sx={{
                    px: 0,
                    py: 1.5,
                    borderBottom: index < recentActivities.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor:
                          activity.type === 'course'
                            ? 'primary.light'
                            : activity.type === 'assignment'
                            ? 'warning.light'
                            : activity.type === 'quiz'
                            ? 'error.light'
                            : 'info.light',
                      }}
                    >
                      {activity.type === 'course' ? (
                        <SchoolIcon />
                      ) : activity.type === 'assignment' ? (
                        <AssignmentIcon />
                      ) : activity.type === 'quiz' ? (
                        <QuizIcon />
                      ) : (
                        <GroupIcon />
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.title}
                    secondary={activity.time}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* 일정 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                다가오는 일정
              </Typography>
              <IconButton size="small">
                <CalendarTodayIcon />
              </IconButton>
            </Box>

            <List>
              {upcomingSchedule.map((schedule, index) => (
                <ListItem
                  key={index}
                  sx={{
                    px: 0,
                    py: 1.5,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    borderBottom: index < upcomingSchedule.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, width: '100%' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, flex: 1 }}>
                      {schedule.title}
                    </Typography>
                    <Chip
                      label={
                        schedule.type === 'live'
                          ? '라이브'
                          : schedule.type === 'deadline'
                          ? '마감일'
                          : '퀴즈'
                      }
                      size="small"
                      color={
                        schedule.type === 'live'
                          ? 'primary'
                          : schedule.type === 'deadline'
                          ? 'error'
                          : 'warning'
                      }
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {schedule.date}
                  </Typography>
                </ListItem>
              ))}
            </List>

            <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
              전체 일정 보기
            </Button>
          </Paper>
        </Grid>

        {/* 학습 진행률 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              주간 학습 진행률
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">React 기초</Typography>
                    <Typography variant="body2" color="primary">
                      75%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">JavaScript 심화</Typography>
                    <Typography variant="body2" color="primary">
                      60%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={60} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Node.js 입문</Typography>
                    <Typography variant="body2" color="primary">
                      30%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={30} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;