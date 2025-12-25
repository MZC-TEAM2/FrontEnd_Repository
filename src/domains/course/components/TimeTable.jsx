import React from 'react';
import {Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,} from '@mui/material';
import {formatTime} from '../utils/scheduleUtils';

/**
 * 시간표 컴포넌트
 */
const TimeTable = ({courses, isPreview = false, registeredIds = []}) => {
    const days = ['월', '화', '수', '목', '금'];
    const hours = Array.from({length: 10}, (_, i) => i + 9); // 9시부터 18시까지

    // 장바구니 색상 (주황 계열)
    const cartColors = [
        '#FF9800', // 주황
        '#FFB74D', // 밝은 주황
        '#FFA726', // 오렌지
        '#FF8A65', // 연한 주황
    ];

    // 신청 완료 색상 (파랑 계열)
    const registeredColors = [
        '#2196F3', // 파랑
        '#42A5F5', // 밝은 파랑
        '#64B5F6', // 연한 파랑
        '#90CAF9', // 매우 연한 파랑
    ];

    const getScheduleStyle = (course, index) => {
        const isRegistered = registeredIds.includes(course.id);
        const colorPalette = isRegistered ? registeredColors : cartColors;
        const baseColor = colorPalette[index % colorPalette.length];

        return {
            backgroundColor: baseColor + '40',
            border: `2px solid ${baseColor}`,
            borderRadius: '4px',
            padding: '4px',
            fontSize: '0.75rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%', // 가로 크기 통일
            minWidth: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
        };
    };

    return (
        <Paper sx={{p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
            <Typography variant="h6" sx={{mb: 2, flexShrink: 0}}>
                {isPreview ? '시간표 미리보기' : '현재 시간표'}
            </Typography>
            <TableContainer sx={{flex: 1, overflow: 'auto'}}>
                <Table size="small" sx={{minWidth: 400, tableLayout: 'fixed'}}>
                    <colgroup>
                        <col style={{width: '60px'}}/>
                        {days.map((day) => (
                            <col key={day} style={{width: 'calc((100% - 60px) / 5)'}}/>
                        ))}
                    </colgroup>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{width: 60}}>시간</TableCell>
                            {days.map((day) => (
                                <TableCell key={day} align="center">
                                    {day}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {hours.map((hour) => (
                            <TableRow key={hour}>
                                <TableCell>
                                    <Typography variant="caption">{hour}:00</Typography>
                                </TableCell>
                                {days.map((day, dayIndex) => {
                                    // 해당 요일과 시간에 시작하는 강의 찾기
                                    let courseToRender = null;
                                    let rowSpan = 1;

                                    // 먼저 rowSpan 범위 내에 있는지 확인 (다른 강의의 rowSpan)
                                    for (const course of courses) {
                                        const schedule = course.schedule?.find(
                                            (sched) => sched.dayOfWeek === dayIndex + 1
                                        );
                                        if (schedule) {
                                            const startTime = formatTime(schedule.startTime);
                                            const endTime = formatTime(schedule.endTime);
                                            const startHour = parseInt(startTime.split(':')[0]);
                                            const endHour = parseInt(endTime.split(':')[0]);

                                            // rowSpan 범위 내에 있으면 셀을 렌더링하지 않음 (시작 시간 제외)
                                            if (hour > startHour && hour < endHour) {
                                                return null;
                                            }
                                        }
                                    }

                                    // 시작 시간인 강의 찾기
                                    for (const course of courses) {
                                        const schedule = course.schedule?.find(
                                            (sched) => sched.dayOfWeek === dayIndex + 1
                                        );

                                        if (schedule) {
                                            const startTime = formatTime(schedule.startTime);
                                            const endTime = formatTime(schedule.endTime);
                                            const startHour = parseInt(startTime.split(':')[0]);
                                            const endHour = parseInt(endTime.split(':')[0]);

                                            // 현재 시간이 시작 시간이면 rowSpan 계산
                                            if (hour === startHour) {
                                                rowSpan = Math.max(1, endHour - startHour);
                                                courseToRender = {course, schedule};
                                                break;
                                            }
                                        }
                                    }

                                    // 시작 시간이면 rowSpan 적용한 셀 렌더링
                                    if (courseToRender) {
                                        const courseIndex = courses.findIndex(c => c.id === courseToRender.course.id);
                                        return (
                                            <TableCell
                                                key={`${day}-${hour}`}
                                                align="center"
                                                rowSpan={rowSpan}
                                                sx={{
                                                    height: `${40 * rowSpan}px`,
                                                    p: 0.5,
                                                    verticalAlign: 'middle',
                                                    position: 'relative'
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        ...getScheduleStyle(courseToRender.course, courseIndex),
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Typography variant="caption"
                                                                sx={{fontWeight: 600, display: 'block'}}>
                                                        {courseToRender.course.subjectName || courseToRender.course.subjectCode}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        );
                                    }

                                    // 빈 셀 렌더링
                                    return (
                                        <TableCell
                                            key={`${day}-${hour}`}
                                            align="center"
                                            sx={{height: 40, p: 0.5}}
                                        />
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default TimeTable;
