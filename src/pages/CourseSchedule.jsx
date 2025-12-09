/**
 * CourseSchedule 페이지
 *
 * MZC 대학교 LMS 시스템의 시간표 페이지입니다.
 * 학생의 주간 수업 시간표를 시각적으로 표시합니다.
 *
 * 주요 기능:
 * - 주간 시간표 그리드 표시
 * - 과목별 색상 구분
 * - 강의실 정보 표시
 * - 클릭 시 과목 상세 페이지로 이동
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';

// 아이콘 임포트
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import TodayIcon from '@mui/icons-material/Today';

/**
 * CourseSchedule 컴포넌트
 */
const CourseSchedule = () => {
  const navigate = useNavigate();

  // 시간 슬롯 (9시부터 18시까지)
  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ];

  // 요일
  const weekDays = ['월', '화', '수', '목', '금'];

  // 과목별 색상 매핑
  const courseColors = {
    'CS301': '#6FA3EB', // 데이터베이스 - 파스텔 블루
    'CS302': '#A5C9EA', // 알고리즘 - 연한 파스텔 블루
    'CS401': '#9CC0F5', // 운영체제 - 밝은 파스텔 블루
    'CS402': '#81C784', // 소프트웨어공학 - 파스텔 그린
    'CS403': '#FFD54F', // 캡스톤디자인 - 파스텔 옐로우
    'GE201': '#EF9A9A', // 기술과 창업 - 파스텔 레드
  };

  // 시간표 데이터
  // 각 과목의 시간과 위치를 정의
  const scheduleData = [
    {
      id: 'CS301',
      name: '데이터베이스',
      professor: '김교수',
      classroom: '공학관 301호',
      day: '월',
      startTime: '10:30',
      endTime: '12:00',
      credits: 3,
    },
    {
      id: 'CS301',
      name: '데이터베이스',
      professor: '김교수',
      classroom: '공학관 301호',
      day: '수',
      startTime: '10:30',
      endTime: '12:00',
      credits: 3,
    },
    {
      id: 'CS302',
      name: '알고리즘',
      professor: '이교수',
      classroom: '공학관 302호',
      day: '화',
      startTime: '14:00',
      endTime: '15:30',
      credits: 3,
    },
    {
      id: 'CS302',
      name: '알고리즘',
      professor: '이교수',
      classroom: '공학관 302호',
      day: '목',
      startTime: '14:00',
      endTime: '15:30',
      credits: 3,
    },
    {
      id: 'CS401',
      name: '운영체제',
      professor: '박교수',
      classroom: '공학관 401호',
      day: '월',
      startTime: '14:00',
      endTime: '15:30',
      credits: 3,
    },
    {
      id: 'CS401',
      name: '운영체제',
      professor: '박교수',
      classroom: '공학관 401호',
      day: '수',
      startTime: '14:00',
      endTime: '15:30',
      credits: 3,
    },
    {
      id: 'CS402',
      name: '소프트웨어공학',
      professor: '최교수',
      classroom: '공학관 402호',
      day: '화',
      startTime: '10:30',
      endTime: '12:00',
      credits: 3,
    },
    {
      id: 'CS402',
      name: '소프트웨어공학',
      professor: '최교수',
      classroom: '공학관 402호',
      day: '목',
      startTime: '10:30',
      endTime: '12:00',
      credits: 3,
    },
    {
      id: 'CS403',
      name: '캡스톤디자인',
      professor: '정교수',
      classroom: '공학관 501호',
      day: '금',
      startTime: '14:00',
      endTime: '17:00',
      credits: 3,
    },
    {
      id: 'GE201',
      name: '기술과 창업',
      professor: '강교수',
      classroom: '창업관 201호',
      day: '목',
      startTime: '16:00',
      endTime: '18:00',
      credits: 3,
    },
  ];

  /**
   * 시간을 행 인덱스로 변환
   */
  const timeToRowIndex = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    const baseHour = 9;
    return (hour - baseHour) * 2 + (minute === 30 ? 1 : 0);
  };

  /**
   * 과목이 차지하는 행 수 계산
   */
  const calculateRowSpan = (startTime, endTime) => {
    const startIndex = timeToRowIndex(startTime);
    const endIndex = timeToRowIndex(endTime);
    return endIndex - startIndex;
  };

  /**
   * 특정 시간과 요일에 해당하는 과목 찾기
   */
  const getCourseAtTime = (day, timeIndex) => {
    return scheduleData.find(course => {
      const startIndex = timeToRowIndex(course.startTime);
      const endIndex = timeToRowIndex(course.endTime);
      return course.day === day && timeIndex >= startIndex && timeIndex < endIndex;
    });
  };

  /**
   * 과목 클릭 핸들러
   */
  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  /**
   * 시간표 셀 렌더링
   */
  const renderScheduleCell = (day, timeIndex) => {
    const course = getCourseAtTime(day, timeIndex);

    if (!course) {
      return <TableCell key={`${day}-${timeIndex}`} sx={{ border: '1px solid #e0e0e0', height: 40 }} />;
    }

    // 이미 렌더링된 셀인지 확인
    const startIndex = timeToRowIndex(course.startTime);
    if (timeIndex !== startIndex) {
      return null; // 이미 rowSpan으로 처리됨
    }

    const rowSpan = calculateRowSpan(course.startTime, course.endTime);

    return (
      <TableCell
        key={`${day}-${timeIndex}`}
        rowSpan={rowSpan}
        sx={{
          border: '1px solid #e0e0e0',
          padding: 1,
          backgroundColor: courseColors[course.id] + '30',
          borderLeft: `4px solid ${courseColors[course.id]}`,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: courseColors[course.id] + '50',
          },
        }}
        onClick={() => handleCourseClick(course.id)}
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: courseColors[course.id] }}>
            {course.name}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            {course.professor}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            {course.classroom}
          </Typography>
        </Box>
      </TableCell>
    );
  };

  // 총 학점 계산
  const totalCredits = [...new Set(scheduleData.map(c => c.id))].reduce((sum, courseId) => {
    const course = scheduleData.find(c => c.id === courseId);
    return sum + (course?.credits || 0);
  }, 0);

  // 오늘 날짜의 요일 구하기
  const today = new Date().getDay();
  const todayIndex = today === 0 ? -1 : today - 1; // 일요일은 -1, 월요일은 0

  return (
    <Container maxWidth="xl">
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            시간표
          </Typography>
          <Typography variant="body1" color="text.secondary">
            2026학년도 1학기 | 총 {totalCredits}학점
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="인쇄">
            <IconButton>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="다운로드">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 시간표 테이블 */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 80, backgroundColor: 'primary.light', color: 'white', fontWeight: 600 }}>
                시간
              </TableCell>
              {weekDays.map((day, index) => (
                <TableCell
                  key={day}
                  align="center"
                  sx={{
                    backgroundColor: todayIndex === index ? 'primary.main' : 'primary.light',
                    color: 'white',
                    fontWeight: 600,
                    position: 'relative',
                  }}
                >
                  {day}
                  {todayIndex === index && (
                    <Chip
                      label="오늘"
                      size="small"
                      sx={{
                        ml: 1,
                        height: 20,
                        backgroundColor: 'white',
                        color: 'primary.main',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 18 }, (_, timeIndex) => {
              const hour = Math.floor(timeIndex / 2) + 9;
              const minute = timeIndex % 2 === 0 ? '00' : '30';
              const timeLabel = `${hour}:${minute}`;

              return (
                <TableRow key={timeIndex}>
                  <TableCell
                    sx={{
                      backgroundColor: 'grey.100',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    {timeLabel}
                  </TableCell>
                  {weekDays.map(day => renderScheduleCell(day, timeIndex))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 과목 목록 카드 */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        수강 과목 목록
      </Typography>
      <Grid container spacing={2}>
        {[...new Set(scheduleData.map(c => c.id))].map(courseId => {
          const course = scheduleData.find(c => c.id === courseId);
          return (
            <Grid item xs={12} sm={6} md={4} key={courseId}>
              <Card
                sx={{
                  p: 2,
                  borderLeft: `4px solid ${courseColors[courseId]}`,
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleCourseClick(courseId)}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {course.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.id}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${course.credits}학점`}
                    size="small"
                    sx={{ backgroundColor: courseColors[courseId] + '30' }}
                  />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">{course.professor}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2">{course.classroom}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {scheduleData
                        .filter(c => c.id === courseId)
                        .map(c => `${c.day} ${c.startTime}-${c.endTime}`)
                        .join(', ')}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default CourseSchedule;
