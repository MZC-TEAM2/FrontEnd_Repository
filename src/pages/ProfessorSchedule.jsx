/**
 * ProfessorSchedule 페이지
 *
 * 교수의 주간 강의 시간표를 학생 시간표(`CourseSchedule`)와 동일한 외형으로 표시합니다.
 * 데이터만 교수 API(`GET /api/v1/professor/courses`)에서 가져와서 매핑합니다.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Container,
  Grid,
  Button,
  Card,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Skeleton,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';

import axiosInstance from '../api/axiosInstance';
import { getMyCourses } from '../api/professorApi';
import { exportElementToPdf } from '../utils/pdfUtils';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const ProfessorSchedule = () => {
  const navigate = useNavigate();
  const [currentTermId, setCurrentTermId] = useState(null);
  const [termLabel, setTermLabel] = useState('현재 학기');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const exportRef = useRef(null);

  // API 응답에서 종종 {id, name} 형태로 내려오는 필드를 안전하게 문자열로 변환
  const toText = useCallback((v) => {
    if (v == null) return '';
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (typeof v === 'object') {
      // 흔한 케이스: { id, name }
      if (typeof v.name === 'string' || typeof v.name === 'number') return String(v.name);
      if (typeof v.title === 'string' || typeof v.title === 'number') return String(v.title);
      if (typeof v.label === 'string' || typeof v.label === 'number') return String(v.label);
      return '';
    }
    return '';
  }, []);

  // 요일(학생 시간표와 동일)
  const weekDays = ['월', '화', '수', '목', '금'];
  const dayNameByDayOfWeek = useMemo(() => ({ 1: '월', 2: '화', 3: '수', 4: '목', 5: '금' }), []);

  const fetchCurrentTerm = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/api/v1/enrollments/periods/current`);
      const term = response.data?.data?.currentPeriod?.term;
      const termId = term?.id || 1; // 기존 코드와 동일: term.id가 없으면 1 (임시)
      setCurrentTermId(termId);

      setTermLabel(term?.termName || (term?.year ? `${term.year}학년도 ${term.termType}학기` : '현재 학기'));
    } catch (e) {
      setCurrentTermId(1);
      setTermLabel('현재 학기');
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    if (!currentTermId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await getMyCourses({ academicTermId: currentTermId });
      if (response && response.success && response.data) {
        const coursesData = response.data.courses || response.data || [];
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } else if (Array.isArray(response)) {
        setCourses(response);
      } else {
        setError(response?.error?.message || response?.message || '시간표 데이터를 불러오는데 실패했습니다.');
        setCourses([]);
      }
    } catch (e) {
      setError(e?.message || '시간표 데이터를 불러오는데 실패했습니다.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [currentTermId]);

  useEffect(() => {
    fetchCurrentTerm();
  }, [fetchCurrentTerm]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // 과목별 색상(학생 시간표와 동일 팔레트)
  const palette = useMemo(
    () => ['#6FA3EB', '#A5C9EA', '#9CC0F5', '#81C784', '#FFD54F', '#EF9A9A', '#CE93D8', '#FFAB91'],
    []
  );
  const courseColorById = useMemo(() => {
    const map = {};
    courses.forEach((c, idx) => {
      map[c.id] = palette[idx % palette.length];
    });
    return map;
  }, [courses, palette]);

  // 교수 강의 목록 -> scheduleData(학생 시간표가 소비하는 형태로 변환)
  const scheduleData = useMemo(() => {
    const list = [];
    for (const c of courses) {
      for (const s of c.schedule || []) {
        const dayOfWeekFromName = s.dayName ? weekDays.indexOf(String(s.dayName).trim()) + 1 : 0;
        const dayOfWeek = Number(s.dayOfWeek) || dayOfWeekFromName;
        if (!dayOfWeek || !s?.startTime || !s?.endTime) continue;

        const courseName = toText(c.courseName) || toText(c.subjectName) || toText(c.title) || '강의';
        const courseCode = toText(c.courseCode) || toText(c.subjectCode) || toText(c.code);
        const professorText = toText(c.professorName) || toText(c.professor) || '나';
        const classroomText = toText(s.classroom) || toText(c.classroom);

        list.push({
          id: c.id,
          code: courseCode,
          name: courseName,
          professor: professorText,
          classroom: classroomText,
          day: dayNameByDayOfWeek[dayOfWeek] || s.dayName,
          dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          credits: c.credits || 0,
        });
      }
    }
    return list;
  }, [courses, dayNameByDayOfWeek, weekDays, toText]);

  const toMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = String(timeStr).split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const startToRowIndex = (timeStr) => {
    const mins = toMinutes(timeStr);
    const base = 9 * 60;
    const rel = Math.max(0, mins - base);
    return Math.floor(rel / 30);
  };

  const endToRowIndex = (timeStr) => {
    const mins = toMinutes(timeStr);
    const base = 9 * 60;
    const rel = Math.max(0, mins - base);
    return Math.ceil(rel / 30);
  };

  const buildTimetableExportHtml = () => {
    const rows = Array.from({ length: 18 }, (_, i) => i);
    const cols = weekDays.map((d) => d);

    const blocks = new Map();
    const covered = new Set();

    for (const item of scheduleData) {
      const dayIndex = (item.dayOfWeek || 0) - 1;
      if (dayIndex < 0 || dayIndex >= cols.length) continue;

      const startIdx = startToRowIndex(item.startTime);
      const endIdx = endToRowIndex(item.endTime);
      const safeEnd = Math.max(endIdx, startIdx + 1);
      const rowSpan = Math.min(18 - startIdx, safeEnd - startIdx);
      if (startIdx < 0 || startIdx >= 18) continue;

      blocks.set(`${dayIndex}-${startIdx}`, { ...item, rowSpan });
      for (let r = startIdx + 1; r < startIdx + rowSpan; r += 1) {
        covered.add(`${dayIndex}-${r}`);
      }
    }

    const esc = (s) =>
      String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

    const timeLabel = (rowIndex) => {
      const baseMinutes = 9 * 60 + rowIndex * 30;
      const h = String(Math.floor(baseMinutes / 60)).padStart(2, '0');
      const m = String(baseMinutes % 60).padStart(2, '0');
      return `${h}:${m}`;
    };

    const courseIds = [...new Set(scheduleData.map((c) => c.id))];
    const courseListHtml =
      courseIds.length === 0
        ? `<div class="muted">담당 강의가 없습니다.</div>`
        : `<div class="cards">
            ${courseIds
              .map((id) => {
                const first = scheduleData.find((c) => c.id === id);
                if (!first) return '';
                const color = courseColorById[id] || '#90CAF9';
                const times = scheduleData
                  .filter((c) => c.id === id)
                  .map((c) => `${c.day} ${String(c.startTime).substring(0, 5)}-${String(c.endTime).substring(0, 5)}`)
                  .join(', ');
                return `
                  <div class="card" style="border-left-color:${esc(color)}">
                    <div class="card-title">${esc(first.name)} <span class="muted">(${esc(first.code || id)})</span></div>
                    <div class="muted">${esc(first.professor || '-')} · ${esc(first.classroom || '-')} · ${esc(times || '-')}</div>
                  </div>
                `;
              })
              .join('')}
          </div>`;

    const tableRowsHtml = rows
      .map((r) => {
        const cells = cols
          .map((day, dayIndex) => {
            if (covered.has(`${dayIndex}-${r}`)) return '';
            const block = blocks.get(`${dayIndex}-${r}`);
            if (!block) return `<td class="cell"></td>`;
            const color = courseColorById[block.id] || '#90CAF9';
            return `
              <td class="cell course" rowspan="${block.rowSpan}" style="border-left-color:${esc(color)}; background:${esc(color)}22;">
                <div class="course-name">${esc(block.name)}</div>
                <div class="muted">${esc(block.professor || '')}</div>
                <div class="muted">${esc(block.classroom || '')}</div>
              </td>
            `;
          })
          .join('');

        return `
          <tr>
            <th class="time">${esc(timeLabel(r))}</th>
            ${cells}
          </tr>
        `;
      })
      .join('');

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(termLabel)} 시간표</title>
    <style>
      @page { size: A4 landscape; margin: 12mm; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", Arial, sans-serif; color:#111; }
      h1 { font-size: 20px; margin: 0 0 4px; }
      .sub { margin: 0 0 12px; color:#555; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      th, td { border: 1px solid #e0e0e0; padding: 6px; vertical-align: top; }
      th.day { background:#1976d2; color:#fff; font-weight:700; text-align:center; }
      th.time { width: 72px; background:#f5f5f5; font-weight:700; }
      td.cell { height: 28px; }
      td.course { border-left-width: 4px; border-left-style: solid; }
      .course-name { font-weight: 800; font-size: 12px; margin-bottom: 2px; }
      .muted { color:#666; font-size: 11px; line-height: 1.3; }
      h2 { font-size: 14px; margin: 14px 0 8px; }
      .cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
      .card { border: 1px solid #e6e6e6; border-left: 4px solid #90CAF9; padding: 8px; border-radius: 8px; }
      .card-title { font-weight: 800; margin-bottom: 4px; font-size: 12px; }
      @media print { .no-print { display:none !important; } }
    </style>
  </head>
  <body>
    <h1>시간표</h1>
    <div class="sub">${esc(termLabel)} | 총 ${esc(totalCredits)}학점</div>
    <table>
      <thead>
        <tr>
          <th class="time">시간</th>
          ${cols.map((d) => `<th class="day">${esc(d)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
      </tbody>
    </table>
    <h2>담당 강의 목록</h2>
    ${courseListHtml}
  </body>
</html>`;
  };

  const openPrintWindow = () => {
    const w = window.open('', '_blank');
    if (!w) {
      alert('팝업이 차단되어 인쇄 화면을 열 수 없습니다. 브라우저 팝업 차단을 해제해주세요.');
      return;
    }

    try {
      const html = buildTimetableExportHtml();
      w.document.open();
      w.document.write(html);
      w.document.close();
      w.focus();

      // 가능한 한 사용자 클릭 제스처 안에서 print 트리거
      w.print();
    } catch (e) {
      try {
        w.close();
      } catch {
        // ignore
      }
      alert(e?.message || '인쇄 화면을 여는데 실패했습니다.');
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setPdfLoading(true);
      const safeTerm = String(termLabel).replaceAll(/\s+/g, '-').replaceAll(/[^\w\-가-힣]/g, '');
      const filename = `professor-timetable-${safeTerm || 'current'}.pdf`;
      await exportElementToPdf({ element: exportRef.current, filename, orientation: 'landscape' });
    } catch (e) {
      alert(e?.message || 'PDF 다운로드에 실패했습니다.');
    } finally {
      setPdfLoading(false);
    }
  };

  /**
   * 시간을 행 인덱스로 변환
   */
  const timeToRowIndex = (time) => {
    const [hour, minute] = String(time).split(':').map(Number);
    const baseHour = 9;
    return (hour - baseHour) * 2 + (minute === 30 ? 1 : 0);
  };

  /**
   * 과목이 차지하는 행 수 계산
   */
  const calculateRowSpan = (startTime, endTime) => {
    const startIndex = timeToRowIndex(startTime);
    const endIndex = timeToRowIndex(endTime);
    return endIndex - startIndex;
  };

  /**
   * 특정 시간과 요일에 해당하는 과목 찾기
   */
  const getCourseAtTime = (day, timeIndex) => {
    return scheduleData.find((course) => {
      const startIndex = timeToRowIndex(course.startTime);
      const endIndex = timeToRowIndex(course.endTime);
      return course.day === day && timeIndex >= startIndex && timeIndex < endIndex;
    });
  };

  /**
   * 과목 클릭 핸들러(교수는 강의 관리로 이동)
   */
  const handleCourseClick = (courseId) => {
    navigate(`/professor/course/${courseId}/manage`);
  };

  /**
   * 시간표 셀 렌더링(학생 시간표와 동일 스타일)
   */
  const renderScheduleCell = (day, timeIndex) => {
    const course = getCourseAtTime(day, timeIndex);

    if (!course) {
      return <TableCell key={`${day}-${timeIndex}`} sx={{ border: '1px solid #e0e0e0', height: 40 }} />;
    }

    const startIndex = timeToRowIndex(course.startTime);
    if (timeIndex !== startIndex) {
      return null;
    }

    const rowSpan = calculateRowSpan(course.startTime, course.endTime);

    return (
      <TableCell
        key={`${day}-${timeIndex}`}
        rowSpan={rowSpan}
        sx={{
          border: '1px solid #e0e0e0',
          padding: 1,
          backgroundColor: (courseColorById[course.id] || '#90CAF9') + '30',
          borderLeft: `4px solid ${courseColorById[course.id] || '#90CAF9'}`,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: (courseColorById[course.id] || '#90CAF9') + '50',
          },
        }}
        onClick={() => handleCourseClick(course.id)}
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: courseColorById[course.id] || 'primary.main' }}>
            {course.name}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            {course.professor}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            {course.classroom}
          </Typography>
        </Box>
      </TableCell>
    );
  };

  // 총 학점(담당 강의 기준)
  const uniqueCourseIds = useMemo(() => [...new Set(scheduleData.map((c) => c.id))], [scheduleData]);
  const totalCredits = useMemo(() => {
    return uniqueCourseIds.reduce((sum, id) => {
      const first = scheduleData.find((c) => c.id === id);
      return sum + (first?.credits || 0);
    }, 0);
  }, [uniqueCourseIds, scheduleData]);

  return (
    <Container maxWidth="xl">
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            시간표
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {termLabel} | 총 {totalCredits}학점
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="인쇄">
            <IconButton onClick={openPrintWindow} disabled={loading || pdfLoading}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="PDF 다운로드">
            <IconButton onClick={handleDownloadPdf} disabled={loading || pdfLoading}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchCourses}>
              다시 시도
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && !error && uniqueCourseIds.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          현재 시간표에 표시할 담당 강의가 없습니다.
        </Alert>
      )}

      {/* PDF 캡처 영역 */}
      <Box ref={exportRef}>
        {/* 시간표 테이블 */}
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '80px' }} />
              {weekDays.map((day) => (
                <col key={day} style={{ width: 'calc((100% - 80px) / 5)' }} />
              ))}
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 80, backgroundColor: 'primary.light', color: 'white', fontWeight: 600 }}>
                  시간
                </TableCell>
                {weekDays.map((day, index) => (
                  <TableCell
                    key={day}
                    align="center"
                    sx={{
                      backgroundColor: 'primary.light',
                      color: 'white',
                      fontWeight: 600,
                      position: 'relative',
                    }}
                  >
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 18 }, (_, timeIndex) => {
                const hour = Math.floor(timeIndex / 2) + 9;
                const minute = timeIndex % 2 === 0 ? '00' : '30';
                const timeLabel = `${hour}:${minute}`;

                return (
                  <TableRow key={timeIndex}>
                    <TableCell
                      sx={{
                        backgroundColor: 'grey.100',
                        fontWeight: 500,
                        fontSize: '0.85rem',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      {loading ? <Skeleton width={48} /> : timeLabel}
                    </TableCell>
                    {weekDays.map((day) =>
                      loading ? (
                        <TableCell key={`${day}-${timeIndex}`} sx={{ border: '1px solid #e0e0e0', height: 40 }}>
                          <Skeleton />
                        </TableCell>
                      ) : (
                        renderScheduleCell(day, timeIndex)
                      )
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 과목 목록 카드(학생 시간표와 동일 외형) */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          담당 강의 목록
        </Typography>
        <Grid container spacing={2}>
          {(loading ? Array.from({ length: 6 }).map((_, i) => `sk-${i}`) : uniqueCourseIds).map((courseId) => {
            const course = scheduleData.find((c) => c.id === courseId);
            return (
              <Grid item xs={12} sm={6} md={4} key={courseId}>
                <Card
                  sx={{
                    p: 2,
                    borderLeft: `4px solid ${courseColorById[courseId] || '#90CAF9'}`,
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => !loading && handleCourseClick(courseId)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {loading ? <Skeleton width={180} /> : course?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {loading ? <Skeleton width={80} /> : courseId}
                      </Typography>
                    </Box>
                    <Chip
                      label={loading ? '—' : `${course?.credits || 0}학점`}
                      size="small"
                      sx={{ backgroundColor: (courseColorById[courseId] || '#90CAF9') + '30' }}
                    />
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">{loading ? <Skeleton width={120} /> : course?.professor}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2">{loading ? <Skeleton width={140} /> : course?.classroom}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {loading
                          ? '—'
                          : scheduleData
                              .filter((c) => c.id === courseId)
                              .map((c) => `${c.day} ${String(c.startTime).substring(0, 5)}-${String(c.endTime).substring(0, 5)}`)
                              .join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Container>
  );
};

export default ProfessorSchedule;


