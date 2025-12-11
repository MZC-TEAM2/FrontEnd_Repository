import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

/**
 * 시간표 컴포넌트
 */
const TimeTable = ({ courses, isPreview = false }) => {
  const days = ['월', '화', '수', '목', '금'];
  const hours = Array.from({ length: 10 }, (_, i) => i + 9); // 9시부터 18시까지

  // 시간표 색상 배열
  const colors = [
    '#6FA3EB',
    '#A5C9EA',
    '#FFB6C1',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
    '#F8B739',
  ];

  const getScheduleStyle = (course, index) => ({
    backgroundColor: colors[index % colors.length] + '40',
    border: `2px solid ${colors[index % colors.length]}`,
    borderRadius: '4px',
    padding: '4px',
    fontSize: '0.75rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  });

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {isPreview ? '시간표 미리보기' : '현재 시간표'}
      </Typography>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 400 }}>
          <TableHead>
            <TableRow>
              <TableCell width="60">시간</TableCell>
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
                {days.map((day, dayIndex) => (
                  <TableCell key={`${day}-${hour}`} align="center" sx={{ height: 40, p: 0.5 }}>
                    {courses.map((course, courseIndex) =>
                      course.schedule?.map((sched) =>
                        sched.dayOfWeek === dayIndex + 1 &&
                        parseInt(sched.startTime) === hour ? (
                          <Box
                            key={`${course.id}-${sched.dayOfWeek}-${sched.startTime}`}
                            sx={getScheduleStyle(course, courseIndex)}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {course.subjectCode}
                            </Typography>
                          </Box>
                        ) : null
                      )
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TimeTable;
