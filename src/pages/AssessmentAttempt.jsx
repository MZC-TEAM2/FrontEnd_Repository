import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

import { getStudentExamDetail, submitExamAttempt } from '../api/assessmentApi';
import { normalizeQuestionData } from '../utils/examUtils';
import { clearExamLocalInProgress, setExamLocalResult } from '../utils/examAttemptStorage';

const formatSeconds = (s) => {
  const sec = Math.max(0, Number(s) || 0);
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

const LATE_GRACE_SECONDS = 10 * 60; // 시험/퀴즈 종료 후 최대 지각 제출 허용 시간

export default function AssessmentAttempt() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [examId, setExamId] = useState(location.state?.examId || null);
  const [courseId, setCourseId] = useState(location.state?.courseId || null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const tickRef = useRef(null);

  // attempt meta 복구(새로고침 대비)
  useEffect(() => {
    if (examId && courseId) return;
    try {
      const raw = sessionStorage.getItem(`attempt:${attemptId}`);
      if (!raw) return;
      const meta = JSON.parse(raw);
      if (meta?.examId) setExamId(meta.examId);
      if (meta?.courseId) setCourseId(meta.courseId);
      if (meta?.remainingSeconds != null) setRemainingSeconds(meta.remainingSeconds);
    } catch {
      // ignore
    }
  }, [attemptId, examId, courseId]);

  // 시험 상세 로드(문항 렌더링)
  useEffect(() => {
    const run = async () => {
      if (!examId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await getStudentExamDetail(examId);
        setExam(res?.data || null);
      } catch (e) {
        setError(e?.message || '시험/퀴즈 정보를 불러오는데 실패했습니다.');
        setExam(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [examId]);

  const questions = useMemo(() => normalizeQuestionData(exam?.questionData).questions || [], [exam]);
  const title = useMemo(() => exam?.title || '시험/퀴즈', [exam]);
  const isQuiz = useMemo(() => String(exam?.type || '').toUpperCase() === 'QUIZ', [exam?.type]);
  const hasUnsupportedQuestionType = useMemo(() => {
    const supported = new Set(['MCQ', 'SUBJECTIVE']);
    return questions.some((q) => !supported.has(String(q?.type || '').toUpperCase()));
  }, [questions]);

  // 남은 시간 타이머
  useEffect(() => {
    if (submitted) return;
    if (remainingSeconds == null) return;
    if (tickRef.current) clearInterval(tickRef.current);

    tickRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = (Number(prev) || 0) - 1;
        return next;
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [remainingSeconds, submitted]);

  // 시간 만료 시 자동 제출
  useEffect(() => {
    if (submitted) return;
    if (remainingSeconds == null) return;
    // 정책 변경: 종료 후 10분까지 지각 제출 허용, 이후 제출 불가(프론트에서도 차단)
    // 종료 시점(remainingSeconds <= 0)에는 자동 제출하지 않고, 답안 수정만 잠금
  }, [remainingSeconds, submitted]);

  const isTimeOver = remainingSeconds != null && Number(remainingSeconds) <= 0;
  const hardDeadlineOver =
    remainingSeconds != null && Number.isFinite(Number(remainingSeconds)) && Number(remainingSeconds) <= -LATE_GRACE_SECONDS;

  const handleChangeAnswer = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async (isAuto = false) => {
    if (submitLoading || submitted) return;
    if (hardDeadlineOver) {
      setError('제출 가능 시간이 지났습니다. (시험 종료 후 10분 초과)');
      return;
    }
    try {
      setSubmitLoading(true);
      setError(null);
      const res = await submitExamAttempt(attemptId, answers);
      const result = res?.data || { ok: true };
      setSubmitted(result);
      // 결과 캐시 (퀴즈 점수/응시 완료 상태 표시용)
      if (examId) {
        setExamLocalResult(examId, {
          ...result,
          examId,
          courseId,
          examType: exam?.type || null,
          cachedAt: new Date().toISOString(),
        });
        clearExamLocalInProgress(examId);
      }
      try {
        sessionStorage.removeItem(`attempt:${attemptId}`);
      } catch {
        // ignore
      }
      if (isAuto) {
        // 자동 제출이면 상단에 안내만 띄워두고 화면 유지
      }
    } catch (e) {
      setError(e?.message || '제출에 실패했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!examId) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          응시 정보를 복구할 수 없습니다. (examId 없음)
        </Alert>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          뒤로
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(courseId ? `/course/${courseId}` : -1)}
            disabled={submitLoading}
          >
            강의로
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {remainingSeconds != null && (
            <Typography variant="body2" sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
              남은시간 {formatSeconds(remainingSeconds)}
            </Typography>
          )}
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => handleSubmit(false)}
            disabled={submitLoading || !!submitted || hardDeadlineOver}
          >
            {submitLoading ? '제출 중...' : submitted ? '제출 완료' : '제출'}
          </Button>
        </Box>
      </Box>

      {isTimeOver && !submitted && !hardDeadlineOver && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          시험 시간이 종료되었습니다. 종료 후 <b>10분</b>까지만 지각 제출이 가능하며, 지각 제출 시 <b>10% 감점</b>됩니다.
          (답안 수정은 불가)
        </Alert>
      )}
      {hardDeadlineOver && !submitted && (
        <Alert severity="error" sx={{ mb: 2 }}>
          시험 종료 후 10분이 경과하여 더 이상 제출할 수 없습니다.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {submitted && (
        <Alert severity="success" sx={{ mb: 2 }}>
          제출이 완료되었습니다.
          {isQuiz && submitted?.score != null ? (
            <>
              {' '}
              점수: <b>{submitted.score}</b>
              {submitted?.isLate ? (
                <>
                  {' '}
                  (지각 제출 {Math.round((Number(submitted?.latePenaltyRate) || 0) * 100)}% 감점 적용)
                </>
              ) : null}
            </>
          ) : (
            <> (채점은 추후 반영됩니다)</>
          )}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={22} />
          </Box>
        ) : !exam ? (
          <Alert severity="warning">시험/퀴즈 정보를 찾을 수 없습니다.</Alert>
        ) : hasUnsupportedQuestionType ? (
          <Alert severity="error">
            현재 버전은 객관식(MCQ) / 주관식(SUBJECTIVE) 문항만 지원합니다. (서버 문항 타입을 확인해주세요)
          </Alert>
        ) : questions.length === 0 ? (
          <Alert severity="warning">문항 데이터가 없습니다.</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {questions.map((q, idx) => {
              const qid = q?.id ?? `q-${idx + 1}`;
              const qType = String(q?.type || '').toUpperCase();
              const points = q?.points;
              const prompt = q?.prompt || '';
              const value = answers[qid];

              return (
                <Box key={qid}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {idx + 1}. {prompt}
                    </Typography>
                    {points != null && (
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {points}점
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mt: 1 }}>
                    {qType === 'MCQ' && Array.isArray(q?.choices) ? (
                      <RadioGroup
                        value={value == null ? '' : String(value)}
                        onChange={(e) => handleChangeAnswer(qid, Number(e.target.value))}
                      >
                        {q.choices.map((c, i) => (
                          <FormControlLabel
                            key={`${qid}-c-${i}`}
                            value={String(i)}
                            control={<Radio />}
                            label={String(c)}
                            disabled={!!submitted || isTimeOver}
                          />
                        ))}
                      </RadioGroup>
                    ) : qType === 'SUBJECTIVE' ? (
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="답안"
                        placeholder="답안을 입력하세요"
                        value={value == null ? '' : String(value)}
                        onChange={(e) => handleChangeAnswer(qid, e.target.value)}
                        disabled={!!submitted || isTimeOver}
                      />
                    ) : null}
                  </Box>

                  {idx < questions.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Container>
  );
}


