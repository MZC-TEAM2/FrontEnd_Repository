import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAssignment } from '../../hooks/useAssignment';
import { formatDateTime } from '../../../../utils/boardUtils';

/**
 * 과제 채점 모달 컴포넌트
 */
const GradeModal = ({ open, onClose, submission, maxScore, onSuccess }) => {
  const [score, setScore] = useState(submission.score || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [error, setError] = useState(null);

  const { gradeSubmission, loading } = useAssignment();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxScore) {
      setError(`점수는 0부터 ${maxScore} 사이여야 합니다.`);
      return;
    }

    try {
      await gradeSubmission(submission.id, {
        score: scoreNum,
        feedback: feedback.trim(),
      });
      alert('채점이 완료되었습니다.');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || '채점에 실패했습니다.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>과제 채점</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 학생 정보 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            학생: {submission.studentName || `학생 ${submission.studentId}`}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            제출 시간: {formatDateTime(submission.submittedAt)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 제출 내용 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            제출 내용
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              maxHeight: 200,
              overflow: 'auto',
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {submission.submissionText}
            </Typography>
          </Box>
        </Box>

        {/* 첨부파일 */}
        {submission.attachmentUrls && submission.attachmentUrls.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              첨부파일
            </Typography>
            {submission.attachmentUrls.map((url, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
                href={url}
                target="_blank"
              >
                파일 {index + 1}
              </Button>
            ))}
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* 점수 입력 */}
        <TextField
          fullWidth
          label={`점수 (만점: ${maxScore})`}
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="점수를 입력하세요"
          required
          inputProps={{ min: 0, max: maxScore, step: 0.5 }}
          sx={{ mb: 3 }}
        />

        {/* 피드백 입력 */}
        <TextField
          fullWidth
          label="피드백"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="피드백을 작성하세요 (선택사항)"
          multiline
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button startIcon={<CloseIcon />} onClick={onClose} disabled={loading}>
          취소
        </Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSubmit}
          disabled={loading}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GradeModal;
