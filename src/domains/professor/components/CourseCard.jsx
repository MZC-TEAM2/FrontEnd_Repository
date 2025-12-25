/**
 * 강의 카드 컴포넌트
 * 교수 대시보드에서 각 강의를 카드 형태로 표시
 */

import React from 'react';
import {Box, Button, Card, CardActionArea, CardContent, Chip, Typography,} from '@mui/material';
import {
    AccessTime as AccessTimeIcon,
    CalendarMonth as CalendarMonthIcon,
    Delete as DeleteIcon,
    People as PeopleIcon,
    School as SchoolIcon,
} from '@mui/icons-material';

/**
 * CourseCard 컴포넌트
 * @param {Object} course - 강의 정보
 * @param {Function} onManage - 관리 클릭 핸들러
 * @param {Function} onDelete - 삭제 클릭 핸들러
 */
const CourseCard = ({course, onManage, onDelete}) => {
    // 시간 포맷 함수 (HH:mm:ss -> HH:mm)
    const formatTime = (time) => {
        if (!time) return '';
        return time.substring(0, 5); // "09:00:00" -> "09:00"
    };

    const formatScheduleTime = (s) => {
        if (!s) return '-';
        const day =
            s.dayName ||
            (s.dayOfWeek && ['월', '화', '수', '목', '금', '토', '일'][Number(s.dayOfWeek) - 1]) ||
            '-';
        const start = formatTime(s.startTime);
        const end = formatTime(s.endTime);
        return `${day} ${start} - ${end}`;
    };

    const courseCode = course.courseCode || course.subjectCode || '-';
    const courseName = course.courseName || course.subjectName || '-';
    const section = course.section ? `${course.section}분반` : null;
    const credits = course.credits != null ? `${course.credits}학점` : null;

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-4px)',
                },
            }}
        >
            <CardActionArea
                onClick={() => onManage && onManage(course.id)}
                disabled={!onManage}
                sx={{flexGrow: 1, alignItems: 'stretch'}}
            >
                {/* 상단 헤더(학생 카드 느낌) */}
                <Box
                    sx={{
                        height: 72,
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        background: 'linear-gradient(90deg, rgba(25,118,210,0.12), rgba(25,118,210,0.04))',
                    }}
                >
                    <Typography variant="subtitle2" sx={{fontWeight: 700}}>
                        {courseCode}
                    </Typography>
                </Box>

                <CardContent>
                    <Box sx={{display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap'}}>
                        <Chip label={courseCode} size="small" variant="outlined"/>
                        {section && <Chip label={section} size="small" color="secondary" variant="outlined"/>}
                        {credits && <Chip label={credits} size="small" variant="outlined"/>}
                    </Box>

                    <Typography variant="h6" sx={{fontWeight: 600, mb: 1}}>
                        {courseName}
                    </Typography>

                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                        <PeopleIcon fontSize="small" color="action"/>
                        <Typography variant="body2" color="text.secondary">
                            수강생 {course.enrollment?.current || course.currentStudents || 0} /{' '}
                            {course.enrollment?.max || course.maxStudents || 0}
                        </Typography>
                    </Box>

                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                        <AccessTimeIcon fontSize="small" color="action"/>
                        <Typography variant="body2" color="text.secondary">
                            {course.schedule?.length ? course.schedule.map(formatScheduleTime).join(', ') : '-'}
                        </Typography>
                    </Box>

                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <SchoolIcon fontSize="small" color="action"/>
                        <Typography variant="body2" color="text.secondary">
                            {course.classroom || course.schedule?.[0]?.classroom || '-'}
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>

            <Box sx={{p: 2, pt: 0, display: 'flex', gap: 1}}>
                {onManage && (
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<CalendarMonthIcon/>}
                        onClick={() => onManage(course.id)}
                        sx={{borderRadius: 2, textTransform: 'none', fontWeight: 500}}
                    >
                        강의 관리
                    </Button>
                )}
                {onDelete && (
                    <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        startIcon={<DeleteIcon/>}
                        onClick={() => onDelete(course)}
                        sx={{borderRadius: 2, textTransform: 'none', fontWeight: 500}}
                    >
                        삭제
                    </Button>
                )}
            </Box>
        </Card>
    );
};

export default CourseCard;

