/**
 * CourseSchedule 페이지
 *
 * MZC 대학교 LMS 시스템의 시간표 페이지입니다.
 * 학생의 주간 수업 시간표를 시각적으로 표시합니다.
 *
 * 주요 기능:
 * - 주간 시간표 그리드 표시
 * - 과목별 색상 구분
 * - 강의실 정보 표시
 * - 클릭 시 과목 상세 페이지로 이동
 */

import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
} from '@mui/material';

// 아이콘 임포트
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import useMyCourses from '../domains/course/hooks/useMyCourses';
import { exportElementToPdf } from '../utils/pdfUtils';

/**
 * CourseSchedule 컴포넌트
 */
const CourseSchedule = () => {
  const navigate = useNavigate();
  // 시간표는 최신성이 중요해서 진입 시 캐시를 무시하고 한 번 강제 조회
  const { loading, error, courses, term, totalCredits, reload } = useMyCourses({ forceOnMount: true });
  const [pdfLoading, setPdfLoading] = useState(false);
  const exportRef = useRef(null);

  // 요일
  const weekDays = ['월', '화', '수', '목', '금'];

  const dayNameByDayOfWeek = useMemo(() => ({ 1: '월', 2: '화', 3: '수', 4: '목', 5: '금' }), []);

  const termLabel = useMemo(() => {
    return term?.termName || (term?.year ? `${term.year}학년도 ${term.termType}학기` : '현재 학기');
  }, [term]);

  // 과목별 색상: 고정 팔레트 기반(서버 색상 API(/schedule) 붙일 때도 여기만 바꾸면 됨)
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

  // enrollments/my -> scheduleData(기존 30분 단위 테이블이 먹는 형태)
  const scheduleData = useMemo(() => {
    const list = [];
    for (const c of courses) {
      for (const s of c.schedule || []) {
        if (!s?.dayOfWeek || !s?.startTime || !s?.endTime) continue;
        list.push({
          id: c.id,
          code: c.subjectCode,
          name: c.subjectName,
          professor: c.professor,
          classroom: s.classroom || c.classroom,
          day: dayNameByDayOfWeek[s.dayOfWeek] || s.dayName,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          credits: c.credits || 0,
        });
      }
    }
    return list;
  }, [courses, dayNameByDayOfWeek]);

  const toMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = String(timeStr).split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // 30분 단위 그리드용 index (9:00=0, 9:30=1 ...)
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
    // 시간 슬롯: 9:00 ~ 18:00 (30분 단위, 18칸)
    const rows = Array.from({ length: 18 }, (_, i) => i);
    const cols = weekDays.map((d) => d);

    // dayIndex(0..4) / startIndex -> block
    const blocks = new Map();
    const covered = new Set(); // `${dayIndex}-${rowIndex}` for non-start rows that should be skipped

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
        ? `<div class="muted">수강 과목이 없습니다.</div>`
        : `<div class="cards">
            ${courseIds
              .map((id) => {
                const first = scheduleData.find((c) => c.id === id);
                if (!first) return '';
                const color = courseColorById[id] || '#90CAF9';
                const times = scheduleData
                  .filter((c) => c.id === id)
                  .map((c) => `${c.day} ${c.startTime}-${c.endTime}`)
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
      @media print {
        .no-print { display:none !important; }
      }
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
    <h2>수강 과목 목록</h2>
    ${courseListHtml}
    <script>
      window.addEventListener('load', () => {
        // Print is triggered by opener for print action.
      });
    </script>
  </body>
</html>`;
  };

  const openPrintWindow = ({ autoClose = false } = {}) => {
    // NOTE:
    // - 일부 브라우저는 새 창에서 onload 이후 print() 호출을 "사용자 제스처"가 아닌 것으로 간주해 막기도 합니다.
    // - 또한 buildTimetableExportHtml()에서 예외가 나면 "빈 탭"만 남습니다.
    // 그래서: (1) 예외를 잡고 (2) 클릭 핸들러 흐름 안에서 최대한 빨리 print()를 호출합니다.
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

      if (autoClose) {
        w.onafterprint = () => {
          try {
            w.close();
          } catch {
            // ignore
          }
        };
      }
    } catch (e) {
      try {
        w.close();
      } catch {
        // ignore
      }
      alert(e?.message || '인쇄 화면을 여는데 실패했습니다.');
    }
  };

  const handlePrint = () => {
    openPrintWindow({ autoClose: false });
  };

  const handleDownloadPdf = async () => {
    try {
      setPdfLoading(true);
      const safeTerm = String(termLabel).replaceAll(/\s+/g, '-').replaceAll(/[^\w\-가-힣]/g, '');
      const filename = `timetable-${safeTerm || 'current'}.pdf`;
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
    const [hour, minute] = time.split(':').map(Number);
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
    return scheduleData.find(course => {
      const startIndex = timeToRowIndex(course.startTime);
      const endIndex = timeToRowIndex(course.endTime);
      return course.day === day && timeIndex >= startIndex && timeIndex < endIndex;
    });
  };

  /**
   * 과목 클릭 핸들러
   */
  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  /**
   * 시간표 셀 렌더링
   */
  const renderScheduleCell = (day, timeIndex) => {
    const course = getCourseAtTime(day, timeIndex);

    if (!course) {
      return <TableCell key={`${day}-${timeIndex}`} sx={{ border: '1px solid #e0e0e0', height: 40 }} />;
    }

    // 이미 렌더링된 셀인지 확인
    const startIndex = timeToRowIndex(course.startTime);
    if (timeIndex !== startIndex) {
      return null; // 이미 rowSpan으로 처리됨
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

  // 총 학점 계산
  const uniqueCourseIds = useMemo(() => [...new Set(scheduleData.map(c => c.id))], [scheduleData]);

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
            <IconButton onClick={handlePrint} disabled={loading || pdfLoading}>
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
            <Button color="inherit" size="small" onClick={reload}>
              다시 시도
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && !error && uniqueCourseIds.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          현재 시간표에 표시할 수강 과목이 없습니다.
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
              {weekDays.map((day) => (
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
                  {weekDays.map(day =>
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

      {/* 과목 목록 카드 */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        수강 과목 목록
      </Typography>
      <Grid container spacing={2}>
        {(loading ? Array.from({ length: 6 }).map((_, i) => `sk-${i}`) : uniqueCourseIds).map(courseId => {
          const course = scheduleData.find(c => c.id === courseId);
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
                            .filter(c => c.id === courseId)
                            .map(c => `${c.day} ${c.startTime}-${c.endTime}`)
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

export default CourseSchedule;
