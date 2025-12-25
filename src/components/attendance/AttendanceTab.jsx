/**
 * AttendanceTab - 학생용 출석 현황 탭 컴포넌트
 *
 * CourseDetail 페이지에서 사용되는 출석 탭입니다.
 * 해당 강의의 주차별 출석 현황을 표시합니다.
 */

import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Divider,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import attendanceService from '../../services/attendanceService';

const AttendanceTab = ({courseId}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attendanceData, setAttendanceData] = useState(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!courseId) return;

            setLoading(true);
            setError(null);

            try {
                const response = await attendanceService.getCourseAttendance(courseId);
                if (response.success) {
                    setAttendanceData(response.data);
                } else {
                    setError(response.message || '출석 정보를 불러오는데 실패했습니다.');
                }
            } catch (err) {
                console.error('출석 조회 실패:', err);
                setError('출석 정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [courseId]);

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{mb: 2}}>
                {error}
            </Alert>
        );
    }

    if (!attendanceData) {
        return (
            <Alert severity="info">
                출석 정보가 없습니다.
            </Alert>
        );
    }

    const {
        courseName,
        completedWeeks,
        totalWeeks,
        attendanceRate,
        weekAttendances = []
    } = attendanceData;

    const attendanceColor = attendanceService.getAttendanceColor(attendanceRate);

    return (
        <Box>
            {/* 출석률 요약 카드 */}
            <Paper sx={{p: 3, mb: 3}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                    <EventAvailableIcon sx={{fontSize: 40, color: `${attendanceColor}.main`}}/>
                    <Box sx={{flex: 1}}>
                        <Typography variant="h6" sx={{fontWeight: 600}}>
                            내 출석 현황
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {courseName}
                        </Typography>
                    </Box>
                    <Box sx={{textAlign: 'right'}}>
                        <Typography variant="h4" sx={{fontWeight: 700, color: `${attendanceColor}.main`}}>
                            {attendanceService.formatAttendanceRate(attendanceRate)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {completedWeeks} / {totalWeeks} 주차 완료
                        </Typography>
                    </Box>
                </Box>

                <LinearProgress
                    variant="determinate"
                    value={attendanceRate || 0}
                    color={attendanceColor}
                    sx={{height: 8, borderRadius: 4}}
                />
            </Paper>

            {/* 주차별 출석 현황 */}
            <Paper sx={{p: 2}}>
                <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 2, px: 1}}>
                    주차별 출석 현황
                </Typography>

                {weekAttendances.length === 0 ? (
                    <Alert severity="info">등록된 주차가 없습니다.</Alert>
                ) : (
                    <List>
                        {weekAttendances.map((week, index) => (
                            <React.Fragment key={week.weekId}>
                                <ListItem
                                    sx={{
                                        borderRadius: 1,
                                        bgcolor: week.isCompleted ? 'success.lighter' : 'background.paper',
                                        mb: 1,
                                    }}
                                >
                                    <ListItemIcon>
                                        {week.isCompleted ? (
                                            <CheckCircleIcon color="success"/>
                                        ) : (
                                            <RadioButtonUncheckedIcon color="disabled"/>
                                        )}
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                <Typography variant="body1" sx={{fontWeight: 500}}>
                                                    {week.weekTitle || `${week.weekNumber}주차`}
                                                </Typography>
                                                {week.isCompleted && (
                                                    <Chip
                                                        label="출석 완료"
                                                        size="small"
                                                        color="success"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mt: 0.5}}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                                    <PlayCircleOutlineIcon fontSize="small" color="action"/>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {week.completedVideoCount} / {week.totalVideoCount} 영상 시청
                                                    </Typography>
                                                </Box>
                                                {week.completedAt && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        완료: {attendanceService.formatCompletedAt(week.completedAt)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />

                                    {/* 진행률 표시 */}
                                    <Box sx={{width: 60, textAlign: 'right'}}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: week.isCompleted ? 'success.main' : 'text.secondary'
                                            }}
                                        >
                                            {week.totalVideoCount > 0
                                                ? Math.round((week.completedVideoCount / week.totalVideoCount) * 100)
                                                : 0}%
                                        </Typography>
                                    </Box>
                                </ListItem>

                                {index < weekAttendances.length - 1 && <Divider sx={{my: 1}}/>}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>

            {/* 안내 문구 */}
            <Alert severity="info" sx={{mt: 2}}>
                출석은 각 주차의 모든 영상을 시청 완료하면 자동으로 인정됩니다.
            </Alert>
        </Box>
    );
};

export default AttendanceTab;
