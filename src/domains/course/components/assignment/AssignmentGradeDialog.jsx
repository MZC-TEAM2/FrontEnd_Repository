/**
 * 과제 채점 다이얼로그
 * 제출물을 확인하고 점수와 피드백을 입력하는 다이얼로그
 */

import {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import {AttachFile as AttachFileIcon, Close as CloseIcon, Download as DownloadIcon,} from '@mui/icons-material';
import {gradeSubmission} from '../../../../api/assignmentApi';
import {useFileManager} from '../../../board/hooks/useFileManager';

const AssignmentGradeDialog = ({open, onClose, submission, assignment, onSuccess}) => {
    const [score, setScore] = useState(submission?.score || '');
    const [feedback, setFeedback] = useState(submission?.feedback || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const {downloadFile} = useFileManager();


    const handleSubmit = async () => {
        // 유효성 검사
        if (!score || score === '') {
            setError('점수를 입력해주세요.');
            return;
        }

        const scoreNum = parseFloat(score);
        if (isNaN(scoreNum) || scoreNum < 0) {
            setError('올바른 점수를 입력해주세요 (0 이상).');
            return;
        }

        if (assignment?.maxScore && scoreNum > assignment.maxScore) {
            setError(`점수는 최대 ${assignment.maxScore}점까지 입력 가능합니다.`);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await gradeSubmission(submission.id, {
                score: scoreNum,
                feedback: feedback || null,
            });

            onSuccess();
        } catch (err) {
            console.error('채점 실패:', err);
            setError(err.response?.data?.message || '채점에 실패했습니다.');
        } finally {
            setLoading(false);
        }
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

    const getStatusChip = (status) => {
        const statusMap = {
            SUBMITTED: {label: '제출됨', color: 'primary'},
            LATE: {label: '지각 제출', color: 'warning'},
            GRADED: {label: '채점 완료', color: 'success'},
        };

        const statusInfo = statusMap[status] || {label: status, color: 'default'};
        return <Chip label={statusInfo.label} color={statusInfo.color} size="small"/>;
    };

    console.log('submission.attachments', submission.attachments);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold">
                        과제 채점
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon/>
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{mb: 2}} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* 제출 정보 */}
                <Box sx={{mb: 3}}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        제출 정보
                    </Typography>
                    <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1}}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                학생 ID
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {submission?.userId}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                제출 시간
                            </Typography>
                            <Typography variant="body2">{formatDate(submission?.submittedAt)}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                상태
                            </Typography>
                            <Box sx={{mt: 0.5}}>{getStatusChip(submission?.status)}</Box>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{my: 2}}/>

                {/* 제출 내용 */}
                <Box sx={{mb: 3}}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        제출 내용
                    </Typography>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            bgcolor: 'grey.50',
                            maxHeight: 200,
                            overflowY: 'auto',
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}
                        >
                            {submission?.content || '내용 없음'}
                        </Typography>
                    </Paper>
                </Box>

                {/* 첨부파일 */}
                {submission?.attachments && submission.attachments.length > 0 && (
                    <Box sx={{mb: 3}}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            첨부파일 ({submission.attachments.length})
                        </Typography>
                        <List dense>
                            {submission.attachments.map((attachment) => (
                                <ListItem
                                    key={attachment.id}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={() => downloadFile(attachment)}
                                            size="small"
                                        >
                                            <DownloadIcon/>
                                        </IconButton>
                                    }
                                >
                                    <ListItemIcon>
                                        <AttachFileIcon/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={attachment.originalName}
                                        secondary={attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(1)} KB` : ''}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                <Divider sx={{my: 2}}/>

                {/* 채점 입력 */}
                <Box sx={{mb: 2}}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        채점
                    </Typography>
                    <TextField
                        fullWidth
                        label="점수"
                        type="number"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        placeholder="0"
                        helperText={
                            assignment?.maxScore
                                ? `최대 점수: ${assignment.maxScore}점`
                                : '점수를 입력해주세요'
                        }
                        InputProps={{
                            inputProps: {
                                min: 0,
                                max: assignment?.maxScore || 100,
                                step: 0.5,
                            },
                        }}
                        sx={{mb: 2}}
                        required
                    />
                    <TextField
                        fullWidth
                        label="피드백"
                        multiline
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="학생에게 전달할 피드백을 입력해주세요 (선택사항)"
                        helperText="피드백은 학생이 확인할 수 있습니다."
                    />
                </Box>

                {/* 이전 채점 정보 */}
                {submission?.gradedAt && (
                    <Alert severity="info" sx={{mt: 2}}>
                        이전 채점: {formatDate(submission.gradedAt)} (점수: {submission.score})
                    </Alert>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    취소
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16}/> : null}
                >
                    {loading ? '저장 중...' : submission?.status === 'GRADED' ? '재채점' : '채점 완료'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignmentGradeDialog;
