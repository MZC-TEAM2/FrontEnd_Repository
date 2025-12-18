/**
 * 강의 카드 컴포넌트
 * 교수 대시보드에서 각 강의를 카드 형태로 표시
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';

/**
 * CourseCard 컴포넌트
 * @param {Object} course - 강의 정보
 * @param {Function} onManage - 관리 클릭 핸들러
 * @param {Function} onDelete - 삭제 클릭 핸들러
 */
const CourseCard = ({ course, onManage, onDelete }) => {
  // 시간 포맷 함수 (HH:mm:ss -> HH:mm)
  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5); // "09:00:00" -> "09:00"
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* 강의 기본 정보 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {course.courseName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Chip
              label={course.courseCode}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${course.section}분반`}
              size="small"
              color="secondary"
              variant="outlined"
            />
            <Chip
              label={`${course.credits}학점`}
              size="small"
              sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* 강의 상세 정보 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              수강생: {course.enrollment?.current || course.currentStudents || 0} / {course.enrollment?.max || course.maxStudents || 0}명
            </Typography>
          </Box>
          {course.schedule && course.schedule.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {course.schedule[0]?.dayName || 
                  (course.schedule[0]?.dayOfWeek && ['월', '화', '수', '목', '금', '토', '일'][course.schedule[0].dayOfWeek - 1]) || 
                  '월'}{' '}
                {formatTime(course.schedule[0]?.startTime)} - {formatTime(course.schedule[0]?.endTime)}
              </Typography>
            </Box>
          )}
          {(course.schedule?.[0]?.classroom || course.classroom) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {course.schedule?.[0]?.classroom || course.classroom}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      <Divider />

      {/* 빠른 액션 버튼 */}
      <CardActions sx={{ p: 2, pt: 1.5, gap: 1 }}>
        {onManage && (
          <Button
            size="small"
            variant="contained"
            startIcon={<CalendarMonthIcon />}
            onClick={() => onManage(course.id)}
            sx={{ flex: 1 }}
          >
            관리
          </Button>
        )}
        {onDelete && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(course)}
            sx={{ flex: 1 }}
          >
            삭제
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default CourseCard;

