/**
 * 교수 강의 상세 관리 페이지
 * 
 * 주요 기능:
 * - 강의 기본 정보 표시 및 수정
 * - 주차 관리 (생성, 수정, 삭제)
 * - 콘텐츠 관리
 */

import React, { useState, useEffect } from 'react';
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
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
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
} from '@mui/icons-material';

// 컴포넌트
import WeekManagement from '../domains/professor/components/WeekManagement';
import CourseCreateDialog from '../domains/professor/components/CourseCreateDialog';

// API
import {
  getCourseDetailForProfessor,
  updateCourse,
  getWeeksForProfessor,
  createWeek,
  updateWeek,
  deleteWeek,
  getCurrentCourseRegistrationPeriod,
} from '../api/professorApi';

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

  useEffect(() => {
    fetchCourse();
    fetchWeeks();
    fetchEnrollmentPeriods();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📚 강의 상세 조회 시작... courseId:', courseId);
      const response = await getCourseDetailForProfessor(courseId);
      console.log('📥 강의 상세 API 응답:', response);
      
      if (response && response.success) {
        console.log('✅ 강의 데이터:', response.data);
        setCourse(response.data);
      } else {
        console.error('❌ 강의 조회 실패 (success: false)');
        setError('강의 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 강의 조회 실패:', err);
      setError('강의 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeks = async () => {
    console.log('=== 주차 목록 조회 시작 ===');
    console.log('강의 ID:', courseId);
    
    try {
      const response = await getWeeksForProfessor(courseId);
      console.log('📥 주차 목록 응답:', response);
      
      if (response.success) {
        console.log('✅ 주차 데이터:', response.data);
        if (response.data && response.data.length > 0) {
          response.data.forEach((week, index) => {
            console.log(`주차 ${index + 1}:`, {
              id: week.id,
              weekNumber: week.weekNumber,
              weekTitle: week.weekTitle,
              contentsCount: week.contents?.length || 0,
              contents: week.contents,
            });
          });
        }
        setWeeks(response.data || []);
      }
    } catch (err) {
      console.error('❌ 주차 목록 조회 실패:', err);
    }
    
    console.log('=== 주차 목록 조회 종료 ===');
  };

  const fetchEnrollmentPeriods = async () => {
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
  };

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
    console.log('=== 주차 생성 시작 ===');
    console.log('📤 전송 데이터:', JSON.stringify(weekData, null, 2));
    console.log('강의 ID:', courseId);
    
    try {
      const response = await createWeek(courseId, weekData);
      console.log('📥 응답 데이터:', response);
      
      if (response.success) {
        console.log('✅ 주차 생성 성공:', response.data);
        fetchWeeks();
      } else {
        console.error('❌ 주차 생성 실패 (success: false):', response.error);
        setError(response.error?.message || '주차 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 주차 생성 API 에러:', err);
      console.error('에러 상세:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError('주차 생성에 실패했습니다.');
    }
    
    console.log('=== 주차 생성 종료 ===');
  };

  const handleUpdateWeek = async (weekId, weekData) => {
    console.log('=== 주차 수정 시작 ===');
    console.log('📤 전송 데이터:', JSON.stringify(weekData, null, 2));
    console.log('강의 ID:', courseId, '주차 ID:', weekId);
    
    try {
      const response = await updateWeek(courseId, weekId, weekData);
      console.log('📥 응답 데이터:', response);
      
      if (response.success) {
        console.log('✅ 주차 수정 성공:', response.data);
        fetchWeeks();
      } else {
        console.error('❌ 주차 수정 실패 (success: false):', response.error);
        setError(response.error?.message || '주차 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 주차 수정 API 에러:', err);
      console.error('에러 상세:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError('주차 수정에 실패했습니다.');
    }
    
    console.log('=== 주차 수정 종료 ===');
  };

  const handleDeleteWeek = async (weekId) => {
    console.log('=== 주차 삭제 시작 ===');
    console.log('강의 ID:', courseId, '주차 ID:', weekId);
    
    try {
      const response = await deleteWeek(courseId, weekId);
      console.log('📥 응답 데이터:', response);
      
      if (response.success) {
        console.log('✅ 주차 삭제 성공');
        fetchWeeks();
      } else {
        console.error('❌ 주차 삭제 실패 (success: false):', response.error);
        setError(response.error?.message || '주차 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 주차 삭제 API 에러:', err);
      console.error('에러 상세:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError('주차 삭제에 실패했습니다.');
    }
    
    console.log('=== 주차 삭제 종료 ===');
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
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      수강생: {course.enrollment?.current || course.currentStudents || 0} / {course.enrollment?.max || course.maxStudents || 0}명
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
          <Tab icon={<NotificationsIcon />} label="공지사항" />
          <Tab icon={<AssignmentIcon />} label="과제" />
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
        />
      )}

      {currentTab === 1 && (
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

      {currentTab === 2 && (
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

      {currentTab === 3 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            성적 관리
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            추후 구현 예정
          </Typography>
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

