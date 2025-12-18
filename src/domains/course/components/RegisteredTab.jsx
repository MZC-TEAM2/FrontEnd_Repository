import React, { useState } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { formatScheduleTime } from '../utils/scheduleUtils';

/**
 * 신청 완료 탭 컴포넌트
 */
const RegisteredTab = ({ registered, onCancelEnrollment }) => {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(null);
  const [selectedCourseName, setSelectedCourseName] = useState('');

  const handleCancelClick = (enrollmentId, courseName) => {
    setSelectedEnrollmentId(enrollmentId);
    setSelectedCourseName(courseName);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (selectedEnrollmentId && onCancelEnrollment) {
      onCancelEnrollment(selectedEnrollmentId);
    }
    setCancelDialogOpen(false);
    setSelectedEnrollmentId(null);
    setSelectedCourseName('');
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
    setSelectedEnrollmentId(null);
    setSelectedCourseName('');
  };
  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {registered.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
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
                <TableCell align="center">정원</TableCell>
                <TableCell align="center">취소</TableCell>
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
                      {course.schedule?.map(formatScheduleTime).join(', ') || '-'}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {course.classroom}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {course.currentStudents !== undefined && course.maxStudents !== undefined ? (
                      <>
                        <Typography variant="body2">
                          {course.currentStudents}/{course.maxStudents}
                        </Typography>
                        {course.isFull && (
                          <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                            마감
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {course.canCancel !== false && course.enrollmentId ? (
                      <IconButton
                        color="error"
                        onClick={() => handleCancelClick(course.enrollmentId, course.subjectName)}
                        size="small"
                        title="수강신청 취소"
                        sx={{ padding: '4px' }}
                      >
                        <RemoveCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    )}
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

      {/* 취소 확인 다이얼로그 */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelClose}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">
          수강신청 취소 확인
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            정말로 <strong>{selectedCourseName}</strong> 과목의 수강신청을 취소하시겠습니까?
            <br />
            취소 후에는 다시 신청해야 합니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} color="inherit">
            아니오
          </Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained" autoFocus>
            취소하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegisteredTab;
