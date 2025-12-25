import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Paper,
    Typography,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Assignment as AssignmentIcon,
    CalendarToday as CalendarIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    Grade as GradeIcon,
    Upload as UploadIcon,
} from '@mui/icons-material';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {useAssignment} from '../../hooks/useAssignment';
import {useFileManager} from '../../../board/hooks/useFileManager';
import {formatDateTime} from '../../../../utils/boardUtils';
import authService from '../../../../services/authService';
import AssignmentSubmitForm from './AssignmentSubmitForm';

const AssignmentDetailPage = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const [searchParams] = useSearchParams();
    const fromCourse = searchParams.get('from') === 'course';
    const courseIdFromUrl = searchParams.get('courseId');
    const [assignment, setAssignment] = useState(null);
    const [mySubmission, setMySubmission] = useState(null);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentUser = authService.getCurrentUser();
    const userType = currentUser?.userType;
    const isProfessor = userType === 'PROFESSOR';
    const isStudent = userType === 'STUDENT';

    const {
        getAssignment,
        getMySubmission,
        deleteAssignment,
        loading: actionLoading,
    } = useAssignment();

    const {downloadFile} = useFileManager();

    // 과제 상세 조회
    useEffect(() => {
        const loadAssignment = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAssignment(id);
                setAssignment(data);

                // 학생: 내 제출 조회
                if (isStudent) {
                    try {
                        const mySubmissionData = await getMySubmission(id);
                        setMySubmission(mySubmissionData);
                    } catch (err) {
                        // 404는 제출 안 함
                        if (err.response?.status !== 404) {
                            console.error('내 제출 조회 실패:', err);
                        }
                    }
                }
            } catch (err) {
                console.error('과제 조회 실패:', err);
                setError('과제를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadAssignment();
    }, [id, isProfessor, isStudent]);

    // 과제 삭제
    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;

        try {
            await deleteAssignment(id);
            alert('과제가 삭제되었습니다.');

            // 삭제 후 네비게이션: 강의 관리 페이지에서 온 경우 강의 상세로, 아니면 과제 목록으로
            if (fromCourse && courseIdFromUrl) {
                navigate(`/professor/course/${courseIdFromUrl}/manage?tab=3`);
            } else if (isProfessor && assignment?.courseId) {
                navigate(`/professor/course/${assignment.courseId}/manage?tab=3`);
            }
        } catch (err) {
            alert('과제 삭제에 실패했습니다.');
        }
    };

    // 제출 완료 후 리로드
    const handleSubmitSuccess = async () => {
        setShowSubmitForm(false);
        const mySubmissionData = await getMySubmission(id);
        setMySubmission(mySubmissionData);
    };

    // 목록으로 돌아가기
    const handleBack = () => {
        if (isProfessor) {
            navigate(`/professor/course/${assignment.courseId}/manage?tab=3`);
        } else {
            navigate(`/course/${assignment.courseId}?tab=2`);
        }
    };


    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (error || !assignment) {
        return (
            <Box>
                <Alert severity="error" sx={{mb: 3}}>
                    {error || '과제를 찾을 수 없습니다.'}
                </Alert>
                <Button startIcon={<ArrowBackIcon/>} onClick={handleBack}>
                    목록으로
                </Button>
            </Box>
        );
    }

    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const isOverdue = now > dueDate;
    const isSubmitted = mySubmission !== null;

    return (
        <Box>
            {/* 상단 네비게이션 */}
            <Box sx={{mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Button startIcon={<ArrowBackIcon/>} onClick={handleBack}>
                    목록으로
                </Button>
                {isProfessor && (
                    <Box>
                        <Button
                            variant="contained"
                            startIcon={<GradeIcon/>}
                            sx={{mr: 1}}
                            onClick={() => navigate(`/assignment/${id}/submissions`)}
                        >
                            제출물 보기
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{mr: 1}}
                            onClick={() => navigate(`/assignment/${id}/edit`)}
                        >
                            수정
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleDelete}
                            disabled={actionLoading}
                        >
                            삭제
                        </Button>
                    </Box>
                )}
            </Box>

            {/* 과제 상세 */}
            <Paper sx={{p: 4, mb: 3}}>
                {/* 헤더 */}
                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                    <AssignmentIcon sx={{mr: 1, color: 'primary.main', fontSize: 32}}/>
                    <Typography variant="h5" component="h1">
                        {assignment.post?.title}
                    </Typography>
                </Box>

                <Grid container spacing={2} sx={{mb: 3}}>
                    <Grid size={{xs: 12, sm: 6}}>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <CalendarIcon sx={{mr: 1, fontSize: 20, color: 'text.secondary'}}/>
                            <Typography variant="body2" color="text.secondary">
                                마감일: {formatDateTime(assignment.dueDate)}
                                {isOverdue && (
                                    <Chip label="마감" size="small" color="error" sx={{ml: 1}}/>
                                )}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{xs: 12, sm: 6}}>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <GradeIcon sx={{mr: 1, fontSize: 20, color: 'text.secondary'}}/>
                            <Typography variant="body2" color="text.secondary">
                                만점: {assignment.maxScore}점
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{my: 3}}/>

                {/* 과제 설명 */}
                <Typography variant="h6" gutterBottom>
                    과제 설명
                </Typography>
                <Typography variant="body1" sx={{whiteSpace: 'pre-wrap', mb: 3}}>
                    {assignment.post?.content}
                </Typography>

                {/* 제출 방법 */}
                <Box sx={{mb: 2}}>
                    <Typography variant="body2" color="text.secondary">
                        제출 방법: {
                        assignment.submissionMethod === 'FILE_UPLOAD' ? '파일 업로드' :
                            assignment.submissionMethod === 'TEXT_INPUT' ? '텍스트 입력' :
                                assignment.submissionMethod === 'BOTH' ? '파일 + 텍스트' :
                                    assignment.submissionMethod
                    }
                    </Typography>
                </Box>
            </Paper>

            {/* 학생: 내 제출 현황 */}
            {isStudent && (
                <Paper sx={{p: 4, mb: 3}}>
                    <Typography variant="h6" gutterBottom>
                        내 제출 현황
                    </Typography>
                    {isSubmitted ? (
                        <Card variant="outlined">
                            <CardContent>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <CheckCircleIcon sx={{mr: 1, color: 'success.main'}}/>
                                    <Typography variant="body1" fontWeight="bold">
                                        제출 완료
                                    </Typography>
                                    <Chip
                                        label={mySubmission.status}
                                        size="small"
                                        color={mySubmission.status === 'GRADED' ? 'success' : 'default'}
                                        sx={{ml: 2}}
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    제출 시간: {formatDateTime(mySubmission.submittedAt)}
                                </Typography>
                                <Divider sx={{my: 2}}/>
                                <Typography variant="body1" sx={{whiteSpace: 'pre-wrap', mb: 2}}>
                                    {mySubmission.content}
                                </Typography>
                                {mySubmission.attachments && mySubmission.attachments.length > 0 && (
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            첨부파일:
                                        </Typography>
                                        {mySubmission.attachments.map((file) => (
                                            <Button
                                                key={file.id}
                                                variant="outlined"
                                                size="small"
                                                sx={{mr: 1, mb: 1}}
                                                onClick={() => downloadFile(file)}
                                            >
                                                {file.originalName} ({Math.round(file.fileSize / 1024)}KB)
                                            </Button>
                                        ))}
                                    </Box>
                                )}
                                {mySubmission.status === 'GRADED' && (
                                    <Box sx={{mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1}}>
                                        <Typography variant="h6" gutterBottom>
                                            채점 결과
                                        </Typography>
                                        <Typography variant="body1" gutterBottom>
                                            점수: <strong>{mySubmission.score}</strong> / {assignment.maxScore}
                                        </Typography>
                                        {mySubmission.feedback && (
                                            <>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    피드백:
                                                </Typography>
                                                <Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>
                                                    {mySubmission.feedback}
                                                </Typography>
                                            </>
                                        )}
                                        <Typography variant="caption" color="text.secondary" display="block"
                                                    sx={{mt: 1}}>
                                            채점 시간: {formatDateTime(mySubmission.gradedAt)}
                                        </Typography>
                                    </Box>
                                )}

                                {/* 재제출 버튼 (채점 후 교수가 허용한 경우) */}
                                {mySubmission.status === 'GRADED' && mySubmission.allowResubmission && (
                                    <Box sx={{mt: 3}}>
                                        <Alert severity="info" sx={{mb: 2}}>
                                            교수님이 재제출을 허용했습니다.
                                            {mySubmission.resubmissionDeadline && (
                                                <> 마감: {formatDateTime(mySubmission.resubmissionDeadline)}</>
                                            )}
                                        </Alert>
                                        {!showSubmitForm ? (
                                            <Button
                                                variant="contained"
                                                startIcon={<UploadIcon/>}
                                                onClick={() => setShowSubmitForm(true)}
                                            >
                                                과제 재제출하기
                                            </Button>
                                        ) : (
                                            <AssignmentSubmitForm
                                                assignmentId={id}
                                                submissionMethod={assignment.submissionMethod}
                                                onSuccess={handleSubmitSuccess}
                                                onCancel={() => setShowSubmitForm(false)}
                                            />
                                        )}
                                    </Box>
                                )}

                                {/* 수정 버튼 (채점 전) */}
                                {mySubmission.status !== 'GRADED' && (
                                    <Box sx={{mt: 3}}>
                                        {!showSubmitForm ? (
                                            <Button
                                                variant="outlined"
                                                startIcon={<UploadIcon/>}
                                                onClick={() => setShowSubmitForm(true)}
                                            >
                                                과제 수정하기
                                            </Button>
                                        ) : (
                                            <AssignmentSubmitForm
                                                assignmentId={id}
                                                existingSubmission={mySubmission}
                                                submissionMethod={assignment.submissionMethod}
                                                onSuccess={handleSubmitSuccess}
                                                onCancel={() => setShowSubmitForm(false)}
                                            />
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Box>
                            {isOverdue ? (
                                <Alert severity="error" icon={<CancelIcon/>}>
                                    마감 기한이 지났습니다. 과제를 제출할 수 없습니다.
                                </Alert>
                            ) : (
                                <>
                                    {!showSubmitForm ? (
                                        <Button
                                            variant="contained"
                                            startIcon={<UploadIcon/>}
                                            onClick={() => setShowSubmitForm(true)}
                                        >
                                            과제 제출하기
                                        </Button>
                                    ) : (
                                        <AssignmentSubmitForm
                                            assignmentId={id}
                                            existingSubmission={mySubmission}
                                            submissionMethod={assignment.submissionMethod}
                                            onSuccess={handleSubmitSuccess}
                                            onCancel={() => setShowSubmitForm(false)}
                                        />
                                    )}
                                </>
                            )}
                        </Box>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default AssignmentDetailPage;
