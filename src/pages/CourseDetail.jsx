/**
 * CourseDetail 페이지
 *
 * MZC 대학교 LMS 시스템의 과목 상세 페이지입니다.
 * 특정 과목의 주차별 강의, 과제, 공지사항, 질의응답을 확인할 수 있습니다.
 *
 * 주요 기능:
 * - 주차별 강의 콘텐츠 표시
 * - 과제 목록 및 제출 현황
 * - 공지사항 확인
 * - 질의응답 게시판
 * - 학습 진도율 표시
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  Alert,
  Badge,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
} from '@mui/material';

// 아이콘 임포트
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ForumIcon from '@mui/icons-material/Forum';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import GetAppIcon from '@mui/icons-material/GetApp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import CreateIcon from '@mui/icons-material/Create';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';

/**
 * 탭 패널 컴포넌트
 * 탭 전환 시 콘텐츠를 표시하는 컨테이너
 */
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

/**
 * CourseDetail 컴포넌트
 */
const CourseDetail = () => {
  const { courseId } = useParams(); // URL에서 courseId 가져오기
  const navigate = useNavigate();

  // 현재 선택된 탭
  const [currentTab, setCurrentTab] = useState(0);

  // 질의응답 검색어
  const [searchQuery, setSearchQuery] = useState('');

  // 확장된 주차 관리 (아코디언용)
  const [expandedWeek, setExpandedWeek] = useState('week-8');

  /**
   * 예시 과목 데이터
   * 실제로는 API를 통해 courseId로 데이터를 가져옴
   */
  const courseData = {
    id: 'CS301',
    name: '데이터베이스',
    professor: '김교수',
    credits: 3,
    type: '전공필수',
    semester: '2024년 2학기',
    schedule: '월/수 10:30-12:00',
    classroom: '공학관 301호',
    totalStudents: 45,
    description: '관계형 데이터베이스의 기본 개념과 SQL, 데이터베이스 설계 및 구현을 학습합니다.',
    progress: 50, // 전체 진도율
    currentWeek: 8,
    totalWeeks: 16,
  };

  /**
   * 주차별 강의 콘텐츠
   */
  const weeklyContent = [
    {
      week: 1,
      title: '데이터베이스 개요',
      completed: true,
      lectures: [
        { id: 1, title: '데이터베이스 시스템의 개념', duration: '45:23', completed: true, type: 'video' },
        { id: 2, title: '데이터베이스 관리 시스템', duration: '38:15', completed: true, type: 'video' },
        { id: 3, title: '강의노트 - 1주차', completed: true, type: 'document' },
      ],
    },
    {
      week: 2,
      title: '관계형 데이터 모델',
      completed: true,
      lectures: [
        { id: 4, title: '관계형 모델의 기본 개념', duration: '42:30', completed: true, type: 'video' },
        { id: 5, title: '관계 대수와 관계 해석', duration: '35:45', completed: true, type: 'video' },
        { id: 6, title: '실습 자료', completed: true, type: 'document' },
      ],
    },
    {
      week: 3,
      title: 'SQL 기초',
      completed: true,
      lectures: [
        { id: 7, title: 'SQL 소개 및 데이터 정의어', duration: '40:20', completed: true, type: 'video' },
        { id: 8, title: 'SELECT 문 기초', duration: '38:50', completed: true, type: 'video' },
        { id: 9, title: 'SQL 실습 문제', completed: true, type: 'document' },
      ],
    },
    {
      week: 4,
      title: 'SQL 고급',
      completed: true,
      lectures: [
        { id: 10, title: 'JOIN 연산', duration: '45:10', completed: true, type: 'video' },
        { id: 11, title: '서브쿼리와 집합 연산', duration: '42:30', completed: true, type: 'video' },
        { id: 12, title: '고급 SQL 실습', completed: true, type: 'document' },
      ],
    },
    {
      week: 5,
      title: '데이터베이스 설계 1',
      completed: true,
      lectures: [
        { id: 13, title: 'ER 모델링', duration: '43:25', completed: true, type: 'video' },
        { id: 14, title: 'ER 다이어그램 작성법', duration: '35:40', completed: true, type: 'video' },
        { id: 15, title: 'ER 모델링 실습', completed: true, type: 'document' },
      ],
    },
    {
      week: 6,
      title: '데이터베이스 설계 2',
      completed: true,
      lectures: [
        { id: 16, title: '정규화 이론', duration: '48:15', completed: true, type: 'video' },
        { id: 17, title: '함수적 종속성', duration: '40:30', completed: true, type: 'video' },
        { id: 18, title: '정규화 실습 문제', completed: true, type: 'document' },
      ],
    },
    {
      week: 7,
      title: '트랜잭션 관리',
      completed: true,
      lectures: [
        { id: 19, title: '트랜잭션의 개념', duration: '42:20', completed: true, type: 'video' },
        { id: 20, title: 'ACID 속성', duration: '38:45', completed: true, type: 'video' },
        { id: 21, title: '트랜잭션 실습', completed: true, type: 'document' },
      ],
    },
    {
      week: 8,
      title: '중간고사',
      completed: false,
      current: true,
      lectures: [
        { id: 22, title: '중간고사 대비 정리', duration: '55:30', completed: true, type: 'video' },
        { id: 23, title: '중간고사 기출문제', completed: false, type: 'document' },
        { id: 24, title: '중간고사 안내', completed: false, type: 'document' },
      ],
    },
    {
      week: 9,
      title: '동시성 제어',
      completed: false,
      locked: true,
      lectures: [
        { id: 25, title: '동시성 제어의 필요성', duration: '40:00', completed: false, type: 'video' },
        { id: 26, title: '락킹 프로토콜', duration: '42:00', completed: false, type: 'video' },
      ],
    },
    {
      week: 10,
      title: '회복 시스템',
      completed: false,
      locked: true,
      lectures: [
        { id: 27, title: '회복 시스템 개요', duration: '38:00', completed: false, type: 'video' },
        { id: 28, title: '로그 기반 회복', duration: '40:00', completed: false, type: 'video' },
      ],
    },
  ];

  /**
   * 과제 목록
   */
  const assignments = [
    {
      id: 1,
      title: 'SQL 기초 실습',
      dueDate: '2024-10-05 23:59',
      status: 'submitted',
      score: '95/100',
      week: 3,
    },
    {
      id: 2,
      title: 'ER 다이어그램 설계',
      dueDate: '2024-10-12 23:59',
      status: 'submitted',
      score: '88/100',
      week: 5,
    },
    {
      id: 3,
      title: '정규화 실습',
      dueDate: '2024-10-19 23:59',
      status: 'pending',
      score: null,
      week: 6,
    },
    {
      id: 4,
      title: '트랜잭션 시뮬레이션',
      dueDate: '2024-10-26 23:59',
      status: 'not_submitted',
      score: null,
      week: 7,
    },
  ];

  /**
   * 공지사항
   */
  const notices = [
    {
      id: 1,
      title: '중간고사 일정 안내',
      content: '중간고사는 10월 15일 10:00-11:30에 공학관 301호에서 진행됩니다.',
      date: '2024-10-08',
      important: true,
      author: '김교수',
    },
    {
      id: 2,
      title: '6주차 보강 수업 안내',
      content: '공휴일로 인한 보강 수업은 10월 10일 저녁 7시에 온라인으로 진행됩니다.',
      date: '2024-10-05',
      important: false,
      author: '김교수',
    },
    {
      id: 3,
      title: '과제 제출 기한 연장',
      content: 'ER 다이어그램 설계 과제 제출 기한이 10월 12일에서 10월 14일로 연장되었습니다.',
      date: '2024-10-03',
      important: false,
      author: '김교수',
    },
    {
      id: 4,
      title: '실습실 이용 안내',
      content: '데이터베이스 실습실(공학관 501호)은 평일 09:00-21:00까지 자유롭게 이용 가능합니다.',
      date: '2024-09-28',
      important: false,
      author: '조교',
    },
  ];

  /**
   * 질의응답 게시글
   */
  const qnaList = [
    {
      id: 1,
      title: 'JOIN 연산에서 INNER JOIN과 OUTER JOIN의 차이점이 궁금합니다',
      author: '이학생',
      date: '2024-10-08',
      replies: 3,
      views: 45,
      answered: true,
    },
    {
      id: 2,
      title: '정규화 과정에서 BCNF와 3NF의 차이가 무엇인가요?',
      author: '박학생',
      date: '2024-10-07',
      replies: 2,
      views: 32,
      answered: true,
    },
    {
      id: 3,
      title: '트랜잭션 격리 수준에 대해 질문드립니다',
      author: '김학생',
      date: '2024-10-06',
      replies: 1,
      views: 28,
      answered: false,
    },
    {
      id: 4,
      title: 'SQL 실습 환경 설정 관련 문의',
      author: '최학생',
      date: '2024-10-05',
      replies: 5,
      views: 67,
      answered: true,
    },
  ];

  /**
   * 탭 변경 핸들러
   */
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  /**
   * 주차 확장 핸들러 (아코디언)
   */
  const handleWeekExpand = (week) => (event, isExpanded) => {
    setExpandedWeek(isExpanded ? week : false);
  };

  /**
   * 과제 상태에 따른 색상 반환
   */
  const getAssignmentColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'success';
      case 'pending':
        return 'warning';
      case 'not_submitted':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * 과제 상태 텍스트
   */
  const getAssignmentStatusText = (status) => {
    switch (status) {
      case 'submitted':
        return '제출 완료';
      case 'pending':
        return '채점 중';
      case 'not_submitted':
        return '미제출';
      default:
        return '';
    }
  };

  return (
    <Container maxWidth="xl">
      {/* 과목 헤더 */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {courseData.id} - {courseData.name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
              {courseData.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<PersonIcon />}
                label={courseData.professor}
                sx={{ bgcolor: 'white', color: 'primary.main' }}
              />
              <Chip
                icon={<CalendarTodayIcon />}
                label={courseData.schedule}
                sx={{ bgcolor: 'white', color: 'primary.main' }}
              />
              <Chip
                icon={<GroupIcon />}
                label={`${courseData.totalStudents}명`}
                sx={{ bgcolor: 'white', color: 'primary.main' }}
              />
              <Chip
                icon={<MenuBookIcon />}
                label={`${courseData.credits}학점`}
                sx={{ bgcolor: 'white', color: 'primary.main' }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'white' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  학습 진도율
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {courseData.progress}%
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                    {courseData.currentWeek}주차 / {courseData.totalWeeks}주
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={courseData.progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* 탭 네비게이션 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            icon={<PlayCircleOutlineIcon />}
            label="주차별 강의"
            iconPosition="start"
          />
          <Tab
            icon={
              <Badge badgeContent={1} color="error">
                <AssignmentIcon />
              </Badge>
            }
            label="과제"
            iconPosition="start"
          />
          <Tab
            icon={
              <Badge badgeContent={1} color="primary">
                <NotificationsIcon />
              </Badge>
            }
            label="공지사항"
            iconPosition="start"
          />
          <Tab
            icon={<ForumIcon />}
            label="질의응답"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* 주차별 강의 탭 */}
      <TabPanel value={currentTab} index={0}>
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            현재 {courseData.currentWeek}주차 수업이 진행 중입니다.
          </Alert>
        </Box>

        {weeklyContent.map((week) => (
          <Accordion
            key={`week-${week.week}`}
            expanded={expandedWeek === `week-${week.week}`}
            onChange={handleWeekExpand(`week-${week.week}`)}
            sx={{
              mb: 1,
              '&:before': { display: 'none' },
              boxShadow: week.current ? 2 : 1,
              border: week.current ? '2px solid' : '1px solid',
              borderColor: week.current ? 'primary.main' : 'divider',
            }}
            disabled={week.locked}
          >
            <AccordionSummary
              expandIcon={week.locked ? <LockIcon /> : <ExpandMoreIcon />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  justifyContent: 'space-between',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: week.completed ? 'success.main' : week.current ? 'primary.main' : 'grey.400',
                    width: 32,
                    height: 32,
                  }}
                >
                  {week.week}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: week.current ? 600 : 400 }}>
                  {week.week}주차: {week.title}
                </Typography>
                {week.current && (
                  <Chip label="진행 중" color="primary" size="small" />
                )}
              </Box>
              {!week.locked && (
                <Typography variant="body2" color="text.secondary">
                  {week.lectures.filter(l => l.completed).length} / {week.lectures.length} 완료
                </Typography>
              )}
            </AccordionSummary>

            {!week.locked && (
              <AccordionDetails>
                <List>
                  {week.lectures.map((lecture, index) => (
                    <React.Fragment key={lecture.id}>
                      <ListItem
                        button
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: lecture.completed ? 'success.lighter' : 'background.paper',
                        }}
                      >
                        <ListItemIcon>
                          {lecture.completed ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <RadioButtonUncheckedIcon />
                          )}
                        </ListItemIcon>
                        <ListItemIcon>
                          {lecture.type === 'video' ? (
                            <PlayCircleOutlineIcon />
                          ) : (
                            <AttachFileIcon />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={lecture.title}
                          secondary={lecture.duration || '학습 자료'}
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end">
                            <VisibilityIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < week.lectures.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </AccordionDetails>
            )}
          </Accordion>
        ))}
      </TabPanel>

      {/* 과제 탭 */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          {assignments.map((assignment) => (
            <Grid item xs={12} md={6} key={assignment.id}>
              <Card
                sx={{
                  height: '100%',
                  borderLeft: 4,
                  borderColor: `${getAssignmentColor(assignment.status)}.main`,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {assignment.title}
                    </Typography>
                    <Chip
                      label={getAssignmentStatusText(assignment.status)}
                      color={getAssignmentColor(assignment.status)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {assignment.week}주차 과제
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        마감일: {assignment.dueDate}
                      </Typography>
                    </Box>
                  </Box>

                  {assignment.score && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        점수
                      </Typography>
                      <Typography variant="h5" color="primary">
                        {assignment.score}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {assignment.status === 'not_submitted' ? (
                      <Button variant="contained" fullWidth startIcon={<CreateIcon />}>
                        과제 제출
                      </Button>
                    ) : (
                      <Button variant="outlined" fullWidth startIcon={<VisibilityIcon />}>
                        제출물 확인
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* 공지사항 탭 */}
      <TabPanel value={currentTab} index={2}>
        <List>
          {notices.map((notice, index) => (
            <React.Fragment key={notice.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  bgcolor: notice.important ? 'warning.lighter' : 'background.paper',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {notice.important && (
                        <Chip label="중요" color="warning" size="small" />
                      )}
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {notice.title}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                        {notice.content}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          작성자: {notice.author}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notice.date}
                        </Typography>
                      </Box>
                    </>
                  }
                />
              </ListItem>
              {index < notices.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </TabPanel>

      {/* 질의응답 탭 */}
      <TabPanel value={currentTab} index={3}>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={10}>
              <TextField
                fullWidth
                placeholder="질문 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<CreateIcon />}
                sx={{ height: '100%' }}
              >
                질문하기
              </Button>
            </Grid>
          </Grid>
        </Box>

        <List>
          {qnaList.map((qna, index) => (
            <React.Fragment key={qna.id}>
              <ListItem
                button
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {qna.answered && (
                        <Chip
                          label="답변완료"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {qna.title}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {qna.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {qna.date}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        답변 {qna.replies}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        조회 {qna.views}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < qnaList.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </TabPanel>
    </Container>
  );
};

export default CourseDetail;