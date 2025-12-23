/**
 * Grades 페이지
 *
 * MZC 대학교 LMS 시스템의 성적 조회 페이지입니다.
 * 학생의 전체 학기별 성적과 통계를 확인할 수 있습니다.
 *
 * 주요 기능:
 * - 학기별 성적 조회
 * - 전체 평균 학점 (GPA) 표시
 * - 이수 학점 현황
 * - 성적 추이 그래프
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

// 아이콘 임포트
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import authService from '../services/authService';
import {
  getStudentAcademicTerms,
  getStudentGrades,
  getCourseGradesForProfessor,
  getProfessorAcademicTerms,
} from '../api/gradeApi';
import { getMyCourses } from '../api/professorApi';
import { getCurrentAcademicTerm } from '../api/academicTermApi';

/**
 * 탭 패널 컴포넌트
 */
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * 교수용: 성적 조회(지난 학기 강의들에 대한 학생 성적 목록) - 조회 전용
 * - 산출/공개 버튼은 "강의 관리 > 성적 탭"에서 제공
 */
const ProfessorGradesReadOnlyPanel = () => {
  const [termsLoading, setTermsLoading] = useState(true);
  const [termsError, setTermsError] = useState(null);
  const [terms, setTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [termsEmptyReason, setTermsEmptyReason] = useState(null); // 'NO_PAST_DATA' | null

  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesError, setCoursesError] = useState(null);

  const [expandedCourseId, setExpandedCourseId] = useState(false);
  const [gradesByCourseId, setGradesByCourseId] = useState({});
  const [gradesLoadingByCourseId, setGradesLoadingByCourseId] = useState({});
  const [gradesErrorByCourseId, setGradesErrorByCourseId] = useState({});

  const refreshCourses = async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const res = await getMyCourses({ academicTermId: selectedTermId || undefined });
      // 응답 포맷이 data.courses / data(array) / array 직접 반환 등으로 섞여 있을 수 있어 방어적으로 파싱
      const coursesData = res?.data?.courses ?? res?.data ?? res;
      const list = Array.isArray(coursesData) ? coursesData : [];
      setCourses(list);
    } catch (e) {
      setCoursesError(e);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const termLabel = (t) => {
    const map = { '1': '1학기', '2': '2학기', SUMMER: '하계', WINTER: '동계' };
    return `${t.year}년 ${map[t.termType] ?? t.termType}`;
  };

  const refreshTerms = async () => {
    setTermsLoading(true);
    setTermsError(null);
    setTermsEmptyReason(null);
    try {
      // 1) 지난 학기 목록(교수용) + 2) 현재 학기(공통)를 합쳐서 보여줌
      let pastList = [];
      try {
        const res = await getProfessorAcademicTerms();
        pastList = Array.isArray(res?.data) ? res.data : [];
      } catch (e) {
        // 백엔드에서 "지난 학기 데이터 없음"을 500으로 내려주는 케이스 UX 보정
        if (e?.status === 500 || e?.response?.status === 500) {
          setTermsEmptyReason('NO_PAST_DATA');
          pastList = [];
        } else {
          throw e;
        }
      }

      const current = await getCurrentAcademicTerm();
      const list = [...pastList];
      if (current?.id !== null && current?.id !== undefined) {
        const exists = list.some((t) => String(t?.id) === String(current.id));
        if (!exists) list.unshift(current);
      }

      const order = { '2': 4, '1': 3, WINTER: 2, SUMMER: 1 };
      list.sort((a, b) => {
        if (a.year !== b.year) return (b.year || 0) - (a.year || 0);
        return (order[b.termType] || 0) - (order[a.termType] || 0);
      });
      setTerms(list);
      if (!selectedTermId && list.length > 0) setSelectedTermId(String(list[0].id));
    } catch (e) {
      setTermsError(e);
      setTerms([]);
    } finally {
      setTermsLoading(false);
    }
  };

  const loadGradesForCourse = async (courseId) => {
    if (!courseId) return;
    // 이미 로드되어 있고 에러도 없으면 재조회 안 함(상태 필터 바뀔 때는 아래 effect에서 초기화)
    if (gradesByCourseId[courseId] && !gradesErrorByCourseId[courseId]) return;

    setGradesLoadingByCourseId((prev) => ({ ...prev, [courseId]: true }));
    setGradesErrorByCourseId((prev) => ({ ...prev, [courseId]: null }));
    try {
      // 교수 화면에서는 항상 전체(ALL) 성적을 조회
      const res = await getCourseGradesForProfessor(courseId, 'ALL');
      const list = Array.isArray(res?.data) ? res.data : [];
      setGradesByCourseId((prev) => ({ ...prev, [courseId]: list }));
    } catch (e) {
      setGradesErrorByCourseId((prev) => ({ ...prev, [courseId]: e }));
      setGradesByCourseId((prev) => ({ ...prev, [courseId]: [] }));
    } finally {
      setGradesLoadingByCourseId((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  useEffect(() => {
    refreshTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 학기 선택이 바뀌면 강의/성적 선택을 초기화하고 강의 목록 재조회
    setExpandedCourseId(false);
    setGradesByCourseId({});
    setGradesLoadingByCourseId({});
    setGradesErrorByCourseId({});
    if (selectedTermId) refreshCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTermId]);

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          성적 조회 (교수)
        </Typography>
        <Button onClick={refreshTerms} disabled={termsLoading} variant="outlined" size="small">
          학기 새로고침
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        <b>지난 학기</b>를 선택한 뒤, 해당 학기의 <b>담당 강의</b>에 대한 <b>수강생 성적(조회)</b>을 확인합니다.
        성적 산출/공개는 <b>강의 관리 &gt; 성적</b> 탭에서 진행하세요.
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>학기 선택</InputLabel>
          <Select
            value={selectedTermId}
            onChange={(e) => setSelectedTermId(e.target.value)}
            label="학기 선택"
            disabled={termsLoading || terms.length === 0}
          >
            {terms.map((t) => (
              <MenuItem key={t.id} value={String(t.id)}>
                {termLabel(t)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button onClick={refreshCourses} disabled={coursesLoading || !selectedTermId} variant="outlined">
          과목 새로고침
        </Button>
      </Box>

      {!termsLoading && termsError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          학기 목록 조회에 실패했습니다.
        </Alert>
      )}

      {termsLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            학기 목록을 불러오는 중입니다...
          </Typography>
        </Box>
      )}

      {!termsLoading && !termsError && terms.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {termsEmptyReason === 'NO_PAST_DATA'
            ? '지난 학기 자료가 없습니다.'
            : '조회 가능한 학기가 없습니다.'}
        </Alert>
      )}

      {!coursesLoading && coursesError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          담당 강의 목록 조회에 실패했습니다.
        </Alert>
      )}

      {coursesLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            강의 목록을 불러오는 중입니다...
          </Typography>
        </Box>
      )}

      {!coursesLoading && !coursesError && courses.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          조회할 강의가 없습니다.
        </Alert>
      )}

      {!coursesLoading && !coursesError && courses.length > 0 && (
        <Box>
          {courses.map((c) => {
            const courseId = String(c.id);
            const loaded = Object.prototype.hasOwnProperty.call(gradesByCourseId, courseId);
            const isLoading = !!gradesLoadingByCourseId[courseId];
            const err = gradesErrorByCourseId[courseId];
            const gradeRows = gradesByCourseId[courseId] || [];

            return (
              <Accordion
                key={courseId}
                expanded={expandedCourseId === courseId}
                onChange={async (_e, expanded) => {
                  setExpandedCourseId(expanded ? courseId : false);
                  if (expanded) await loadGradesForCourse(courseId);
                }}
                sx={{ mb: 1, '&:before': { display: 'none' } }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontWeight: 700 }}>
                        {c.courseCode} {c.courseName} ({c.section})
                      </Typography>
                      <Chip size="small" label={`${c.credits ?? '-'}학점`} variant="outlined" />
                      <Chip size="small" label={c.status ?? '-'} variant="outlined" />
                      {loaded && !isLoading && (
                        <Chip size="small" color="primary" label={`수강생 ${gradeRows.length}명`} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      담당교수: {c?.professor?.name ?? '-'}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {isLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                      <CircularProgress size={18} />
                      <Typography variant="body2" color="text.secondary">
                        성적 목록을 불러오는 중입니다...
                      </Typography>
                    </Box>
                  )}

                  {!isLoading && err && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      성적 목록 조회에 실패했습니다.
                    </Alert>
                  )}

                  {!isLoading && !err && loaded && gradeRows.length === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      표시할 성적이 없습니다.
                    </Alert>
                  )}

                  {!isLoading && !err && loaded && gradeRows.length > 0 && (
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
                          {gradeRows.map((g) => (
                            <TableRow key={`${g.courseId}-${g.student?.id ?? ''}`}>
                              <TableCell>{g.student?.name ?? '-'}</TableCell>
                              <TableCell align="center">{g.student?.studentNumber ?? '-'}</TableCell>
                              <TableCell align="center">{g.status}</TableCell>
                              <TableCell align="center">{g.midtermScore}</TableCell>
                              <TableCell align="center">{g.finalExamScore}</TableCell>
                              <TableCell align="center">{g.quizScore}</TableCell>
                              <TableCell align="center">{g.assignmentScore}</TableCell>
                              <TableCell align="center">{g.attendanceScore}</TableCell>
                              <TableCell align="center">{g.finalScore}</TableCell>
                              <TableCell align="center">{g.finalGrade}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}
    </Paper>
  );
};

/**
 * 학생용: 성적 조회(학기 선택 + 공개된 성적만)
 */
const StudentGradesPanel = () => {
  const [termsLoading, setTermsLoading] = useState(true);
  const [termsError, setTermsError] = useState(null);
  const [terms, setTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('');

  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesError, setGradesError] = useState(null);
  const [grades, setGrades] = useState([]);

  const [allGradesLoading, setAllGradesLoading] = useState(false);
  const [allGrades, setAllGrades] = useState([]);

  const termLabel = (t) => {
    const map = { '1': '1학기', '2': '2학기', SUMMER: '하계', WINTER: '동계' };
    return `${t.year}년 ${map[t.termType] ?? t.termType}`;
  };

  const gradeToPoint = (grade) => {
    const map = {
      'A+': 4.5, 'A': 4.0,
      'B+': 3.5, 'B': 3.0,
      'C+': 2.5, 'C': 2.0,
      'D+': 1.5, 'D': 1.0,
      'F': 0,
    };
    return map[grade] ?? 0;
  };

  const isEarnedGrade = (grade) => {
    if (grade == null) return false;
    return String(grade).trim().toUpperCase() !== 'F';
  };

  const calcEarnedCredits = (gradeRows) => {
    const rows = Array.isArray(gradeRows) ? gradeRows : [];
    return rows.reduce((acc, r) => {
      const credits = Number(r.courseCredits) || 0;
      return acc + (isEarnedGrade(r.finalGrade) ? credits : 0);
    }, 0);
  };

  const calcGpa = (gradeRows) => {
    const rows = Array.isArray(gradeRows) ? gradeRows : [];
    const creditsSum = rows.reduce((acc, r) => acc + (Number(r.courseCredits) || 0), 0);
    if (creditsSum === 0) return '0.00';
    const pointsSum = rows.reduce(
      (acc, r) => acc + gradeToPoint(r.finalGrade) * (Number(r.courseCredits) || 0),
      0
    );
    return (pointsSum / creditsSum).toFixed(2);
  };

  const overallStats = useMemo(() => {
    const rows = Array.isArray(allGrades) ? allGrades : [];
    // "이수 학점"은 F 제외 (일반적인 취득학점 기준)
    const totalCredits = calcEarnedCredits(rows);
    const overallGPA = calcGpa(rows);
    return { totalCredits, overallGPA };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allGrades]);

  const selectedTermStats = useMemo(() => {
    const totalCredits = calcEarnedCredits(grades);
    const gpa = calcGpa(grades);
    return { totalCredits, gpa };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grades]);

  const fetchTerms = async () => {
    setTermsLoading(true);
    setTermsError(null);
    try {
      const res = await getStudentAcademicTerms();
      const list = Array.isArray(res?.data) ? res.data : [];
      // 최신 학기 우선 정렬(대략): year desc, termType desc(2>1>WINTER>SUMMER)
      const order = { '2': 4, '1': 3, WINTER: 2, SUMMER: 1 };
      list.sort((a, b) => {
        if (a.year !== b.year) return (b.year || 0) - (a.year || 0);
        return (order[b.termType] || 0) - (order[a.termType] || 0);
      });
      setTerms(list);
      if (!selectedTermId && list.length > 0) setSelectedTermId(String(list[0].id));
    } catch (e) {
      setTermsError(e);
      setTerms([]);
    } finally {
      setTermsLoading(false);
    }
  };

  const fetchGrades = async (termId) => {
    if (!termId) return;
    setGradesLoading(true);
    setGradesError(null);
    try {
      const res = await getStudentGrades(termId);
      setGrades(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setGradesError(e);
      setGrades([]);
    } finally {
      setGradesLoading(false);
    }
  };

  const fetchAllGrades = async () => {
    setAllGradesLoading(true);
    try {
      // 먼저 모든 학기 목록 조회
      const termsRes = await getStudentAcademicTerms();
      const termList = Array.isArray(termsRes?.data) ? termsRes.data : [];

      if (termList.length === 0) {
        setAllGrades([]);
        return;
      }

      // 각 학기별로 성적 조회 (병렬 처리)
      const gradePromises = termList.map((term) => getStudentGrades(term.id));
      const gradeResults = await Promise.all(gradePromises);

      // 모든 성적 합치기
      const combinedGrades = gradeResults.flatMap((res) =>
        Array.isArray(res?.data) ? res.data : []
      );

      setAllGrades(combinedGrades);
    } catch (error) {
      console.error('전체 성적 조회 실패:', error);
      setAllGrades([]);
    } finally {
      setAllGradesLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
    fetchAllGrades();
    // NOTE: fetchTerms/fetchAllGrades는 컴포넌트 내부 함수(closure)라 의존성에 넣지 않고 최초 1회만 호출
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTermId) fetchGrades(selectedTermId);
  }, [selectedTermId]);

  // PDF 성적표 다운로드
  const downloadGradesPDF = async () => {
    try {
      if (!allGrades || allGrades.length === 0) {
        alert('다운로드할 성적 데이터가 없습니다.');
        return;
      }

      const currentUser = authService.getCurrentUser();

      // 학기별로 그룹핑
      const gradesByTerm = {};
      allGrades.forEach((g) => {
        const termTypeMap = { '1': '1학기', '2': '2학기', SUMMER: '하계', WINTER: '동계' };
        const termKey = `${g.academicTermYear || ''} ${termTypeMap[g.academicTermType] || g.academicTermType || ''}`;
        if (!gradesByTerm[termKey]) {
          gradesByTerm[termKey] = [];
        }
        gradesByTerm[termKey].push(g);
      });

      // 임시 HTML 요소 생성
      const container = document.createElement('div');
      container.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 800px; padding: 40px; background: white; font-family: "Malgun Gothic", "맑은 고딕", sans-serif;';

      // 헤더
      container.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 24px; color: #333;">성적증명서</h1>
          <p style="color: #666; margin-top: 5px;">Grade Report</p>
        </div>
        <div style="margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
          <p style="margin: 5px 0;"><strong>이름:</strong> ${currentUser?.name || '-'}</p>
          <p style="margin: 5px 0;"><strong>학번:</strong> ${currentUser?.userNumber || '-'}</p>
          <p style="margin: 5px 0;"><strong>학과:</strong> ${currentUser?.departmentName || '-'}</p>
          <p style="margin: 5px 0;"><strong>발급일:</strong> ${new Date().toLocaleDateString('ko-KR')}</p>
        </div>
      `;

      // 학기별 테이블 생성
      Object.entries(gradesByTerm).forEach(([termName, termGrades]) => {
        const termCredits = termGrades.reduce((acc, r) => acc + (Number(r.courseCredits) || 0), 0);
        const termPoints = termGrades.reduce(
          (acc, r) => acc + gradeToPoint(r.finalGrade) * (Number(r.courseCredits) || 0),
          0
        );
        const termGPA = termCredits > 0 ? (termPoints / termCredits).toFixed(2) : '0.00';

        const rows = termGrades.map((g) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${g.courseName || '-'}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${g.courseCredits || 0}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${g.finalGrade || '-'}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${g.finalScore || '-'}</td>
          </tr>
        `).join('');

        container.innerHTML += `
          <div style="margin-bottom: 25px;">
            <h3 style="margin: 0 0 10px 0; color: #1976d2;">${termName}</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #424242; color: white;">
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">과목명</th>
                  <th style="padding: 10px; border: 1px solid #ddd; width: 80px;">학점</th>
                  <th style="padding: 10px; border: 1px solid #ddd; width: 80px;">등급</th>
                  <th style="padding: 10px; border: 1px solid #ddd; width: 80px;">점수</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
              <tfoot>
                <tr style="background: #f0f0f0; font-weight: bold;">
                  <td style="padding: 8px; border: 1px solid #ddd;">학기 평점: ${termGPA}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${termCredits}</td>
                  <td colspan="2" style="padding: 8px; border: 1px solid #ddd;"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        `;
      });

      // 전체 요약
      container.innerHTML += `
        <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
          <h3 style="margin: 0 0 15px 0; color: #1976d2;">전체 요약</h3>
          <p style="margin: 5px 0; font-size: 16px;"><strong>총 이수 학점:</strong> ${overallStats.totalCredits} 학점</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>전체 평균 학점:</strong> ${overallStats.overallGPA} / 4.5</p>
        </div>
      `;

      document.body.appendChild(container);

      // html2canvas로 캡처
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      document.body.removeChild(container);

      // PDF 생성
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      // 이미지가 한 페이지에 안 맞으면 여러 페이지로 분할
      const pageHeight = pdfHeight * imgWidth / pdfWidth;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // 다운로드
      pdf.save(`성적증명서_${currentUser?.userNumber || 'student'}.pdf`);
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 생성에 실패했습니다.');
    }
  };

  return (
    <>
      {/* 전체 통계 카드(간단 버전) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    전체 평균 학점
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {overallStats.overallGPA}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / 4.5
                  </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    총 이수 학점
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                {overallStats.totalCredits}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                학점
                  </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={downloadGradesPDF}
                disabled={allGradesLoading || allGrades.length === 0}
              >
                성적표 다운로드
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                PDF 형식
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            학기별 성적
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>학기 선택</InputLabel>
            <Select
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              label="학기 선택"
              disabled={termsLoading || terms.length === 0}
            >
              {terms.map((t) => (
                <MenuItem key={t.id} value={String(t.id)}>
                  {termLabel(t)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {termsError && <Alert severity="warning">학기 목록 조회에 실패했습니다.</Alert>}
        {!termsLoading && !termsError && terms.length === 0 && (
          <Alert severity="info">조회 가능한 학기가 없습니다.</Alert>
        )}

        <Tabs value={0} sx={{ mb: 2 }}>
          <Tab label="성적 목록" />
        </Tabs>

        {gradesLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              성적을 불러오는 중입니다...
            </Typography>
          </Box>
        )}

        {!gradesLoading && gradesError && (
          <Alert severity="warning">성적 조회에 실패했습니다.</Alert>
        )}

        {!gradesLoading && !gradesError && grades.length === 0 && (
          <Alert severity="info">
            해당 학기에 공개된 성적이 없습니다.
          </Alert>
        )}

        {!gradesLoading && !gradesError && grades.length > 0 && (
          <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>과목명</TableCell>
                  <TableCell align="center">학점</TableCell>
                  <TableCell align="center">등급</TableCell>
                    <TableCell align="center">최종 점수</TableCell>
                    <TableCell align="center">공개일</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {grades.map((g) => (
                    <TableRow key={`${g.academicTermId}-${g.courseId}`}>
                      <TableCell>{g.courseName}</TableCell>
                      <TableCell align="center">{g.courseCredits}</TableCell>
                    <TableCell align="center">
                        <Chip label={g.finalGrade} size="small" />
                    </TableCell>
                      <TableCell align="center">{g.finalScore}</TableCell>
                      <TableCell align="center">{g.publishedAt ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  학기 평균 학점
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {selectedTermStats.gpa} / 4.5
                </Typography>
              </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  이수 학점
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {selectedTermStats.totalCredits} 학점
                </Typography>
              </Grid>
            </Grid>
          </Box>
          </>
        )}
      </Paper>

      {/* 전체 성적 로딩이 길어도 UX 깨지지 않게 */}
      {allGradesLoading && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          전체 성적 통계를 계산 중입니다...
                  </Typography>
      )}
    </>
  );
};

/**
 * Grades 컴포넌트
 */
const Grades = () => {
  const currentUser = authService.getCurrentUser();
  const userType = currentUser?.userType;
  const isProfessor = userType === 'PROFESSOR';
  const headerSubText = isProfessor
    ? `교수 | ${currentUser?.name ?? ''}`.trim()
    : `${currentUser?.departmentName ?? '-'} | ${currentUser?.userNumber ?? '-'} ${currentUser?.name ?? ''}`.trim();

                    return (
    <Container maxWidth="xl">
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            {isProfessor ? '성적 관리' : '성적 조회'}
                  </Typography>
          <Typography variant="body1" color="text.secondary">
            {isProfessor ? `${headerSubText} | 성적 산출/공개 관리` : headerSubText}
                          </Typography>
                        </Box>
        <Box>
          <Tooltip title="성적표 인쇄">
            <IconButton>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="성적표 다운로드">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
                      </Box>

      {isProfessor && (
        <Box sx={{ mb: 3 }}>
          <ProfessorGradesReadOnlyPanel />
                  </Box>
      )}
      {!isProfessor && <StudentGradesPanel />}
    </Container>
  );
};

export default Grades;