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
  CardMedia,
  Typography,
  Button,
  Chip,
  LinearProgress,
  CardActionArea,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';

const Courses = () => {
  const navigate = useNavigate();

  // MZC 대학교 수강 과목 데이터
  // 실제로는 API에서 가져옴
  const courses = [
    {
      id: 'CS301',
      title: '데이터베이스',
      instructor: '김교수',
      progress: 50,
      schedule: '월/수 10:30-12:00',
      classroom: '공학관 301호',
      students: 45,
      credits: 3,
      type: '전공필수',
      currentWeek: 8,
      totalWeeks: 16,
      image: 'https://via.placeholder.com/300x150/6FA3EB/FFFFFF?text=Database',
    },
    {
      id: 'CS302',
      title: '알고리즘',
      instructor: '이교수',
      progress: 50,
      schedule: '화/목 14:00-15:30',
      classroom: '공학관 302호',
      students: 42,
      credits: 3,
      type: '전공필수',
      currentWeek: 8,
      totalWeeks: 16,
      image: 'https://via.placeholder.com/300x150/A5C9EA/FFFFFF?text=Algorithm',
    },
    {
      id: 'CS401',
      title: '운영체제',
      instructor: '박교수',
      progress: 50,
      schedule: '월/수 14:00-15:30',
      classroom: '공학관 401호',
      students: 38,
      credits: 3,
      type: '전공선택',
      currentWeek: 8,
      totalWeeks: 16,
      image: 'https://via.placeholder.com/300x150/9CC0F5/FFFFFF?text=OS',
    },
    {
      id: 'CS402',
      title: '소프트웨어공학',
      instructor: '최교수',
      progress: 50,
      schedule: '화/목 10:30-12:00',
      classroom: '공학관 402호',
      students: 40,
      credits: 3,
      type: '전공선택',
      currentWeek: 8,
      totalWeeks: 16,
      image: 'https://via.placeholder.com/300x150/81C784/FFFFFF?text=SW+Engineering',
    },
    {
      id: 'CS403',
      title: '캡스톤디자인',
      instructor: '정교수',
      progress: 50,
      schedule: '금 14:00-17:00',
      classroom: '공학관 501호',
      students: 35,
      credits: 3,
      type: '전공필수',
      currentWeek: 8,
      totalWeeks: 16,
      image: 'https://via.placeholder.com/300x150/FFD54F/FFFFFF?text=Capstone',
    },
    {
      id: 'GE201',
      title: '기술과 창업',
      instructor: '강교수',
      progress: 50,
      schedule: '목 16:00-18:00',
      classroom: '창업관 201호',
      students: 60,
      credits: 3,
      type: '교양선택',
      currentWeek: 8,
      totalWeeks: 16,
      image: 'https://via.placeholder.com/300x150/EF9A9A/FFFFFF?text=Startup',
    },
  ];

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
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        2024학년도 2학기 - 총 {courses.length}과목, {courses.reduce((sum, c) => sum + c.credits, 0)}학점
      </Typography>

      <Grid container spacing={3}>
        {courses.map((course) => (
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
                <CardMedia
                  component="img"
                  height="140"
                  image={course.image}
                  alt={course.title}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={course.id}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={course.type}
                      size="small"
                      color={getCourseTypeColor(course.type)}
                    />
                    <Chip
                      label={`${course.credits}학점`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {course.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {course.instructor}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {course.schedule}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SchoolIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {course.classroom}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        학습 진도
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {course.currentWeek}/{course.totalWeeks}주차 ({course.progress}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={course.progress}
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
                      수강생 {course.students}명
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