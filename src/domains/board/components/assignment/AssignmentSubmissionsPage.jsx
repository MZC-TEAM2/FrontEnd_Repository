/**
 * 과제 제출물 목록 페이지 (교수용)
 * 학생들의 과제 제출 현황을 보여주고 채점할 수 있는 페이지
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Grade as GradeIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  Replay as ReplayIcon,
} from '@mui/icons-material';
import { getSubmissions, getAssignment, allowResubmission } from '../../../../api/assignmentApi';
import { useFileManager } from '../../hooks/useFileManager';
import AssignmentGradeDialog from './AssignmentGradeDialog';

const AssignmentSubmissionsPage = () => {
  const { id } = useParams(); // assignment ID
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);

  const { downloadFile } = useFileManager();

  useEffect(() => {
    fetchData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 과제 정보와 제출물 목록 조회
      const [assignmentData, submissionsData] = await Promise.all([
        getAssignment(id),
        getSubmissions(id),
      ]);

      setAssignment(assignmentData);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('제출물 목록 조회 실패:', err);
      setError(err.response?.data?.message || '제출물 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = (submission) => {
    setSelectedSubmission(submission);
    setGradeDialogOpen(true);
  };

  const handleGradeSuccess = () => {
    setGradeDialogOpen(false);
    setSelectedSubmission(null);
    fetchData(); // 목록 새로고침
  };

  const handleBack = () => {
    navigate(`/boards/assignment/${id}`);
  };

  const handleAllowResubmission = async (submissionId) => {
    if (!window.confirm('이 학생에게 재제출을 허용하시게습니까?')) return;
    
    try {
      await allowResubmission(submissionId);
      alert('재제출이 허용되었습니다.');
      fetchData(); // 목록 새로고침
    } catch (err) {
      console.error('재제출 허용 실패:', err);
      alert('재제출 허용에 실패했습니다.');
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      SUBMITTED: { label: '제출됨', color: 'primary' },
      LATE: { label: '지각 제출', color: 'warning' },
      GRADED: { label: '채점 완료', color: 'success' },
      NOT_SUBMITTED: { label: '미제출', color: 'default' },
    };

    const statusInfo = statusMap[status] || { label: status, color: 'default' };
    return <Chip label={statusInfo.label} color={statusInfo.color} size="small" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            제출물 목록
          </Typography>
          {assignment && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {assignment.post?.title || '과제 제목'}
            </Typography>
          )}
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" color="text.secondary">
            총 제출: {submissions.length}명
          </Typography>
          <Typography variant="body2" color="text.secondary">
            채점 완료: {submissions.filter((s) => s.status === 'GRADED').length}명
          </Typography>
        </Box>
      </Box>

      {/* 제출물 테이블 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>학생 ID</TableCell>
              <TableCell>제출 상태</TableCell>
              <TableCell>제출 시간</TableCell>
              <TableCell>첨부파일</TableCell>
              <TableCell align="center">점수</TableCell>
              <TableCell>피드백</TableCell>
              <TableCell align="center">채점</TableCell>
              <TableCell align="center">재제출</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">제출된 과제가 없습니다.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id} hover>
                  <TableCell>{submission.userId}</TableCell>
                  <TableCell>{getStatusChip(submission.status)}</TableCell>
                  <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                  <TableCell>
                    {submission.attachments && submission.attachments.length > 0 ? (
                      <Tooltip title="첨부파일 다운로드">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => downloadFile(submission.attachments[0])}
                        >
                          <DownloadIcon fontSize="small" />
                          <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {submission.attachments.length}
                          </Typography>
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {submission.score !== null && submission.score !== undefined ? (
                      <Typography fontWeight="bold" color="primary">
                        {submission.score}
                      </Typography>
                    ) : (
                      <Typography color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {submission.feedback ? (
                      <Tooltip title={submission.feedback}>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 150,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {submission.feedback}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={submission.status === 'GRADED' ? '재채점' : '채점하기'}>
                      <IconButton
                        color={submission.status === 'GRADED' ? 'success' : 'primary'}
                        onClick={() => handleGradeClick(submission)}
                        size="small"
                      >
                        <GradeIcon />
                      </IconButton>
                    </Tooltip>
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
                      <Chip label="허용됨" size="small" color="success" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 채점 다이얼로그 */}
      {selectedSubmission && (
        <AssignmentGradeDialog
          open={gradeDialogOpen}
          onClose={() => setGradeDialogOpen(false)}
          submission={selectedSubmission}
          assignment={assignment}
          onSuccess={handleGradeSuccess}
        />
      )}
    </Box>
  );
};

export default AssignmentSubmissionsPage;
