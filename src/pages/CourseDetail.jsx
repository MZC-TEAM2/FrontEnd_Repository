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

import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  ListItemIcon,
  ListItemText,
  Paper,
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

import useStudentCourseDetail from '../domains/course/hooks/useStudentCourseDetail';
import { formatScheduleTime } from '../domains/course/utils/scheduleUtils';
import authService from '../services/authService';

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
  const [currentTab, setCurrentTab] = useState(0);
  const [expandedWeek, setExpandedWeek] = useState(false);

  const { loading, error, courseMeta, detail, weeks, weeksNotFound, reload } = useStudentCourseDetail(courseId);

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
          onChange={(_e, v) => setCurrentTab(v)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<PlayCircleOutlineIcon />} label="주차별 강의" iconPosition="start" />
          <Tab icon={<NotificationsIcon />} label="공지사항" iconPosition="start" />
          <Tab icon={<AssignmentIcon />} label="과제" iconPosition="start" />
          <Tab icon={<QuizIcon />} label="퀴즈" iconPosition="start" />
          <Tab icon={<FactCheckIcon />} label="시험" iconPosition="start" />
          <Tab icon={<AssessmentIcon />} label="성적" iconPosition="start" />
        </Tabs>
      </Paper>

      <TabPanel value={currentTab} index={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : weeksNotFound ? (
          <Alert severity="warning">
            주차/콘텐츠 API가 아직 준비되지 않았거나(404), 백엔드 경로가 스펙과 다를 수 있어요. 최신 명세(12.1)는
            `GET /api/v1/professor/courses/{'{courseId}'}/weeks`(교수/수강중 학생 공통) 입니다.
          </Alert>
        ) : weeks.length === 0 ? (
          <Alert severity="info">등록된 주차/콘텐츠가 없습니다.</Alert>
        ) : (
          weeks.map((week) => {
            const weekKey = `week-${week.weekNumber}`;
            const contents = week.contents || [];
            const completedCount = contents.filter((c) => c.progress?.isCompleted).length;
            return (
              <Accordion
                key={weekKey}
                expanded={expandedWeek === weekKey}
                onChange={handleWeekExpand(weekKey)}
                sx={{ mb: 1, '&:before': { display: 'none' } }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {week.weekTitle || `${week.weekNumber}주차`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {completedCount} / {contents.length} 완료
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {contents.length === 0 ? (
                    <Alert severity="info">등록된 콘텐츠가 없습니다.</Alert>
                  ) : (
                    <List>
                      {contents.map((content, idx) => {
                        const isCompleted = !!content.progress?.isCompleted;
                        const isVideo = content.contentType === 'VIDEO';
                        return (
                          <React.Fragment key={content.id}>
                            <ListItem
                              sx={{
                                borderRadius: 1,
                                mb: 1,
                                bgcolor: isCompleted ? 'success.lighter' : 'background.paper',
                              }}
                              secondaryAction={
                                <IconButton
                                  edge="end"
                                  onClick={() => handleOpenContent(content)}
                                  title="보기"
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              }
                            >
                              <ListItemIcon>
                                {isCompleted ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon />}
                              </ListItemIcon>
                              <ListItemIcon>
                                {isVideo ? <PlayCircleOutlineIcon /> : <AttachFileIcon />}
                              </ListItemIcon>
                              <ListItemText
                                primary={content.title}
                                secondary={content.duration || content.contentType || '자료'}
                              />
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

      {[
        { index: 1, icon: <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />, title: '공지사항' },
        { index: 2, icon: <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />, title: '과제' },
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              (보기 전용) API 연동 예정
            </Typography>
          </Paper>
        </TabPanel>
      ))}
    </Container>
  );
}


