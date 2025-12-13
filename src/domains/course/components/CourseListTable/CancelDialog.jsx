import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

/**
 * 수강신청 취소 확인 다이얼로그
 */
const CancelDialog = ({
  open,
  onClose,
  onConfirm,
  courseName,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="cancel-dialog-title"
      aria-describedby="cancel-dialog-description"
    >
      <DialogTitle id="cancel-dialog-title">
        수강신청 취소 확인
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="cancel-dialog-description">
          정말로 <strong>{courseName}</strong> 과목의 수강신청을 취소하시겠습니까?
          <br />
          취소 후에는 다시 신청해야 합니다.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          아니오
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          취소하기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelDialog;

