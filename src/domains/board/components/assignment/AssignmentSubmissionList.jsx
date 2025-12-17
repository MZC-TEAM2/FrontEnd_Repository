import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import { 
  Grade as GradeIcon,
  Replay as ReplayIcon,
} from '@mui/icons-material';
import { formatDateTime } from '../../../../utils/boardUtils';
import GradeModal from './GradeModal';
import * as assignmentApi from '../../../../api/assignmentApi';

/**
 * 과제 제출 목록 컴포넌트 (교수용)
 */
const AssignmentSubmissionList = ({ submissions, maxScore, onGradeSuccess }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [openGradeModal, setOpenGradeModal] = useState(false);

  const handleGradeClick = (submission) => {
    setSelectedSubmission(submission);
    setOpenGradeModal(true);
  };

  const handleGradeModalClose = () => {
    setOpenGradeModal(false);
    setSelectedSubmission(null);
  };

  const handleGradeSuccess = () => {
    if (onGradeSuccess) onGradeSuccess();
    handleGradeModalClose();
  };

  const handleAllowResubmission = async (submissionId) => {
    if (!window.confirm('이 학생에게 재제출을 허용하시겠습니까?')) return;
    
    try {
      await assignmentApi.allowResubmission(submissionId);
      alert('재제출이 허용되었습니다.');
      if (onGradeSuccess) onGradeSuccess(); // 목록 새로고침
    } catch (err) {
      console.error('재제출 허용 실패:', err);
      alert('재제출 허용에 실패했습니다.');
    }
  };

  if (!submissions || submissions.length === 0) {
    return (
      <Alert severity="info">
        아직 제출한 학생이 없습니다.
      </Alert>
    );
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      SUBMITTED: '제출 완료',
      LATE: '지각 제출',
      GRADED: '채점 완료',
      NOT_SUBMITTED: '미제출',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      SUBMITTED: 'info',
      LATE: 'warning',
      GRADED: 'success',
      NOT_SUBMITTED: 'error',
    };
    return colorMap[status] || 'default';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        제출 목록 ({submissions.length}명)
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>학생 이름</TableCell>
              <TableCell>제출 시간</TableCell>
              <TableCell>상태</TableCell>
              <TableCell align="center">점수</TableCell>
              <TableCell align="center">채점</TableCell>
              <TableCell align="center">재제출</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>{submission.studentName || `학생 ${submission.userId}`}</TableCell>
                <TableCell>
                  {submission.submittedAt ? formatDateTime(submission.submittedAt) : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(submission.status)}
                    color={getStatusColor(submission.status)}
                    size="small"
                  />
                  {submission.allowResubmission && (
                    <Chip label="재제출 허용" size="small" color="primary" sx={{ ml: 1 }} />
                  )}
                </TableCell>
                <TableCell align="center">
                  {submission.status === 'GRADED' ? (
                    <Typography variant="body2" fontWeight="bold">
                      {submission.score} / {maxScore}
                    </Typography>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell align="center">
                  {submission.status !== 'NOT_SUBMITTED' && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<GradeIcon />}
                      onClick={() => handleGradeClick(submission)}
                    >
                      {submission.status === 'GRADED' ? '재채점' : '채점'}
                    </Button>
                  )}
                </TableCell>
                <TableCell align="center">
                  {submission.status === 'GRADED' && !submission.allowResubmission && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      startIcon={<ReplayIcon />}
                      onClick={() => handleAllowResubmission(submission.id)}
                    >
                      허용
                    </Button>
                  )}
                  {submission.allowResubmission && (
                    <Typography variant="caption" color="text.secondary">
                      허용됨
                      {submission.resubmissionDeadline && (
                        <> ({formatDateTime(submission.resubmissionDeadline)}까지)</>
                      )}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 채점 모달 */}
      {selectedSubmission && (
        <GradeModal
          open={openGradeModal}
          onClose={handleGradeModalClose}
          submission={selectedSubmission}
          maxScore={maxScore}
          onSuccess={handleGradeSuccess}
        />
      )}
    </Box>
  );
};

export default AssignmentSubmissionList;
