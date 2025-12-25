import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
    ListItemText,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import RefreshIcon from '@mui/icons-material/Refresh';
import {DateTimePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {ko} from 'date-fns/locale';
import {format, isValid, parseISO} from 'date-fns';

import ExamAttemptsDialog from './ExamAttemptsDialog';
import {
    createExam,
    deleteExam,
    getProfessorExamDetail,
    getProfessorExams,
    updateExam,
} from '../../../api/assessmentApi';
import {formatDateTimeDot} from '../../../utils/dateUtils';
import {normalizeQuestionData} from '../../../utils/examUtils';

const toStartAtDate = (iso) => {
    if (!iso) return null;
    try {
        const d = parseISO(String(iso));
        return isValid(d) ? d : null;
    } catch {
        return null;
    }
};

const toApiDatetime = (dtLocal) => {
    // 입력 예:
    // - "2024-10-20T10:00" (datetime-local 스타일)
    // - "2024-10-20T10:00:00"
    // - "2024-10-20T10:00:00Z"
    // - "2024. 10. 20. 10:00" (요청: 연.월.일.시간)
    // 백엔드 스펙: "YYYY-MM-DDTHH:mm:ss" (Z 없음)
    if (!dtLocal) return null;
    if (dtLocal instanceof Date) {
        if (!isValid(dtLocal)) return null;
        return format(dtLocal, "yyyy-MM-dd'T'HH:mm:ss");
    }
    const raw = String(dtLocal).trim();
    if (!raw) return null;

    // "YYYY. MM. DD. HH:mm" 또는 "YYYY.MM.DD.HH:mm"
    const compact = raw.replace(/\s+/g, '').replace('Z', '');
    const dot = compact.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})\.(\d{1,2}):(\d{2})$/);
    if (dot) {
        const [, y, mo, d, h, mi] = dot;
        const mm = String(mo).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        const hh = String(h).padStart(2, '0');
        return `${y}-${mm}-${dd}T${hh}:${mi}:00`;
    }

    const v = compact;
    if (v.length >= 19) return v.slice(0, 19);
    if (v.length === 16) return `${v}:00`;
    return v;
};

const makeId = () => `q${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export default function AssessmentManagement({
                                                 courseId,
                                                 mode, // 'QUIZ' | 'EXAM'
                                             }) {
    const isQuiz = mode === 'QUIZ';
    const normalizeExamTypeForUi = useCallback(
        (t) => {
            if (isQuiz) return 'QUIZ';
            return String(t || '').toUpperCase() === 'FINAL' ? 'FINAL' : 'MIDTERM';
        },
        [isQuiz]
    );
    const formatTypeLabel = useCallback(
        (t) => {
            const v = String(t || '').toUpperCase();
            if (v === 'QUIZ') return '퀴즈';
            if (v === 'FINAL') return '기말고사';
            return '중간고사';
        },
        []
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [attemptsOpen, setAttemptsOpen] = useState(false);
    const [attemptsExam, setAttemptsExam] = useState(null);
    const [form, setForm] = useState({
        title: '',
        content: '',
        type: isQuiz ? 'QUIZ' : 'MIDTERM',
        startAt: null, // Date | null
        durationMinutes: 15,
        totalScore: 100,
        passingScore: 0,
        isOnline: true,
        location: '온라인',
        instructions: '제한시간 내 제출하세요.',
    });

    const headerTitle = useMemo(() => (isQuiz ? '퀴즈' : '시험'), [isQuiz]);
    const boardType = isQuiz ? 'QUIZ' : 'EXAM';

    const fetchList = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (isQuiz) {
                const res = await getProfessorExams({courseId, examType: 'QUIZ'});
                setItems(res?.data || []);
            } else {
                const types = ['MIDTERM', 'FINAL', 'REGULAR'];
                const results = await Promise.all(types.map((t) => getProfessorExams({courseId, examType: t})));
                const merged = results.flatMap((r) => r?.data || []);
                const byId = new Map();
                merged.forEach((x) => {
                    if (x?.id != null) byId.set(x.id, x);
                });
                setItems([...byId.values()]);
            }
        } catch (e) {
            setError(e?.message || '목록을 불러오는데 실패했습니다.');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [courseId, isQuiz]);

    useEffect(() => {
        if (!courseId) return;
        fetchList();
    }, [courseId, fetchList]);

    const openCreate = () => {
        setEditingId(null);
        setQuestions([]);
        setForm({
            title: '',
            content: '',
            type: isQuiz ? 'QUIZ' : 'MIDTERM',
            startAt: null,
            durationMinutes: 15,
            totalScore: 100,
            passingScore: 0,
            isOnline: true,
            location: '온라인',
            instructions: '제한시간 내 제출하세요.',
        });
        setDialogOpen(true);
    };

    const openEdit = async (examId) => {
        try {
            setLoading(true);
            setError(null);
            const res = await getProfessorExamDetail(examId);
            const d = res?.data;
            if (!d) throw new Error('상세 정보를 찾을 수 없습니다.');

            const q = normalizeQuestionData(d?.questionData).questions;
            setEditingId(examId);
            const normalized = q.map((item) => {
                const rawType = String(item?.type || 'MCQ').toUpperCase();
                const type = isQuiz ? 'MCQ' : rawType; // QUIZ는 정책상 MCQ만
                const base = {
                    id: item?.id || makeId(),
                    type: type === 'SUBJECTIVE' ? 'SUBJECTIVE' : 'MCQ',
                    prompt: item?.prompt || '',
                    points: Number(item?.points) || 10,
                };

                if (base.type === 'SUBJECTIVE') {
                    return base;
                }

                const choices =
                    Array.isArray(item?.choices) && item.choices.length >= 2 ? item.choices : ['', '', '', ''];
                let correctAnswerIndex = 0;
                if (typeof item?.correctChoiceIndex === 'number' && Number.isFinite(item.correctChoiceIndex)) {
                    correctAnswerIndex = item.correctChoiceIndex;
                } else if (typeof item?.correctAnswer === 'number' && Number.isFinite(item.correctAnswer)) {
                    correctAnswerIndex = item.correctAnswer;
                } else if (typeof item?.correctAnswer === 'string') {
                    const idx = choices.findIndex((c) => String(c) === item.correctAnswer);
                    correctAnswerIndex = idx >= 0 ? idx : 0;
                }
                if (correctAnswerIndex < 0 || correctAnswerIndex >= choices.length) correctAnswerIndex = 0;
                return {
                    ...base,
                    choices,
                    correctAnswerIndex,
                };
            });
            setQuestions(normalized);
            setForm({
                title: d.title || '',
                content: d.content || '',
                type: isQuiz ? 'QUIZ' : normalizeExamTypeForUi(d.type),
                startAt: toStartAtDate(d.startAt),
                durationMinutes: d.durationMinutes ?? 15,
                totalScore: d.totalScore ?? 100,
                passingScore: 0,
                isOnline: d.isOnline ?? true,
                location: d.location || (d.isOnline ? '온라인' : ''),
                instructions: d.instructions || '',
            });
            setDialogOpen(true);
        } catch (e) {
            setError(e?.message || '상세 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (examId) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            setLoading(true);
            setError(null);
            await deleteExam(examId);
            await fetchList();
        } catch (e) {
            setError(e?.message || '삭제에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const sumPoints = useMemo(() => {
        return questions.reduce((sum, q) => sum + (Number(q?.points) || 0), 0);
    }, [questions]);

    const buildPayload = () => {
        const list = questions.map((q) => {
            const type = String(q?.type || 'MCQ').toUpperCase();
            const id = q.id || makeId();
            const prompt = q.prompt || '';
            const points = Number(q.points) || 0;

            // QUIZ는 정책상 MCQ만 허용
            if (!isQuiz && type === 'SUBJECTIVE') {
                return {id, type: 'SUBJECTIVE', prompt, points};
            }

            const choices = Array.isArray(q.choices) ? q.choices : ['', '', '', ''];
            const correctChoiceIndex = Number.isFinite(Number(q.correctAnswerIndex)) ? Number(q.correctAnswerIndex) : 0;
            return {id, type: 'MCQ', prompt, choices, correctChoiceIndex, points};
        });

        const questionCount = list.length;
        const pointsSum = list.reduce((sum, q) => sum + (Number(q?.points) || 0), 0);

        return {
            courseId: Number(courseId),
            title: form.title?.trim(),
            content: form.content?.trim(),
            type: isQuiz ? 'QUIZ' : String(form.type || 'MIDTERM'),
            startAt: toApiDatetime(form.startAt),
            durationMinutes: Number(form.durationMinutes) || 0,
            totalScore: pointsSum || Number(form.totalScore) || 0,
            isOnline: !!form.isOnline,
            location: (form.location || '').trim() || (form.isOnline ? '온라인' : ''),
            instructions: (form.instructions || '').trim(),
            questionCount,
            passingScore: isQuiz ? 0 : Number(form.passingScore) || 0,
            questionData: {
                questions: list,
            },
        };
    };

    const handleSave = async () => {
        try {
            setError(null);
            if (!form.title.trim()) throw new Error('제목을 입력해주세요.');
            const normalizedStartAt = toApiDatetime(form.startAt);
            if (!normalizedStartAt) throw new Error('시작 시간을 입력해주세요.');
            if (!form.durationMinutes || Number(form.durationMinutes) < 1) throw new Error('제한시간(분)을 올바르게 입력해주세요.');
            if (!isQuiz && form.type === 'QUIZ') throw new Error('시험(EXAM)에서는 type=QUIZ를 사용할 수 없습니다.');

            // 문항 최소 검증 (폼 기준)
            const list = questions;
            if (!Array.isArray(list) || list.length === 0) throw new Error('문항을 최소 1개 이상 추가해주세요.');
            list.forEach((q, idx) => {
                if (!q?.id) throw new Error(`${idx + 1}번 문항 id가 없습니다.`);
                if (!q?.prompt) throw new Error(`${idx + 1}번 문항 문제 내용을 입력해주세요.`);
                if (!(Number(q?.points) > 0)) throw new Error(`${idx + 1}번 문항 배점을 1점 이상으로 입력해주세요.`);

                const qType = String(q?.type || 'MCQ').toUpperCase();
                if (isQuiz && qType !== 'MCQ') {
                    throw new Error(`${idx + 1}번 문항: 퀴즈는 객관식(MCQ)만 허용됩니다.`);
                }

                if (qType === 'MCQ') {
                    if (!Array.isArray(q?.choices) || q.choices.filter((c) => String(c).trim()).length < 2) {
                        throw new Error(`${idx + 1}번 객관식 문항의 보기를 최소 2개 이상 입력해주세요.`);
                    }
                    const ans = Number(q.correctAnswerIndex);
                    if (!Number.isFinite(ans)) throw new Error(`${idx + 1}번 문항 정답 번호가 올바르지 않습니다.`);
                    if (ans < 0 || ans >= q.choices.length) throw new Error(`${idx + 1}번 문항 정답 번호가 보기 범위를 벗어났습니다.`);
                } else if (qType === 'SUBJECTIVE') {
                    // 주관식은 보기/정답 인덱스 검증 없음
                } else {
                    throw new Error(`${idx + 1}번 문항: 지원하지 않는 문항 타입(${qType})입니다.`);
                }
            });

            const payload = buildPayload();
            if (!payload?.title) throw new Error('제목을 입력해주세요.');
            if (!payload?.startAt) throw new Error('시작 시간을 입력해주세요.');

            setLoading(true);
            if (editingId) {
                await updateExam(editingId, payload);
            } else {
                await createExam(boardType, payload);
            }
            setDialogOpen(false);
            await fetchList();
        } catch (e) {
            setError(e?.message || '저장에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Paper sx={{p: 3, mb: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2}}>
                    <Typography variant="h6" sx={{fontWeight: 800}}>
                        {headerTitle} 관리
                    </Typography>
                    <Box sx={{display: 'flex', gap: 1}}>
                        <Button variant="outlined" startIcon={<RefreshIcon/>} onClick={fetchList} disabled={loading}>
                            새로고침
                        </Button>
                        <Button variant="contained" startIcon={<AddIcon/>} onClick={openCreate} disabled={loading}>
                            {headerTitle} 등록
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{mt: 2}} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
            </Paper>

            <Paper sx={{p: 2}}>
                {loading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', py: 3}}>
                        <CircularProgress size={22}/>
                    </Box>
                ) : items.length === 0 ? (
                    <Alert severity="info">등록된 {headerTitle}가 없습니다.</Alert>
                ) : (
                    <List>
                        {items.map((x) => (
                            <ListItem
                                key={x.id}
                                divider
                                secondaryAction={
                                    <Box sx={{display: 'flex', gap: 1}}>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => {
                                                setAttemptsExam(x);
                                                setAttemptsOpen(true);
                                            }}
                                            title="응시/채점"
                                        >
                                            <FactCheckIcon fontSize="small"/>
                                        </IconButton>
                                        <IconButton size="small" onClick={() => openEdit(x.id)} title="수정">
                                            <EditIcon fontSize="small"/>
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(x.id)}
                                                    title="삭제">
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                                                {x.title || `${headerTitle} #${x.id}`}
                                            </Typography>
                                            <Chip size="small"
                                                  label={formatTypeLabel(x.type || (isQuiz ? 'QUIZ' : 'MIDTERM'))}/>
                                        </Box>
                                    }
                                    secondary={`${formatDateTimeDot(x.startAt)} ~ ${formatDateTimeDot(x.endAt)} · ${x.durationMinutes ?? '-'}분 · ${x.totalScore ?? '-'}점`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>

            <Dialog open={dialogOpen} onClose={() => !loading && setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editingId ? `${headerTitle} 수정` : `${headerTitle} 등록`}</DialogTitle>
                <DialogContent>
                    <Box sx={{pt: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
                        <TextField
                            fullWidth
                            label="제목"
                            value={form.title}
                            onChange={(e) => setForm((p) => ({...p, title: e.target.value}))}
                        />

                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            label="설명"
                            value={form.content}
                            onChange={(e) => setForm((p) => ({...p, content: e.target.value}))}
                        />

                        {!isQuiz && (
                            <TextField
                                select
                                fullWidth
                                label="시험 유형"
                                value={form.type}
                                onChange={(e) => setForm((p) => ({...p, type: e.target.value}))}
                            >
                                <MenuItem value="MIDTERM">중간고사</MenuItem>
                                <MenuItem value="FINAL">기말고사</MenuItem>
                            </TextField>
                        )}

                        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                                <DateTimePicker
                                    label="시작 시간"
                                    value={form.startAt}
                                    onChange={(v) => setForm((p) => ({...p, startAt: v}))}
                                    ampm={false}
                                    format="yyyy. MM. dd. HH:mm"
                                    slotProps={{
                                        textField: {
                                            sx: {minWidth: 260},
                                            InputLabelProps: {shrink: true},
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                            <TextField
                                type="number"
                                label="제한시간(분)"
                                value={form.durationMinutes}
                                onChange={(e) => setForm((p) => ({...p, durationMinutes: Number(e.target.value)}))}
                                inputProps={{min: 1}}
                                sx={{width: 160}}
                            />
                        </Box>

                        <Divider/>

                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2}}>
                            <Box>
                                <Typography variant="subtitle1" sx={{fontWeight: 800}}>
                                    문항
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    총 {questions.length}문항 · 합계 {sumPoints}점
                                </Typography>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<AddIcon/>}
                                    onClick={() => {
                                        const id = makeId();
                                        setQuestions((prev) => [
                                            ...prev,
                                            {
                                                id,
                                                type: 'MCQ',
                                                prompt: '',
                                                choices: ['', '', '', ''],
                                                correctAnswerIndex: 0,
                                                points: 10,
                                            },
                                        ]);
                                    }}
                                >
                                    객관식 추가
                                </Button>
                                {!isQuiz && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<AddIcon/>}
                                        onClick={() => {
                                            const id = makeId();
                                            setQuestions((prev) => [
                                                ...prev,
                                                {
                                                    id,
                                                    type: 'SUBJECTIVE',
                                                    prompt: '',
                                                    points: 10,
                                                },
                                            ]);
                                        }}
                                    >
                                        주관식 추가
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        {questions.length === 0 ? (
                            <Alert severity="info">문항을 추가해주세요.</Alert>
                        ) : (
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                {questions.map((q, idx) => {
                                    const qType = String(q?.type || 'MCQ').toUpperCase();
                                    const qTypeLabel = qType === 'SUBJECTIVE' ? '주관식' : '객관식';
                                    return (
                                        <Paper key={q.id || idx} variant="outlined" sx={{p: 2}}>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: 2
                                            }}>
                                                <Typography variant="subtitle2" sx={{fontWeight: 800}}>
                                                    {idx + 1}번 · {qTypeLabel}
                                                </Typography>
                                                <Box sx={{display: 'flex', gap: 1}}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => {
                                                            if (idx === 0) return;
                                                            setQuestions((prev) => {
                                                                const next = [...prev];
                                                                const [item] = next.splice(idx, 1);
                                                                next.splice(idx - 1, 0, item);
                                                                return next;
                                                            });
                                                        }}
                                                        disabled={idx === 0}
                                                    >
                                                        위로
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => {
                                                            setQuestions((prev) => {
                                                                const next = [...prev];
                                                                const [item] = next.splice(idx, 1);
                                                                next.splice(idx + 1, 0, item);
                                                                return next;
                                                            });
                                                        }}
                                                        disabled={idx === questions.length - 1}
                                                    >
                                                        아래로
                                                    </Button>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== idx))}
                                                        title="삭제"
                                                    >
                                                        <DeleteIcon fontSize="small"/>
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            <Box sx={{mt: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                                                {!isQuiz && (
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        label="문항 유형"
                                                        value={qType}
                                                        onChange={(e) => {
                                                            const nextType = String(e.target.value || 'MCQ').toUpperCase();
                                                            setQuestions((prev) =>
                                                                prev.map((x, i) => {
                                                                    if (i !== idx) return x;
                                                                    if (nextType === 'SUBJECTIVE') {
                                                                        return {...x, type: 'SUBJECTIVE'};
                                                                    }
                                                                    // MCQ로 전환 시 기본값 보정
                                                                    const nextChoices =
                                                                        Array.isArray(x.choices) && x.choices.length >= 2 ? x.choices : ['', '', '', ''];
                                                                    const nextCorrect = Math.min(
                                                                        Math.max(0, Number(x.correctAnswerIndex) || 0),
                                                                        Math.max(0, nextChoices.length - 1)
                                                                    );
                                                                    return {
                                                                        ...x,
                                                                        type: 'MCQ',
                                                                        choices: nextChoices,
                                                                        correctAnswerIndex: nextCorrect
                                                                    };
                                                                })
                                                            );
                                                        }}
                                                    >
                                                        <MenuItem value="MCQ">객관식</MenuItem>
                                                        <MenuItem value="SUBJECTIVE">주관식</MenuItem>
                                                    </TextField>
                                                )}

                                                <TextField
                                                    fullWidth
                                                    label="문제"
                                                    value={q.prompt || ''}
                                                    onChange={(e) =>
                                                        setQuestions((prev) =>
                                                            prev.map((x, i) => (i === idx ? {
                                                                ...x,
                                                                prompt: e.target.value
                                                            } : x))
                                                        )
                                                    }
                                                />

                                                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                                                    <TextField
                                                        type="number"
                                                        label="배점"
                                                        value={q.points ?? 0}
                                                        onChange={(e) =>
                                                            setQuestions((prev) =>
                                                                prev.map((x, i) => (i === idx ? {
                                                                    ...x,
                                                                    points: Number(e.target.value)
                                                                } : x))
                                                            )
                                                        }
                                                        inputProps={{min: 1}}
                                                        sx={{width: 140}}
                                                    />
                                                </Box>

                                                {qType === 'MCQ' && (
                                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            보기
                                                        </Typography>
                                                        {(q.choices || []).map((c, cIdx) => (
                                                            <TextField
                                                                key={`${q.id}-choice-${cIdx}`}
                                                                fullWidth
                                                                label={`보기 ${cIdx + 1}`}
                                                                value={c}
                                                                onChange={(e) =>
                                                                    setQuestions((prev) =>
                                                                        prev.map((x, i) => {
                                                                            if (i !== idx) return x;
                                                                            const nextChoices = Array.isArray(x.choices) ? [...x.choices] : [];
                                                                            nextChoices[cIdx] = e.target.value;
                                                                            return {...x, choices: nextChoices};
                                                                        })
                                                                    )
                                                                }
                                                            />
                                                        ))}
                                                        <Box sx={{display: 'flex', gap: 1, justifyContent: 'flex-end'}}>
                                                            <Button
                                                                size="small"
                                                                onClick={() =>
                                                                    setQuestions((prev) =>
                                                                        prev.map((x, i) => {
                                                                            if (i !== idx) return x;
                                                                            const nextChoices = Array.isArray(x.choices) ? [...x.choices, ''] : [''];
                                                                            return {...x, choices: nextChoices};
                                                                        })
                                                                    )
                                                                }
                                                            >
                                                                보기 추가
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                color="error"
                                                                onClick={() =>
                                                                    setQuestions((prev) =>
                                                                        prev.map((x, i) => {
                                                                            if (i !== idx) return x;
                                                                            const nextChoices = Array.isArray(x.choices) ? x.choices.slice(0, -1) : [];
                                                                            const nextCorrect = Math.min(
                                                                                Math.max(0, Number(x.correctAnswerIndex) || 0),
                                                                                Math.max(0, nextChoices.length - 1)
                                                                            );
                                                                            return {
                                                                                ...x,
                                                                                choices: nextChoices,
                                                                                correctAnswerIndex: nextCorrect
                                                                            };
                                                                        })
                                                                    )
                                                                }
                                                                disabled={!Array.isArray(q.choices) || q.choices.length <= 2}
                                                            >
                                                                보기 삭제
                                                            </Button>
                                                        </Box>

                                                        <TextField
                                                            select
                                                            fullWidth
                                                            label="정답(보기 번호)"
                                                            value={(Number.isFinite(Number(q.correctAnswerIndex)) ? Number(q.correctAnswerIndex) : 0) + 1}
                                                            onChange={(e) =>
                                                                setQuestions((prev) =>
                                                                    prev.map((x, i) =>
                                                                        i === idx ? {
                                                                            ...x,
                                                                            correctAnswerIndex: Number(e.target.value) - 1
                                                                        } : x
                                                                    )
                                                                )
                                                            }
                                                        >
                                                            {(q.choices || []).map((c, cIdx) => (
                                                                <MenuItem key={`${q.id}-ans-${cIdx}`} value={cIdx + 1}>
                                                                    {cIdx + 1}: {String(c)}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Paper>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={loading}>
                        취소
                    </Button>
                    <Button variant="contained" onClick={handleSave} disabled={loading}>
                        {loading ? '저장 중...' : '저장'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ExamAttemptsDialog
                open={attemptsOpen}
                onClose={() => setAttemptsOpen(false)}
                examId={attemptsExam?.id}
                examTitle={attemptsExam?.title}
                examType={attemptsExam?.type}
                totalScore={attemptsExam?.totalScore}
            />
        </Box>
    );
}


