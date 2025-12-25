import React, {useEffect, useMemo, useState} from 'react';
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
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

import {getProfessorExamAttemptResult, getProfessorExamAttempts, gradeExamAttempt,} from '../../../api/assessmentApi';
import {formatDateTimeDot} from '../../../utils/dateUtils';
import {normalizeQuestionData} from '../../../utils/examUtils';

const computeMcqScore = (questions, answers) => {
    const qs = Array.isArray(questions) ? questions : [];
    const ans = answers && typeof answers === 'object' ? answers : {};
    return qs.reduce((sum, q, idx) => {
        const qid = q?.id ?? `q-${idx + 1}`;
        const qType = String(q?.type || '').toUpperCase();
        if (qType !== 'MCQ') return sum;
        const pts = Number(q?.points) || 0;
        const correctIdx = Number(q?.correctChoiceIndex);
        const my = ans[qid];
        const myIdx = my == null || my === '' ? NaN : Number(my);
        const isCorrect = Number.isFinite(correctIdx) && Number.isFinite(myIdx) && correctIdx === myIdx;
        return sum + (isCorrect ? pts : 0);
    }, 0);
};

const normalizeAnswerData = (answerData) => {
    if (!answerData) return {answers: {}};
    if (typeof answerData === 'object') {
        const a = answerData.answers && typeof answerData.answers === 'object' ? answerData.answers : {};
        return {...answerData, answers: a};
    }
    if (typeof answerData === 'string') {
        const raw = answerData.trim();
        if (!raw) return {answers: {}};
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                const a = parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {};
                return {...parsed, answers: a};
            }
            return {answers: {}};
        } catch {
            return {answers: {}};
        }
    }
    return {answers: {}};
};

const formatStudentLabel = (student) => {
    if (!student) return '-';
    const name = student.name || '';
    const num = student.studentNumber || '';
    const id = student.id != null ? String(student.id) : '';
    const parts = [name, num].filter(Boolean);
    if (parts.length > 0) return parts.join(' ');
    return id || '-';
};

const StatusChip = ({submittedAt, score}) => {
    if (!submittedAt) return <Chip size="small" label="진행 중"/>;
    if (score != null) return <Chip size="small" color="success" label="채점됨"/>;
    return <Chip size="small" color="primary" label="제출됨"/>;
};

export default function ExamAttemptsDialog({
                                               open,
                                               onClose,
                                               examId,
                                               examTitle,
                                               examType, // 'QUIZ' | 'MIDTERM' | 'FINAL' | 'REGULAR'
                                               totalScore,
                                           }) {
    const isQuiz = String(examType || '').toUpperCase() === 'QUIZ';

    const [status, setStatus] = useState('ALL');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);
    const [quizScoreLoading, setQuizScoreLoading] = useState(false);
    const [quizScoresByAttempt, setQuizScoresByAttempt] = useState({});

    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState(null);
    const [selectedAttemptId, setSelectedAttemptId] = useState(null);
    const [detail, setDetail] = useState(null);

    const [subjectiveScores, setSubjectiveScores] = useState({});
    const [feedback, setFeedback] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);

    const questions = useMemo(
        () => normalizeQuestionData(detail?.questionData).questions || [],
        [detail?.questionData]
    );
    const answers = useMemo(() => normalizeAnswerData(detail?.answerData).answers || {}, [detail?.answerData]);

    const mcqAutoScore = useMemo(() => {
        return computeMcqScore(questions, answers);
    }, [questions, answers]);

    const subjectiveMaxScore = useMemo(() => {
        return questions.reduce((sum, q) => {
            const qType = String(q?.type || '').toUpperCase();
            if (qType !== 'SUBJECTIVE') return sum;
            return sum + (Number(q?.points) || 0);
        }, 0);
    }, [questions]);

    const subjectiveGivenScore = useMemo(() => {
        return questions.reduce((sum, q, idx) => {
            const qid = q?.id ?? `q-${idx + 1}`;
            const qType = String(q?.type || '').toUpperCase();
            if (qType !== 'SUBJECTIVE') return sum;
            const max = Number(q?.points) || 0;
            const raw = subjectiveScores[qid];
            const n = raw == null || raw === '' ? 0 : Number(raw);
            const clamped = Number.isFinite(n) ? Math.min(Math.max(0, n), Math.max(0, max)) : 0;
            return sum + clamped;
        }, 0);
    }, [questions, subjectiveScores]);

    const computedTotalScore = useMemo(() => {
        return mcqAutoScore + subjectiveGivenScore;
    }, [mcqAutoScore, subjectiveGivenScore]);

    const fetchList = async () => {
        if (!examId) return;
        try {
            setLoading(true);
            setError(null);
            const res = await getProfessorExamAttempts(examId, {status});
            setItems(res?.data || []);
        } catch (e) {
            setError(e?.message || '응시자 목록을 불러오는데 실패했습니다.');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetail = async (attemptId) => {
        if (!attemptId) return;
        try {
            setDetailLoading(true);
            setDetailError(null);
            const res = await getProfessorExamAttemptResult(attemptId);
            const d = res?.data || null;
            setDetail(d);
            setSelectedAttemptId(attemptId);
            setSubjectiveScores({});
            setFeedback(d?.feedback || '');
            // 퀴즈는 자동채점인데 서버 score가 비어있을 수 있으니 프론트에서 계산해 보강
            if (isQuiz && d) {
                const qs = normalizeQuestionData(d?.questionData).questions || [];
                const a = normalizeAnswerData(d?.answerData).answers || {};
                const computed = computeMcqScore(qs, a);
                setQuizScoresByAttempt((prev) => ({...prev, [attemptId]: computed}));
            }
        } catch (e) {
            setDetailError(e?.message || '응시 상세를 불러오는데 실패했습니다.');
            setDetail(null);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        if (!open) return;
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, examId, status]);

    useEffect(() => {
        if (!open) return;
        // dialog가 열릴 때 선택/상세 초기화
        setSelectedAttemptId(null);
        setDetail(null);
        setDetailError(null);
        setSubjectiveScores({});
        setFeedback('');
        setQuizScoresByAttempt({});
    }, [open, examId]);

    const fetchQuizScores = async () => {
        if (!isQuiz) return;
        if (!examId) return;
        if (!Array.isArray(items) || items.length === 0) return;

        const targets = items
            .map((x) => x?.attemptId)
            .filter((id) => id != null && id !== '')
            .filter((id) => quizScoresByAttempt[id] == null);

        if (targets.length === 0) return;

        try {
            setQuizScoreLoading(true);
            // 단순 병렬 호출 (리스트가 매우 큰 경우 백엔드에 맞게 제한 필요)
            const results = await Promise.all(
                targets.map(async (attemptId) => {
                    try {
                        const res = await getProfessorExamAttemptResult(attemptId);
                        const d = res?.data || null;
                        const qs = normalizeQuestionData(d?.questionData).questions || [];
                        const a = normalizeAnswerData(d?.answerData).answers || {};
                        const computed = computeMcqScore(qs, a);
                        return {attemptId, computed};
                    } catch {
                        return {attemptId, computed: null};
                    }
                })
            );
            setQuizScoresByAttempt((prev) => {
                const next = {...prev};
                results.forEach((r) => {
                    if (r?.attemptId == null) return;
                    if (r.computed == null) return;
                    next[r.attemptId] = r.computed;
                });
                return next;
            });
        } finally {
            setQuizScoreLoading(false);
        }
    };

    const handleSaveGrade = async () => {
        if (isQuiz) return;
        if (!selectedAttemptId) return;
        const scoreNum = Number(computedTotalScore);
        if (!Number.isFinite(scoreNum) || scoreNum < 0) {
            setDetailError('총점 계산값이 올바르지 않습니다.');
            return;
        }
        if (totalScore != null && Number.isFinite(Number(totalScore)) && scoreNum > Number(totalScore)) {
            setDetailError(`총점이 최대점수(${totalScore})를 초과했습니다.`);
            return;
        }

        try {
            setSaveLoading(true);
            setDetailError(null);
            await gradeExamAttempt(selectedAttemptId, {score: scoreNum, feedback: feedback || null});
            await fetchDetail(selectedAttemptId);
            await fetchList();
        } catch (e) {
            setDetailError(e?.message || '채점 저장에 실패했습니다.');
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2}}>
                    <Box>
                        <Typography variant="h6" sx={{fontWeight: 800}}>
                            응시/채점
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {examTitle || `시험 #${examId}`}
                        </Typography>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        {isQuiz && (
                            <Button size="small" variant="outlined" onClick={fetchQuizScores}
                                    disabled={quizScoreLoading || loading}>
                                {quizScoreLoading ? '점수 계산 중...' : '점수 불러오기'}
                            </Button>
                        )}
                        <IconButton onClick={fetchList} disabled={loading} title="새로고침">
                            <RefreshIcon/>
                        </IconButton>
                        <IconButton onClick={onClose} title="닫기">
                            <CloseIcon/>
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{mb: 2}} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2}}>
                    <TextField
                        select
                        size="small"
                        label="상태"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        sx={{minWidth: 160}}
                    >
                        <MenuItem value="ALL">전체</MenuItem>
                        <MenuItem value="SUBMITTED">제출됨</MenuItem>
                        <MenuItem value="IN_PROGRESS">진행 중</MenuItem>
                    </TextField>
                    {isQuiz && (
                        <Alert severity="info" sx={{py: 0}}>
                            퀴즈는 자동채점입니다. (점수 조회만 가능)
                        </Alert>
                    )}
                </Box>

                <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'}, gap: 2}}>
                    <Paper variant="outlined" sx={{p: 1}}>
                        {loading ? (
                            <Box sx={{display: 'flex', justifyContent: 'center', py: 3}}>
                                <CircularProgress size={22}/>
                            </Box>
                        ) : items.length === 0 ? (
                            <Alert severity="info">응시 기록이 없습니다.</Alert>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>학생</TableCell>
                                            <TableCell>제출</TableCell>
                                            <TableCell>상태</TableCell>
                                            <TableCell align="right">점수</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.map((x) => {
                                            const attemptId = x?.attemptId;
                                            const isSelected = selectedAttemptId != null && String(selectedAttemptId) === String(attemptId);
                                            const computedQuizScore = attemptId != null ? quizScoresByAttempt[attemptId] : null;
                                            const displayScore =
                                                x?.score != null
                                                    ? x.score
                                                    : isQuiz && computedQuizScore != null
                                                        ? computedQuizScore
                                                        : '-';
                                            return (
                                                <TableRow
                                                    key={attemptId}
                                                    hover
                                                    selected={isSelected}
                                                    sx={{cursor: attemptId ? 'pointer' : 'default'}}
                                                    onClick={() => attemptId && fetchDetail(attemptId)}
                                                >
                                                    <TableCell>{formatStudentLabel(x?.student)}</TableCell>
                                                    <TableCell>{x?.submittedAt ? formatDateTimeDot(x.submittedAt) : '-'}</TableCell>
                                                    <TableCell>
                                                        <StatusChip submittedAt={x?.submittedAt} score={x?.score}/>
                                                    </TableCell>
                                                    <TableCell align="right">{displayScore}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>

                    <Paper variant="outlined" sx={{p: 2}}>
                        {!selectedAttemptId ? (
                            <Alert severity="info">좌측 목록에서 학생을 선택하면 답안/채점 정보를 볼 수 있습니다.</Alert>
                        ) : detailLoading ? (
                            <Box sx={{display: 'flex', justifyContent: 'center', py: 3}}>
                                <CircularProgress size={22}/>
                            </Box>
                        ) : detailError ? (
                            <Alert severity="error" onClose={() => setDetailError(null)}>
                                {detailError}
                            </Alert>
                        ) : !detail ? (
                            <Alert severity="warning">상세 정보를 찾을 수 없습니다.</Alert>
                        ) : (
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap'}}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            학생
                                        </Typography>
                                        <Typography variant="body2" sx={{fontWeight: 700}}>
                                            {formatStudentLabel(detail?.student)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            제출
                                        </Typography>
                                        <Typography
                                            variant="body2">{detail?.submittedAt ? formatDateTimeDot(detail.submittedAt) : '-'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            점수
                                        </Typography>
                                        <Typography variant="body2">
                                            {detail?.score != null ? detail.score : isQuiz ? computedTotalScore : '-'}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider/>

                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                    <Typography variant="subtitle2" sx={{fontWeight: 800}}>
                                        답안
                                    </Typography>
                                    {questions.length === 0 ? (
                                        <Alert severity="warning">문항 데이터가 없습니다.</Alert>
                                    ) : (
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                            {questions.map((q, idx) => {
                                                const qid = q?.id ?? `q-${idx + 1}`;
                                                const qType = String(q?.type || '').toUpperCase();
                                                const my = answers[qid];
                                                const correctIdx = q?.correctChoiceIndex;
                                                const isMcq = qType === 'MCQ';
                                                const isSubjective = qType === 'SUBJECTIVE';
                                                const myIdx = isMcq && my != null && my !== '' ? Number(my) : null;
                                                const isCorrect =
                                                    isMcq && Number.isFinite(Number(correctIdx)) && Number.isFinite(myIdx)
                                                        ? Number(correctIdx) === Number(myIdx)
                                                        : null;
                                                const pts = Number(q?.points) || 0;
                                                return (
                                                    <Paper key={qid} variant="outlined" sx={{p: 1.5}}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            gap: 2
                                                        }}>
                                                            <Typography variant="body2" sx={{fontWeight: 700}}>
                                                                {idx + 1}. {q?.prompt || ''}
                                                            </Typography>
                                                            {q?.points != null && (
                                                                <Typography variant="caption" color="text.secondary"
                                                                            sx={{whiteSpace: 'nowrap'}}>
                                                                    {q.points}점
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <Box sx={{mt: 1}}>
                                                            {isMcq ? (
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: 0.5
                                                                }}>
                                                                    <Typography variant="caption"
                                                                                color="text.secondary">
                                                                        학생 답안: {myIdx == null ? '-' : `${myIdx + 1}번`}
                                                                    </Typography>
                                                                    {Number.isFinite(Number(correctIdx)) && (
                                                                        <Typography variant="caption"
                                                                                    color="text.secondary">
                                                                            정답: {Number(correctIdx) + 1}번{' '}
                                                                            {isCorrect == null ? null : isCorrect ? (
                                                                                <Chip size="small" color="success"
                                                                                      label="정답" sx={{ml: 1}}/>
                                                                            ) : (
                                                                                <Chip size="small" color="error"
                                                                                      label="오답" sx={{ml: 1}}/>
                                                                            )}
                                                                        </Typography>
                                                                    )}
                                                                    {!isQuiz && (
                                                                        <Typography variant="caption"
                                                                                    color="text.secondary">
                                                                            자동 채점 점수: {isCorrect ? pts : 0}/{pts}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            ) : (
                                                                <Box>
                                                                    <Typography variant="caption"
                                                                                color="text.secondary">
                                                                        학생 답안
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{
                                                                        whiteSpace: 'pre-wrap',
                                                                        wordBreak: 'break-word'
                                                                    }}>
                                                                        {my == null || String(my).trim() === '' ? '-' : String(my)}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>

                                                        {!isQuiz && isSubjective && (
                                                            <Box sx={{
                                                                mt: 1.5,
                                                                display: 'flex',
                                                                justifyContent: 'flex-end'
                                                            }}>
                                                                <TextField
                                                                    size="small"
                                                                    type="number"
                                                                    label="부여 점수"
                                                                    value={subjectiveScores[qid] ?? ''}
                                                                    onChange={(e) =>
                                                                        setSubjectiveScores((prev) => ({
                                                                            ...prev,
                                                                            [qid]: e.target.value
                                                                        }))
                                                                    }
                                                                    inputProps={{min: 0, max: pts, step: 1}}
                                                                    sx={{width: 160}}
                                                                    helperText={`0 ~ ${pts}점`}
                                                                />
                                                            </Box>
                                                        )}
                                                    </Paper>
                                                );
                                            })}
                                        </Box>
                                    )}
                                </Box>

                                {!isQuiz && (
                                    <>
                                        <Divider/>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                            <Typography variant="subtitle2" sx={{fontWeight: 800}}>
                                                채점
                                            </Typography>
                                            <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                                                <Chip size="small" label={`객관식 자동 ${mcqAutoScore}점`}/>
                                                <Chip size="small"
                                                      label={`주관식 ${subjectiveGivenScore}/${subjectiveMaxScore}점`}/>
                                                <Chip size="small" color="primary" label={`총점 ${computedTotalScore}점`}/>
                                            </Box>
                                            <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                                                <TextField
                                                    size="small"
                                                    label="피드백"
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    sx={{flex: 1, minWidth: 240}}
                                                />
                                            </Box>
                                            <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                                                <Button variant="contained" onClick={handleSaveGrade}
                                                        disabled={saveLoading}>
                                                    {saveLoading ? '저장 중...' : '채점 저장'}
                                                </Button>
                                            </Box>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        )}
                    </Paper>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
        </Dialog>
    );
}


