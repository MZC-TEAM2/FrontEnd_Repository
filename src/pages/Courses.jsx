/**
 * Courses 페이지
 *
 * 강의 목록을 표시하는 페이지입니다.
 * 수강 중인 강의와 전체 강의 목록을 볼 수 있습니다.
 */

import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';

const Courses = () => {
  // 예시 강의 데이터
  const courses = [
    {
      id: 1,
      title: 'React 완벽 가이드',
      instructor: '김강사',
      progress: 75,
      duration: '20시간',
      students: 150,
      level: '초급',
      image: 'https://via.placeholder.com/300x150/6FA3EB/FFFFFF?text=React',
    },
    {
      id: 2,
      title: 'Node.js 백엔드 개발',
      instructor: '이강사',
      progress: 30,
      duration: '25시간',
      students: 200,
      level: '중급',
      image: 'https://via.placeholder.com/300x150/A5C9EA/FFFFFF?text=Node.js',
    },
    {
      id: 3,
      title: 'JavaScript 심화 과정',
      instructor: '박강사',
      progress: 100,
      duration: '15시간',
      students: 180,
      level: '중급',
      image: 'https://via.placeholder.com/300x150/9CC0F5/FFFFFF?text=JavaScript',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        강의 목록
      </Typography>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardMedia
                component="img"
                height="150"
                image={course.image}
                alt={course.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip label={course.level} size="small" color="primary" />
                  {course.progress === 100 && (
                    <Chip label="완료" size="small" color="success" />
                  )}
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {course.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  강사: {course.instructor}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="caption">{course.duration}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <GroupIcon fontSize="small" color="action" />
                    <Typography variant="caption">{course.students}명</Typography>
                  </Box>
                </Box>

                {course.progress > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">진행률</Typography>
                      <Typography variant="caption">{course.progress}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={course.progress}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayCircleOutlineIcon />}
                  sx={{ mt: 'auto' }}
                >
                  {course.progress > 0 ? '이어서 학습' : '학습 시작'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Courses;