/**
 * 교수 강의 상세 관리 페이지
 * 
 * 주요 기능:
 * - 강의 기본 정보 표시 및 수정
 * - 주차 관리 (생성, 수정, 삭제)
 * - 콘텐츠 관리
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarMonthIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Quiz as QuizIcon,
  FactCheck as FactCheckIcon,
  EventAvailable as EventAvailableIcon,
} from '@mui/icons-material';

// 컴포넌트
import WeekManagement from '../domains/professor/components/WeekManagement';
import CourseCreateDialog from '../domains/professor/components/CourseCreateDialog';
import ExamManagement from '../domains/professor/components/ExamManagement';
import QuizManagement from '../domains/professor/components/QuizManagement';
import AttendanceManagement from '../components/attendance/AttendanceManagement';

// API
import {
  getCourseDetailForProfessor,
  updateCourse,
  getWeeksForProfessor,
  createWeek,
  updateWeek,
  deleteWeek,
  createContent,
  deleteContent,
  getCurrentCourseRegistrationPeriod,
} from '../api/professorApi';

import {
  getCurrentGradeCalculationPeriod,
  getCurrentGradePublishPeriod,
  getCourseGradesForProfessor,
  calculateGradesForCourse,
  publishGradesForCourse,
} from '../api/gradeApi';

const termLabel = (t) => {
  if (!t) return '-';
  const map = { '1': '1학기', '2': '2학기', SUMMER: '하계', WINTER: '동계' };
  return `${t.year}년 ${map[t.termType] ?? t.termType}`;
};

const ProfessorCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [weeks, setWeeks] = useState([]);
  const [enrollmentPeriods, setEnrollmentPeriods] = useState([]);

  // 성적 관리(탭) 상태
  const [gradePeriodLoading, setGradePeriodLoading] = useState(false);
  const [gradePeriod, setGradePeriod] = useState(null);
  const [gradePeriodError, setGradePeriodError] = useState(null);
  const [gradePublishPeriod, setGradePublishPeriod] = useState(null);
  const [gradePublishPeriodError, setGradePublishPeriodError] = useState(null);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [grades, setGrades] = useState([]);
  const [gradesError, setGradesError] = useState(null);

  const [publishLoading, setPublishLoading] = useState(false);
  const [publishMessage, setPublishMessage] = useState(null);
  const [publishError, setPublishError] = useState(null);

  const [calcLoading, setCalcLoading] = useState(false);
  const [calcMessage, setCalcMessage] = useState(null);
  const [calcError, setCalcError] = useState(null);

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getCourseDetailForProfessor(courseId);

      
      if (response && response.success) {

        setCourse(response.data);
      } else {

        setError('강의 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('강의 정보를 불러오는데 실패했습니다.', err.message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const fetchWeeks = useCallback(async () => {
    
    try {
      const response = await getWeeksForProfessor(courseId);
      
      if (response.success) {
        setWeeks(response.data || []);
      }
    } catch (err) {
      console.error('❌ 주차 목록 조회 실패:', err);
    }
    
  }, [courseId]);

  const fetchEnrollmentPeriods = useCallback(async () => {
    try {
      const response = await getCurrentCourseRegistrationPeriod();
      if (response && response.success && response.data?.currentPeriod) {
        setEnrollmentPeriods([response.data.currentPeriod]);
      } else {
        setEnrollmentPeriods([]);
      }
    } catch (err) {
      console.error('강의 등록 기간 조회 실패:', err);
      setEnrollmentPeriods([]);
    }
  }, []);

  useEffect(() => {
    fetchCourse();
    fetchWeeks();
    fetchEnrollmentPeriods();
  }, [fetchCourse, fetchWeeks, fetchEnrollmentPeriods]);

  const fetchGradePeriod = useCallback(async () => {
    setGradePeriodLoading(true);
    setGradePeriodError(null);
    setGradePublishPeriodError(null);
    try {
      const [calcRes, publishRes] = await Promise.allSettled([
        getCurrentGradeCalculationPeriod(),
        getCurrentGradePublishPeriod(),
      ]);

      if (calcRes.status === 'fulfilled') {
        const currentPeriod = calcRes.value?.success ? calcRes.value?.data?.currentPeriod : null;
        setGradePeriod(currentPeriod || null);
      } else {
        setGradePeriod(null);
        setGradePeriodError(calcRes.reason);
      }

      if (publishRes.status === 'fulfilled') {
        const currentPeriod = publishRes.value?.success ? publishRes.value?.data?.currentPeriod : null;
        setGradePublishPeriod(currentPeriod || null);
      } else {
        setGradePublishPeriod(null);
        setGradePublishPeriodError(publishRes.reason);
      }
    } catch (e) {
      setGradePeriodError(e);
      setGradePeriod(null);
      setGradePublishPeriodError(e);
      setGradePublishPeriod(null);
    } finally {
      setGradePeriodLoading(false);
    }
  }, []);

  const fetchCourseGrades = useCallback(async () => {
    if (!courseId) return;
    setGradesLoading(true);
    setGradesError(null);
    try {
      // 교수 화면에서는 항상 전체(ALL) 성적을 조회
      const res = await getCourseGradesForProfessor(courseId, 'ALL');
      setGrades(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setGradesError(e);
      setGrades([]);
    } finally {
      setGradesLoading(false);
    }
  }, [courseId]);

  const handlePublishGrades = useCallback(async () => {
    if (!courseId) return;
    setPublishLoading(true);
    setPublishMessage(null);
    setPublishError(null);
    try {
      const res = await publishGradesForCourse(courseId);
      setPublishMessage(res?.message || '성적 공개 처리를 실행했습니다. (강의 단위)');
      await fetchCourseGrades();
    } catch (e) {
      setPublishError(e);
    } finally {
      setPublishLoading(false);
    }
  }, [courseId, fetchCourseGrades]);

  const handleCalculateGrades = useCallback(async () => {
    if (!courseId) return;
    setCalcLoading(true);
    setCalcMessage(null);
    setCalcError(null);
    try {
      const res = await calculateGradesForCourse(courseId);
      setCalcMessage(res?.message || '성적 산출 처리를 실행했습니다. (강의 단위)');
      await fetchCourseGrades();
    } catch (e) {
      setCalcError(e);
    } finally {
      setCalcLoading(false);
    }
  }, [courseId, fetchCourseGrades]);

  // 성적 탭을 열었을 때만 기간/성적을 가져옴
  useEffect(() => {
    if (currentTab !== 6) return;
    fetchGradePeriod();
    fetchCourseGrades();
  }, [currentTab, fetchGradePeriod, fetchCourseGrades]);

  const isGradeCalculationActive = !!gradePeriod; // 7.5: 진행 중에만 산출 가능
  const isGradePublishActive = !!gradePublishPeriod; // 7.6: 성적공개기간 중에만 공개 가능
  const hasGraded = grades.some((g) => g?.status === 'GRADED');

  const handleUpdateCourse = async (courseData) => {
    try {
      const response = await updateCourse(courseId, courseData);
      if (response.success) {
        setEditDialogOpen(false);
        fetchCourse();
      } else {
        setError(response.error?.message || '강의 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('강의 수정 실패:', err);
      setError('강의 수정에 실패했습니다.');
    }
  };

  const handleCreateWeek = async (weekData) => {
    
    try {
      const response = await createWeek(courseId, weekData);
      
      if (response.success) {
        fetchWeeks();
      } else {
        setError(response.error?.message || '주차 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('에러 상세:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError('주차 생성에 실패했습니다.');
    }
    
  };

  const handleUpdateWeek = async (weekId, weekData) => {
    
    try {
      const response = await updateWeek(courseId, weekId, weekData);

      
      if (response.success) {
        fetchWeeks();
      } else {
        setError(response.error?.message || '주차 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('에러 상세:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError('주차 수정에 실패했습니다.');
    }
    
  };

  const handleDeleteWeek = async (weekId) => {
    
    try {
      const response = await deleteWeek(courseId, weekId);
      
      if (response.success) {
        fetchWeeks();
      } else {
        setError(response.error?.message || '주차 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('에러 상세:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError('주차 삭제에 실패했습니다.');
    }
  };

  const handleCreateContent = async (weekId, contentData) => {
    try {
      const response = await createContent(courseId, weekId, contentData);
      if (response?.success) {
        await fetchWeeks();
        return response;
      } else {
        const msg = response?.error?.message || response?.message || '콘텐츠 추가에 실패했습니다.';
        setError(msg);
        throw new Error(msg);
      }
    } catch (err) {
      const msg = err?.message || '콘텐츠 추가에 실패했습니다.';
      setError(msg);
      throw err;
    }
  };

  const handleDeleteContent = async (contentId) => {
    try {
      const response = await deleteContent(contentId);
      if (response?.success) {
        await fetchWeeks();
      } else {
        setError(response?.error?.message || response?.message || '콘텐츠 삭제에 실패했습니다.');
      }
    } catch (err) {
      setError(err?.message || '콘텐츠 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">강의를 찾을 수 없습니다.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/professor/my-courses')} sx={{ mt: 2 }}>
          목록으로 돌아가기
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/professor/my-courses')}
          sx={{ mb: 2 }}
        >
          내 강의로 돌아가기
        </Button>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                {course.courseName}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip label={course.courseCode} color="primary" />
                <Chip label={`${course.section}분반`} color="secondary" />
                <Chip label={`${course.credits}학점`} />
                {course.department && <Chip label={course.department.name || course.department} variant="outlined" />}
                {course.courseType && <Chip label={course.courseType.name || course.courseType} variant="outlined" />}
              </Box>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      수강생: {course.enrollment?.current || course.currentStudents || 0} / {course.enrollment?.max || course.maxStudents || 0}명
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      학점: {course.credits}학점
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditDialogOpen(true)}
            >
              수정
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 탭 메뉴 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab icon={<CalendarMonthIcon />} label="주차 관리" />
          <Tab icon={<EventAvailableIcon />} label="출석 관리" />
          <Tab icon={<NotificationsIcon />} label="공지사항" />
          <Tab icon={<AssignmentIcon />} label="과제" />
          <Tab icon={<QuizIcon />} label="퀴즈" />
          <Tab icon={<FactCheckIcon />} label="시험" />
          <Tab icon={<AssessmentIcon />} label="성적" />
        </Tabs>
      </Paper>

      {/* 탭 콘텐츠 */}
      {currentTab === 0 && (
        <WeekManagement
          courseId={courseId}
          weeks={weeks}
          onCreateWeek={handleCreateWeek}
          onUpdateWeek={handleUpdateWeek}
          onDeleteWeek={handleDeleteWeek}
          onCreateContent={handleCreateContent}
          onDeleteContent={handleDeleteContent}
          onRefreshWeeks={fetchWeeks}
        />
      )}

      {currentTab === 1 && (
        <AttendanceManagement courseId={courseId} />
      )}

      {currentTab === 2 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            공지사항 관리
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            추후 구현 예정
          </Typography>
        </Paper>
      )}

      {currentTab === 3 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            과제 관리
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            추후 구현 예정
          </Typography>
        </Paper>
      )}

      {currentTab === 4 && <QuizManagement courseId={courseId} />}

      {currentTab === 5 && <ExamManagement courseId={courseId} />}

      {currentTab === 6 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                성적 관리
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {course?.courseName || '-'}
              </Typography>
            </Box>
            <Button variant="outlined" onClick={fetchCourseGrades} disabled={gradesLoading}>
              새로고침
            </Button>
          </Box>

          {gradePeriodLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                성적 기간을 확인 중입니다...
              </Typography>
            </Box>
          ) : gradePeriodError || gradePublishPeriodError ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              성적 기간 조회에 실패했습니다.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>성적 기간 안내</AlertTitle>
              - 산출(7.5): <b>성적산출기간(GRADE_CALCULATION) 진행 중</b>에만 가능<br />
              - 공개(7.6): <b>성적공개기간(GRADE_PUBLISH) 진행 중</b> + <b>산출 완료(GRADED)</b>일 때만 가능
            </Alert>
          )}

          {(isGradeCalculationActive || isGradePublishActive) && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <AlertTitle>현재 활성 기간</AlertTitle>
              {isGradeCalculationActive && (
                <div>
                  산출기간(GRADE_CALCULATION): {termLabel(gradePeriod?.term)} · {gradePeriod?.periodName || '-'}
                </div>
              )}
              {isGradePublishActive && (
                <div>
                  공개기간(GRADE_PUBLISH): {termLabel(gradePublishPeriod?.term)} · {gradePublishPeriod?.periodName || '-'}
                </div>
              )}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleCalculateGrades}
              disabled={calcLoading || !isGradeCalculationActive}
            >
              {calcLoading ? '산출 중...' : '성적 산출'}
            </Button>
            <Button
              variant="outlined"
              onClick={handlePublishGrades}
              disabled={publishLoading || !isGradePublishActive || !hasGraded}
            >
              {publishLoading ? '공개 중...' : '성적 공개'}
            </Button>
          </Box>

          {calcMessage && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setCalcMessage(null)}>
              {calcMessage}
            </Alert>
          )}
          {calcError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCalcError(null)}>
              {calcError?.message || '성적 산출에 실패했습니다.'}
            </Alert>
          )}

          {publishMessage && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPublishMessage(null)}>
              {publishMessage}
            </Alert>
          )}
          {publishError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPublishError(null)}>
              {publishError?.message || '성적 산출/공개에 실패했습니다.'}
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          {gradesLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                성적 목록을 불러오는 중입니다...
              </Typography>
            </Box>
          ) : gradesError ? (
            <Alert severity="error">{gradesError?.message || '성적 목록 조회에 실패했습니다.'}</Alert>
          ) : grades.length === 0 ? (
            <Alert severity="info">현재 표시할 성적이 없습니다.</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>학생</TableCell>
                    <TableCell align="center">학번</TableCell>
                    <TableCell align="center">상태</TableCell>
                    <TableCell align="center">중간</TableCell>
                    <TableCell align="center">기말</TableCell>
                    <TableCell align="center">퀴즈</TableCell>
                    <TableCell align="center">과제</TableCell>
                    <TableCell align="center">출석</TableCell>
                    <TableCell align="center">최종</TableCell>
                    <TableCell align="center">등급</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grades.map((g) => (
                    <TableRow key={`${g.courseId}-${g.student?.id ?? ''}`}>
                      <TableCell>{g.student?.name ?? '-'}</TableCell>
                      <TableCell align="center">{g.student?.studentNumber ?? '-'}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={g.status ?? '-'} variant="outlined" />
                      </TableCell>
                      <TableCell align="center">{g.midtermScore ?? '-'}</TableCell>
                      <TableCell align="center">{g.finalExamScore ?? '-'}</TableCell>
                      <TableCell align="center">{g.quizScore ?? '-'}</TableCell>
                      <TableCell align="center">{g.assignmentScore ?? '-'}</TableCell>
                      <TableCell align="center">{g.attendanceScore ?? '-'}</TableCell>
                      <TableCell align="center">{g.finalScore ?? '-'}</TableCell>
                      <TableCell align="center">{g.finalGrade ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* 강의 수정 다이얼로그 */}
      {editDialogOpen && (
        <CourseCreateDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSubmit={handleUpdateCourse}
          enrollmentPeriods={enrollmentPeriods}
          initialData={course}
          isEdit={true}
        />
      )}
    </Container>
  );
};

export default ProfessorCourseDetail;

