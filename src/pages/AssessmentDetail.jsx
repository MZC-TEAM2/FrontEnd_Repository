import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {Alert, Box, Button, Chip, CircularProgress, Container, Paper, Typography,} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {getMyExamResult, getStudentExamDetail, startExamAttempt} from '../api/assessmentApi';
import {formatDateTimeDot} from '../utils/dateUtils';
import {
    getExamLocalInProgress,
    getExamLocalResult,
    onExamAttemptStorageUpdated,
    setExamLocalInProgress,
    setExamLocalResult,
} from '../utils/examAttemptStorage';

const LATE_GRACE_MS = 10 * 60 * 1000; // 종료 후 최대 지각 허용 시간(10분)

export default function AssessmentDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const {courseId, examId} = useParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exam, setExam] = useState(null);
    const [startLoading, setStartLoading] = useState(false);
    const [examStorageTick, setExamStorageTick] = useState(0);

    const title = useMemo(() => exam?.title || '퀴즈/시험', [exam]);
    const hardDeadlinePassed = useMemo(() => {
        const endAtMs = exam?.endAt ? Date.parse(String(exam.endAt)) : NaN;
        if (!Number.isFinite(endAtMs)) return false;
        return Date.now() > endAtMs + LATE_GRACE_MS;
    }, [exam?.endAt]);
    useEffect(() => {
        return onExamAttemptStorageUpdated(() => setExamStorageTick((v) => v + 1));
    }, []);

    const localResult = useMemo(() => getExamLocalResult(examId), [examId, examStorageTick]);
    const localInProgress = useMemo(() => getExamLocalInProgress(examId), [examId, examStorageTick]);

    const fetchDetail = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getStudentExamDetail(examId);
            setExam(res?.data || null);
        } catch (e) {
            setError(e?.message || '상세 정보를 불러오는데 실패했습니다.');
            setExam(null);
        } finally {
            setLoading(false);
        }
    }, [examId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    // 과거 응시 결과 backfill: 로컬에 없으면 서버에서 내 결과 조회 시도
    useEffect(() => {
        if (!examId) return;
        if (localResult) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await getMyExamResult(examId);
                if (cancelled) return;
                const d = res?.data;
                if (!d) return;
                setExamLocalResult(examId, {
                    ...d,
                    examId,
                    examType: exam?.type || null,
                    cachedAt: new Date().toISOString()
                });
            } catch {
                // ignore (미응시/404 or 백엔드 미구현)
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [examId, localResult, exam?.type]);

    const handleStart = async () => {
        try {
            setStartLoading(true);
            const res = await startExamAttempt(examId);
            const attempt = res?.data;
            const attemptId = attempt?.attemptId;
            if (!attemptId) throw new Error('응시 시작에 실패했습니다. (attemptId 없음)');

            // attempt page가 examId를 알아야 렌더링할 수 있으니 최소 메타 저장
            try {
                sessionStorage.setItem(
                    `attempt:${attemptId}`,
                    JSON.stringify({
                        courseId,
                        examId,
                        startedAt: attempt.startedAt,
                        endAt: attempt.endAt,
                        remainingSeconds: attempt.remainingSeconds,
                    })
                );
            } catch {
                // ignore
            }
            // 새로고침/재진입 대비(퀴즈/시험 공통)
            setExamLocalInProgress(examId, {
                attemptId,
                courseId,
                examId,
                startedAt: attempt.startedAt,
                endAt: attempt.endAt,
                remainingSeconds: attempt.remainingSeconds,
                cachedAt: new Date().toISOString(),
            });

            navigate(`/exams/attempts/${attemptId}`, {
                state: {courseId, examId},
                replace: false,
            });
        } catch (e) {
            setError(e?.message || '응시 시작에 실패했습니다.');
        } finally {
            setStartLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{py: 3}}>
            <Box sx={{mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon/>}
                        onClick={() => navigate(location.state?.from || `/course/${courseId}`)}
                    >
                        뒤로
                    </Button>
                    <Typography variant="h5" sx={{fontWeight: 700}}>
                        {title}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PlayCircleOutlineIcon/>}
                    onClick={async () => {
                        // 이미 제출/채점된 경우: 시작 대신 안내만
                        if (localResult) return;
                        // 진행 중 attempt가 로컬에 있으면 이어하기
                        if (localInProgress?.attemptId) {
                            try {
                                sessionStorage.setItem(`attempt:${localInProgress.attemptId}`, JSON.stringify(localInProgress));
                            } catch {
                                // ignore
                            }
                            navigate(`/exams/attempts/${localInProgress.attemptId}`, {
                                state: {courseId, examId},
                                replace: false,
                            });
                            return;
                        }
                        await handleStart();
                    }}
                    disabled={loading || startLoading || hardDeadlinePassed || !!localResult}
                >
                    {localResult
                        ? '응시 완료'
                        : localInProgress?.attemptId
                            ? '응시 이어하기'
                            : startLoading
                                ? '응시 시작 중...'
                                : '응시 시작'}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{mb: 2}} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Paper sx={{p: 3}}>
                {loading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', py: 3}}>
                        <CircularProgress size={22}/>
                    </Box>
                ) : !exam ? (
                    <Alert severity="warning">상세 정보를 찾을 수 없습니다.</Alert>
                ) : (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        {hardDeadlinePassed && (
                            <Alert severity="error">
                                시험/퀴즈 종료 후 10분이 경과하여 더 이상 응시를 시작할 수 없습니다.
                            </Alert>
                        )}
                        {!!localResult && (
                            <Alert severity="success">
                                이미 응시를 완료했습니다.
                                {localResult?.score != null ? (
                                    <>
                                        {' '}
                                        점수: <b>{localResult.score}</b>
                                    </>
                                ) : (
                                    <> (채점은 추후 반영됩니다)</>
                                )}
                            </Alert>
                        )}
                        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                            <Chip label={exam.type || 'QUIZ'}/>
                            <Chip label={`제한시간 ${exam.durationMinutes ?? '-'}분`}/>
                            <Chip label={`${exam.totalScore ?? '-'}점`}/>
                            <Chip label={`${exam.questionCount ?? '-'}문항`}/>
                        </Box>

                        <Alert severity="info">
                            시험/퀴즈는 <b>종료 후 10분</b>까지만 지각 제출이 가능하며, <b>10% 감점</b>됩니다. (10분 초과 시 제출 불가)
                        </Alert>

                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                응시 기간
                            </Typography>
                            <Typography variant="body2">
                                {formatDateTimeDot(exam.startAt)} ~ {formatDateTimeDot(exam.endAt)}
                            </Typography>
                        </Box>

                        {exam.instructions && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    안내
                                </Typography>
                                <Typography variant="body2">{exam.instructions}</Typography>
                            </Box>
                        )}

                        {exam.content && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    설명
                                </Typography>
                                <Typography variant="body2">{exam.content}</Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </Paper>
        </Container>
    );
}


