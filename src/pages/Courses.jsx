/**
 * Courses 페이지
 *
 * MZC 대학교 LMS 시스템의 수강 과목 목록 페이지입니다.
 * 현재 수강 중인 과목들을 카드 형태로 표시합니다.
 *
 * 주요 기능:
 * - 수강 중인 과목 목록 표시
 * - 과목별 진행률 및 정보 표시
 * - 과목 상세 페이지로 이동
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  CardActionArea,
  Alert,
  Skeleton,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import useMyCourses from '../domains/course/hooks/useMyCourses';
import { formatScheduleTime } from '../domains/course/utils/scheduleUtils';

const Courses = () => {
  const navigate = useNavigate();
  const { loading, error, courses, reload, summary } = useMyCourses();

  /**
   * 과목 상세 페이지로 이동
   * @param {string} courseId - 과목 ID
   */
  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  /**
   * 과목 타입에 따른 색상 반환
   */
  const getCourseTypeColor = (type) => {
    switch (type) {
      case '전공필수':
        return 'error';
      case '전공선택':
        return 'primary';
      case '교양필수':
        return 'warning';
      case '교양선택':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        수강 과목
      </Typography>

      {summary && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {summary.totalCourses ?? courses.length}과목 · 총 {summary.totalCredits ?? 0}학점
        </Typography>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={reload}>
              다시 시도
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && !error && courses.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          현재 수강 중인 과목이 없습니다.
        </Alert>
      )}

      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <Grid item xs={12} sm={6} md={4} key={`skeleton-${idx}`}>
                <Card sx={{ height: '100%' }}>
                  <Box sx={{ p: 2 }}>
                    <Skeleton variant="rectangular" height={24} sx={{ mb: 2, borderRadius: 1 }} />
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                    <Skeleton variant="rectangular" height={36} sx={{ mt: 2, borderRadius: 2 }} />
                  </Box>
                </Card>
              </Grid>
            ))
          : courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
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
              <CardActionArea onClick={() => handleCourseClick(course.id)}>
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
                    {course.subjectCode}
                  </Typography>
                </Box>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={course.subjectCode}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={course.courseType || '이수구분'}
                      size="small"
                      color={getCourseTypeColor(course.courseType)}
                    />
                    <Chip
                      label={`${course.credits || 0}학점`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {course.subjectName}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {course.professor || '-'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {course.schedule?.length ? course.schedule.map(formatScheduleTime).join(', ') : '-'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SchoolIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {course.classroom || course.schedule?.[0]?.classroom || '-'}
                    </Typography>
                  </Box>

                  {/* 진도는 현재 API 스펙에 없어서 placeholder로만 표시 */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        학습 진도
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        준비 중
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={0}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                        }
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      정원 {course.currentStudents ?? '-'} / {course.maxStudents ?? '-'}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayCircleOutlineIcon />}
                  onClick={() => handleCourseClick(course.id)}
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
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Courses;
