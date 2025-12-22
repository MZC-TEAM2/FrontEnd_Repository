/**
 * CourseDetail 페이지 (학생 강의실 - 읽기 전용)
 *
 * 기존 더미 데이터 기반 화면을 제거하고,
 * - 강의 기본 정보: GET /api/v1/courses/{courseId} (fallback: /courses/{courseId})
 * - 주차/콘텐츠: GET /api/v1/courses/{courseId}/weeks (fallback: /courses/{courseId}/weeks)
 * 를 통해 실제 데이터를 표시합니다.
 *
 * NOTE: 공지/과제/퀴즈/시험/성적은 스펙은 있으나, 본 화면에서는 "보기 전용" placeholder로 둡니다.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tab,
  Tabs,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import useStudentCourseDetail from '../domains/course/hooks/useStudentCourseDetail';
import { formatScheduleTime } from '../domains/course/utils/scheduleUtils';
import authService from '../services/authService';
import attendanceService from '../services/attendanceService';
import LinearProgress from '@mui/material/LinearProgress';
import { getMyExamResult, getStudentExams } from '../api/assessmentApi';
import { formatDateTimeDash, formatDateTimeDot } from '../utils/dateUtils';
import { getExamLocalResult, onExamAttemptStorageUpdated, setExamLocalResult } from '../utils/examAttemptStorage';
import { getCurrentGradePublishPeriod } from '../api/gradeApi';
import { getCurrentAcademicTerm } from '../api/academicTermApi';
import { getStudentGrades } from '../api/gradeApi';
import AssignmentBoard from '../domains/course/components/assignment/AssignmentBoard';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // URL에서 tab 파라미터 읽어서 초기화 (기본값 0)
  const tabFromUrl = parseInt(searchParams.get('tab') || '0', 10);
  const [currentTab, setCurrentTab] = useState(tabFromUrl);
  const [expandedWeek, setExpandedWeek] = useState(false);
  const [isGradePublishActive, setIsGradePublishActive] = useState(false);
  const [myGradeLoading, setMyGradeLoading] = useState(false);
  const [myGradeError, setMyGradeError] = useState(null);
  const [myGradeRow, setMyGradeRow] = useState(null);
  const [myGradeReloadTick, setMyGradeReloadTick] = useState(0);

  const { loading, error, courseMeta, detail, weeks, weeksNotFound, attendance, reload } = useStudentCourseDetail(courseId);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState(null);
  const [quizList, setQuizList] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState(null);
  const [examList, setExamList] = useState([]);
  const [_examStorageTick, setExamStorageTick] = useState(0);
  const quizReqRef = useRef(0);
  const examReqRef = useRef(0);

  useEffect(() => {
    return onExamAttemptStorageUpdated(() => setExamStorageTick((v) => v + 1));
  }, []);

  // 성적 탭 노출: 성적공개기간(GRADE_PUBLISH)일 때만
  useEffect(() => {
    let cancelled = false;
    const fetchGradePublishPeriod = async () => {
      try {
        const res = await getCurrentGradePublishPeriod();
        const active = !!(res?.success && res?.data?.currentPeriod);
        if (!cancelled) setIsGradePublishActive(active);
      } catch {
        // 조회 실패/미구현 시 보수적으로 숨김
        if (!cancelled) setIsGradePublishActive(false);
      }
    };
    fetchGradePublishPeriod();
    return () => {
      cancelled = true;
    };
  }, []);

  // 성적 탭이 숨겨졌는데 선택돼 있으면 탭을 안전하게 초기화
  useEffect(() => {
    if (!isGradePublishActive && currentTab === 5) {
      setCurrentTab(0);
    }
  }, [isGradePublishActive, currentTab]);

  // 성적 탭 진입 시 내 성적 조회 (현재 학기 기준, 해당 courseId만 필터)
  useEffect(() => {
    let cancelled = false;
    const fetchMyGrade = async () => {
      if (!isGradePublishActive) return;
      if (currentTab !== 5) return;
      if (!courseId) return;
      try {
        setMyGradeLoading(true);
        setMyGradeError(null);
        setMyGradeRow(null);

        const term = await getCurrentAcademicTerm();
        if (!term?.id) {
          if (!cancelled) setMyGradeError('현재 학기를 확인할 수 없습니다.');
          return;
        }

        const res = await getStudentGrades(term.id);
        const list = Array.isArray(res?.data) ? res.data : [];
        const row = list.find((x) => String(x?.courseId) === String(courseId)) || null;
        if (!cancelled) setMyGradeRow(row);
      } catch (e) {
        if (!cancelled) setMyGradeError(e?.message || '성적 조회에 실패했습니다.');
      } finally {
        if (!cancelled) setMyGradeLoading(false);
      }
    };

    fetchMyGrade();
    return () => {
      cancelled = true;
    };
  }, [currentTab, courseId, isGradePublishActive, myGradeReloadTick]);

  const fetchQuizzes = useCallback(async () => {
    if (!courseId) return;
    const reqId = ++quizReqRef.current;
    try {
      setQuizLoading(true);
      setQuizError(null);
      const res = await getStudentExams({ courseId, examType: 'QUIZ' });
      if (reqId !== quizReqRef.current) return;
      const list = res?.data || [];
      setQuizList(list);

      // 과거 응시 퀴즈 점수 backfill: 로컬에 없으면 서버에서 내 결과를 조회해서 캐시
      try {
        const targets = list
          .map((x) => x?.id)
          .filter((id) => id != null && id !== '')
          .filter((id) => !getExamLocalResult(id));
        if (targets.length > 0) {
          const results = await Promise.allSettled(targets.map((id) => getMyExamResult(id)));
          if (reqId === quizReqRef.current) {
            results.forEach((r, i) => {
              if (r.status !== 'fulfilled') return;
              const d = r.value?.data;
              if (!d) return;
              const examId = targets[i];
              setExamLocalResult(examId, { ...d, examId, examType: 'QUIZ', cachedAt: new Date().toISOString() });
            });
          }
        }
      } catch {
        // ignore (백엔드 미구현/404 등)
      }
    } catch (e) {
      if (reqId !== quizReqRef.current) return;
      setQuizError(e?.message || '퀴즈 목록을 불러오는데 실패했습니다.');
      setQuizList([]);
    } finally {
      if (reqId === quizReqRef.current) setQuizLoading(false);
    }
  }, [courseId]);

  const fetchExams = useCallback(async () => {
    if (!courseId) return;
    const reqId = ++examReqRef.current;
    try {
      setExamLoading(true);
      setExamError(null);
      // 명세상 시험 유형이 여러 개라, 학생 "시험" 탭은 QUIZ 제외 전부 합쳐서 표시
      const types = ['MIDTERM', 'FINAL', 'REGULAR'];
      const results = await Promise.all(types.map((t) => getStudentExams({ courseId, examType: t })));
      if (reqId !== examReqRef.current) return;
      const merged = results.flatMap((r) => r?.data || []);
      const byId = new Map();
      merged.forEach((x) => {
        if (x?.id != null) byId.set(x.id, x);
      });
      const list = [...byId.values()];
      setExamList(list);

      // 과거 시험 점수 backfill: 로컬에 없으면 서버에서 내 결과를 조회해서 캐시
      try {
        const targets = list
          .map((x) => x?.id)
          .filter((id) => id != null && id !== '')
          .filter((id) => !getExamLocalResult(id));
        if (targets.length > 0) {
          const settled = await Promise.allSettled(targets.map((id) => getMyExamResult(id)));
          if (reqId === examReqRef.current) {
            settled.forEach((r, i) => {
              if (r.status !== 'fulfilled') return;
              const d = r.value?.data;
              if (!d) return;
              const examId = targets[i];
              // examType은 목록을 다시 보면 알 수 있지만, 최소 캐시는 저장
              setExamLocalResult(examId, { ...d, examId, cachedAt: new Date().toISOString() });
            });
          }
        }
      } catch {
        // ignore
      }
    } catch (e) {
      if (reqId !== examReqRef.current) return;
      setExamError(e?.message || '시험 목록을 불러오는데 실패했습니다.');
      setExamList([]);
    } finally {
      if (reqId === examReqRef.current) setExamLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    // courseId 변경 시 초기 로드
    fetchQuizzes();
    fetchExams();
  }, [courseId, fetchExams, fetchQuizzes]);

  useEffect(() => {
    // 탭을 열 때 최신화
    if (currentTab === 3) fetchQuizzes();
    if (currentTab === 4) fetchExams();
  }, [currentTab, fetchExams, fetchQuizzes]);

  // 출석 데이터에서 주차별 출석 정보를 맵으로 변환
  const weekAttendanceMap = useMemo(() => {
    if (!attendance?.weekAttendances) return {};
    return attendance.weekAttendances.reduce((acc, week) => {
      acc[week.weekNumber] = week;
      return acc;
    }, {});
  }, [attendance]);

  // 출석 데이터에서 콘텐츠별 출석 정보를 맵으로 변환 (contentId -> isCompleted)
  const contentAttendanceMap = useMemo(() => {
    if (!attendance?.weekAttendances) return {};
    const map = {};
    attendance.weekAttendances.forEach((week) => {
      if (week.contents) {
        week.contents.forEach((content) => {
          map[content.contentId] = {
            isCompleted: content.isCompleted,
            completedAt: content.completedAt,
          };
        });
      }
    });
    return map;
  }, [attendance]);

  // 탭 변경 핸들러 - state와 URL 모두 업데이트
  const handleTabChange = (e, newValue) => {
    setCurrentTab(newValue);
    setSearchParams({ tab: newValue });
  };

  const headerTitle = useMemo(() => {
    if (courseMeta) return `${courseMeta.subjectCode} - ${courseMeta.subjectName}`;
    if (detail) return `${detail.courseCode} - ${detail.courseName}`;
    return '과목';
  }, [courseMeta, detail]);

  const description = detail?.description || '';

  const handleOpenContent = (content) => {
    const url = content?.contentUrl;
    if (!url) return;

    // VIDEO 타입일 때 userId 파라미터 추가
    if (content.contentType === 'VIDEO') {
      const user = authService.getCurrentUser();
      const userId = user?.userId || user?.userNumber || '';
      const separator = url.includes('?') ? '&' : '?';
      const videoUrl = `${url}${separator}userId=${userId}`;
      window.open(videoUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleWeekExpand = (weekKey) => (_event, isExpanded) => {
    setExpandedWeek(isExpanded ? weekKey : false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
            {headerTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          뒤로
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={reload}>
              다시 시도
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={22} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip icon={<PersonIcon />} label={courseMeta?.professor || '-'} />
            <Chip icon={<MenuBookIcon />} label={`${courseMeta?.credits ?? 0}학점`} />
            <Chip
              icon={<GroupIcon />}
              label={`정원 ${courseMeta?.currentStudents ?? '-'} / ${courseMeta?.maxStudents ?? '-'}`}
            />
            <Chip
              label={
                courseMeta?.schedule?.length
                  ? courseMeta.schedule.map(formatScheduleTime).join(', ')
                  : '시간표 정보 없음'
              }
            />
          </Box>
        )}
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<PlayCircleOutlineIcon />} label="주차별 강의" iconPosition="start" />
          <Tab icon={<NotificationsIcon />} label="공지사항" iconPosition="start" />
          <Tab icon={<AssignmentIcon />} label="과제" iconPosition="start" />
          <Tab icon={<QuizIcon />} label="퀴즈" iconPosition="start" />
          <Tab icon={<FactCheckIcon />} label="시험" iconPosition="start" />
          {isGradePublishActive && (
            <Tab icon={<AssessmentIcon />} label="성적" iconPosition="start" />
          )}
        </Tabs>
      </Paper>

      <TabPanel value={currentTab} index={0}>
        {/* 출석률 요약 카드 */}
        {attendance && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <EventAvailableIcon sx={{ fontSize: 40, color: `${attendanceService.getAttendanceColor(attendance.attendanceRate)}.main` }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  내 출석 현황
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {attendance.courseName}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: `${attendanceService.getAttendanceColor(attendance.attendanceRate)}.main` }}>
                  {attendanceService.formatAttendanceRate(attendance.attendanceRate)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {attendance.completedWeeks} / {attendance.totalWeeks} 주차 완료
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={attendance.attendanceRate || 0}
              color={attendanceService.getAttendanceColor(attendance.attendanceRate)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Paper>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : weeksNotFound ? (
          <Alert severity="warning">
            주차/콘텐츠 API가 아직 준비되지 않았거나(404), 백엔드 경로가 스펙과 다를 수 있어요. 최신 명세(12.1)는
            `GET /api/v1/courses/{'{courseId}'}/weeks`(학생 강의실) 입니다.
          </Alert>
        ) : weeks.length === 0 ? (
          <Alert severity="info">등록된 주차/콘텐츠가 없습니다.</Alert>
        ) : (
          weeks.map((week) => {
            const weekKey = `week-${week.weekNumber}`;
            const contents = week.contents || [];
            const completedCount = contents.filter((c) => c.progress?.isCompleted).length;
            const weekAttendance = weekAttendanceMap[week.weekNumber];
            const isWeekCompleted = weekAttendance?.isCompleted || completedCount === contents.length && contents.length > 0;
            return (
              <Accordion
                key={weekKey}
                expanded={expandedWeek === weekKey}
                onChange={handleWeekExpand(weekKey)}
                sx={{ mb: 1, '&:before': { display: 'none' } }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isWeekCompleted ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <RadioButtonUncheckedIcon color="disabled" />
                      )}
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {week.weekTitle || `${week.weekNumber}주차`}
                      </Typography>
                      {isWeekCompleted && (
                        <Chip label="출석완료" size="small" color="success" variant="outlined" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {completedCount} / {contents.length}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {contents.length === 0 ? (
                    <Alert severity="info">등록된 콘텐츠가 없습니다.</Alert>
                  ) : (
                    <List>
                      {contents.map((content, idx) => {
                        // 출석 API 데이터에서 완료 여부 확인 (fallback: content.progress)
                        const attendanceInfo = contentAttendanceMap[content.id];
                        const isCompleted = attendanceInfo?.isCompleted ?? !!content.progress?.isCompleted;
                        const isVideo = content.contentType === 'VIDEO';
                        return (
                          <React.Fragment key={content.id}>
                            <ListItem
                              sx={{
                                borderRadius: 1,
                                mb: 1,
                                bgcolor: isCompleted ? 'success.lighter' : 'background.paper',
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                {isCompleted ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon />}
                              </ListItemIcon>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                {isVideo ? <PlayCircleOutlineIcon /> : <AttachFileIcon />}
                              </ListItemIcon>
                              <ListItemText
                                primary={content.title}
                                secondary={content.duration || content.contentType || '자료'}
                              />
                              {isCompleted && (
                                <Chip label="출석인정" size="small" color="success" sx={{ mr: 1 }} />
                              )}
                              <IconButton
                                edge="end"
                                onClick={() => handleOpenContent(content)}
                                title="보기"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </ListItem>
                            {idx < contents.length - 1 && <Divider />}
                          </React.Fragment>
                        );
                      })}
                    </List>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </TabPanel>

      {/* 공지사항 */}
      <TabPanel value={currentTab} index={1}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            공지사항
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            (보기 전용) API 연동 예정
          </Typography>
        </Paper>
      </TabPanel>

      {/* 과제 */}
      <TabPanel value={currentTab} index={2}>
        <AssignmentBoard courseId={courseId} isEmbedded={true} />
      </TabPanel>

      {[
        { index: 3, icon: <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />, title: '퀴즈' },
        { index: 4, icon: <FactCheckIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />, title: '시험' },
        { index: 5, icon: <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />, title: '성적' },
      ].map((t) => (
        <TabPanel key={t.index} value={currentTab} index={t.index}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            {t.icon}
            <Typography variant="h6" color="text.secondary">
              {t.title}
            </Typography>
            <Button size="small" variant="outlined" onClick={fetchQuizzes} disabled={quizLoading}>
              새로고침
            </Button>
          </Box>

          {quizError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {quizError}
            </Alert>
          )}

          {quizLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={22} />
            </Box>
          ) : quizList.length === 0 ? (
            <Alert severity="info">현재 응시 가능한 퀴즈가 없습니다.</Alert>
          ) : (
            <List>
              {quizList.map((q) => (
                <ListItem key={q.id} disablePadding divider>
                  <ListItemButton onClick={() => navigate(`/course/${courseId}/exams/${q.id}`)}>
                    <ListItemText
                      primary={q.title || `퀴즈 #${q.id}`}
                      secondary={`${formatDateTimeDot(q.startAt)} ~ ${formatDateTimeDot(q.endAt)} · 제한시간 ${q.durationMinutes ?? '-'}분 · ${q.totalScore ?? '-'}점${
                        (() => {
                          const r = getExamLocalResult(q.id);
                          if (!r) return '';
                          if (r?.score != null) return ` · 내 점수 ${r.score}점`;
                          return ' · 응시 완료';
                        })()
                      }`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </TabPanel>

      {/* 시험 */}
      <TabPanel value={currentTab} index={4}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              시험
            </Typography>
            <Button size="small" variant="outlined" onClick={fetchExams} disabled={examLoading}>
              새로고침
            </Button>
          </Box>

          {examError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {examError}
            </Alert>
          )}

          {examLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={22} />
            </Box>
          ) : examList.length === 0 ? (
            <Alert severity="info">현재 조회 가능한 시험이 없습니다.</Alert>
          ) : (
            <List>
              {examList.map((x) => (
                <ListItem key={x.id} disablePadding divider>
                  <ListItemButton onClick={() => navigate(`/course/${courseId}/exams/${x.id}`)}>
                    <ListItemText
                      primary={x.title || `시험 #${x.id}`}
                      secondary={`${formatDateTimeDot(x.startAt)} ~ ${formatDateTimeDot(x.endAt)} · 제한시간 ${x.durationMinutes ?? '-'}분 · ${x.totalScore ?? '-'}점 · ${x.type || '-'}${
                        (() => {
                          const r = getExamLocalResult(x.id);
                          if (!r) return '';
                          if (r?.score != null) return ` · 내 점수 ${r.score}점`;
                          return ' · 응시 완료(채점중)';
                        })()
                      }`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </TabPanel>

      {/* 성적 */}
      {isGradePublishActive && (
        <TabPanel value={currentTab} index={5}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                내 성적
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setMyGradeReloadTick((x) => x + 1)}
                disabled={myGradeLoading}
              >
                새로고침
              </Button>
            </Box>

            {myGradeLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">
                  성적을 불러오는 중입니다...
                </Typography>
              </Box>
            ) : myGradeError ? (
              <Alert severity="warning">{myGradeError}</Alert>
            ) : !myGradeRow ? (
              <Alert severity="info">공개된 성적이 없습니다.</Alert>
            ) : (
              <Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label={`상태: ${myGradeRow.status}`} variant="outlined" />
                  <Chip label={`최종: ${myGradeRow.finalScore ?? '-'}`} color="primary" />
                  <Chip label={`등급: ${myGradeRow.finalGrade ?? '-'}`} color="success" />
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>중간</TableCell>
                        <TableCell align="right">{myGradeRow.midtermScore ?? '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>기말</TableCell>
                        <TableCell align="right">{myGradeRow.finalExamScore ?? '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>퀴즈</TableCell>
                        <TableCell align="right">{myGradeRow.quizScore ?? '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>과제</TableCell>
                        <TableCell align="right">{myGradeRow.assignmentScore ?? '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>출석</TableCell>
                        <TableCell align="right">{myGradeRow.attendanceScore ?? '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>공개일</TableCell>
                        <TableCell align="right">
                          {formatDateTimeDash(myGradeRow.publishedAt) ?? '-'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </TabPanel>
      )}
    </Container>
  );
}


