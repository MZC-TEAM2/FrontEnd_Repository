import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * 신청 완료 탭 컴포넌트
 */
const RegisteredTab = ({ registered }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {registered.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Alert severity="info">아직 신청 완료된 과목이 없습니다.</Alert>
        </Box>
      ) : (
        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>과목코드</TableCell>
                <TableCell>과목명</TableCell>
                <TableCell>교수</TableCell>
                <TableCell>학점</TableCell>
                <TableCell>시간/강의실</TableCell>
                <TableCell align="center">상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registered.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.subjectCode}</TableCell>
                  <TableCell>{course.subjectName}</TableCell>
                  <TableCell>{course.professor}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {course.schedule.map((s) => {
                        const dayMap = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금' };
                        return `${dayMap[s.dayOfWeek]} ${s.startTime}-${s.endTime}`;
                      }).join(', ')}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {course.classroom}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="신청완료"
                      color="success"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default RegisteredTab;
