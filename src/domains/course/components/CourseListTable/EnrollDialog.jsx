import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { formatScheduleTime } from '../../utils/scheduleUtils';

/**
 * 수강신청 확인 다이얼로그
 */
const EnrollDialog = ({
  open,
  onClose,
  onConfirm,
  course,
}) => {
  if (!course) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="enroll-dialog-title"
      aria-describedby="enroll-dialog-description"
      maxWidth="sm"
      fullWidth={true}
      sx={{
        '& .MuiDialog-paper': {
          minWidth: '400px',
          maxWidth: '500px',
        }
      }}
    >
      <DialogTitle id="enroll-dialog-title">
        수강신청 확인
      </DialogTitle>
      <DialogContent>
        <Box id="enroll-dialog-description">
          <Typography variant="body1" component="div" sx={{ mb: 1, fontWeight: 600 }}>
            {course.subjectName} ({course.subjectCode})
          </Typography>
          <Typography variant="body2" component="div" color="text.secondary">
            교수: {course.professor || '-'}
          </Typography>
          <Typography variant="body2" component="div" color="text.secondary">
            학점: {course.credits}학점
          </Typography>
          <Typography variant="body2" component="div" color="text.secondary">
            이수구분: {course.courseType}
          </Typography>
          <Typography variant="body2" component="div" color="text.secondary">
            시간: {course.schedule?.map(formatScheduleTime).join(', ') || '-'}
          </Typography>
          <Typography variant="body2" component="div" color="text.secondary">
            강의실: {course.classroom}
          </Typography>
          <Typography variant="body2" component="div" color="text.secondary" sx={{ mt: 2 }}>
            정말 수강신청하시겠습니까?
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          취소
        </Button>
        <Button 
          onClick={() => onConfirm(course)} 
          variant="contained" 
          color="primary"
          autoFocus
        >
          신청
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnrollDialog;

