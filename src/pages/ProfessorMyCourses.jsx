/**
 * 교수용 내 강의 목록 페이지
 * 
 * 주요 기능:
 * - 내가 담당하는 강의 목록 조회 (카드형)
 * - 강의 상세 정보 조회
 * - 강의별 통계 정보 (수강생 수, 출석률 등)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// API
import { getMyCourses } from '../api/professorApi';
import axiosInstance from '../api/axiosInstance';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * ProfessorMyCourses 컴포넌트
 */
const ProfessorMyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTermId, setCurrentTermId] = useState(null);

  // 시간 포맷 함수 (HH:mm:ss -> HH:mm)
  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5); // "09:00:00" -> "09:00"
  };

  const fetchCurrentTerm = async () => {
    try {
      console.log('📅 현재 학기 조회 중...');
      const response = await axiosInstance.get(`${BASE_URL}/api/v1/enrollments/periods/current`);
      console.log('📅 현재 학기 응답:', response.data);
      
      if (response.data?.success && response.data?.data?.currentPeriod?.term) {
        const term = response.data.data.currentPeriod.term;
        // TODO: 백엔드에 term.id 추가 요청 필요
        // 임시로 DB 데이터 기준 academic_term_id = 1 사용
        const termId = term.id || 1; // term.id가 없으면 1 사용 (임시)
        console.log('✅ 현재 학기 ID:', termId);
        setCurrentTermId(termId);
      } else {
        console.warn('⚠️ 현재 학기 정보 없음, 기본값 1 사용');
        setCurrentTermId(1); // 기본값
      }
    } catch (err) {
      console.error('❌ 현재 학기 조회 실패:', err);
      // 실패해도 기본값으로 진행
      setCurrentTermId(1);
    }
  };

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📚 내 강의 목록 조회 시작... (academicTermId:', currentTermId, ')');
      const response = await getMyCourses({ academicTermId: currentTermId });
      console.log('📥 내 강의 API 응답:', response);
      
      // 응답 형식 확인
      if (response && response.success && response.data) {
        // 새로운 응답 형식: data.courses 배열
        const coursesData = response.data.courses || response.data || [];
        console.log('✅ 강의 데이터:', coursesData);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } else if (Array.isArray(response)) {
        // 응답이 배열로 직접 오는 경우
        console.log('✅ 강의 데이터 (배열):', response);
        setCourses(response);
      } else {
        console.warn('⚠️ 예상치 못한 응답 형식:', response);
        setError(response?.error?.message || response?.message || '강의 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 강의 목록 조회 실패:', err);
      
      // 404 에러인 경우 특별 처리
      if (err.status === 404 || err.response?.status === 404) {
        setError('강의 목록 API가 아직 구현되지 않았습니다. 백엔드 개발이 완료되면 사용할 수 있습니다.');
        setCourses([]);
      } else if (err.status === 403 || err.response?.status === 403) {
        setError('교수 권한이 필요합니다. 교수 계정으로 로그인해주세요.');
      } else if (err.status === 401 || err.response?.status === 401) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
      } else {
        setError(err.message || err.response?.data?.message || '강의 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentTermId]);

  // 현재 학기 조회
  useEffect(() => {
    fetchCurrentTerm();
  }, []);

  // 학기 변경 시 강의 목록 조회
  useEffect(() => {
    if (currentTermId) {
      fetchCourses();
    }
  }, [currentTermId, fetchCourses]);

  const handleManageClick = (courseId) => {
    // 강의 관리 페이지로 이동 (주차 관리, 콘텐츠 관리 등)
    navigate(`/professor/course/${courseId}/manage`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          내 강의
        </Typography>
        <Typography variant="body1" color="text.secondary">
          담당하고 있는 강의 목록을 확인할 수 있습니다.
        </Typography>
      </Box>

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 강의 목록 */}
      {courses.length > 0 ? (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* 강의 정보 */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {course.courseName || course.courseName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.courseCode || course.courseCode} - {course.section || course.section}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* 통계 정보 */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            수강생
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {course.enrollment?.current || 0} / {course.enrollment?.max || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            학점
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {course.credits || 0}학점
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* 상태 및 정보 */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {course.status && (
                      <Chip
                        label={course.status === 'PUBLISHED' ? '개설됨' : course.status === 'DRAFT' ? '초안' : course.status}
                        size="small"
                        color={course.status === 'PUBLISHED' ? 'success' : 'default'}
                      />
                    )}
                    {course.department && (
                      <Chip
                        label={course.department.name || course.department}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {course.courseType && (
                      <Chip
                        label={course.courseType.name || course.courseType}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* 시간표 정보 */}
                  {course.schedule && course.schedule.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        수업 시간
                      </Typography>
                      {course.schedule.map((schedule, idx) => {
                        const dayName = schedule.dayName || 
                          (schedule.dayOfWeek && ['월', '화', '수', '목', '금', '토', '일'][schedule.dayOfWeek - 1]) || 
                          '';
                        return (
                          <Typography key={idx} variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {dayName}
                            {dayName && ' '}
                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            {schedule.classroom && ` (${schedule.classroom})`}
                          </Typography>
                        );
                      })}
                    </Box>
                  )}

                  {/* 설명 */}
                  {course.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {course.description}
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SettingsIcon />}
                    onClick={() => handleManageClick(course.id)}
                    fullWidth
                  >
                    관리
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            등록된 강의가 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            강의 등록 페이지에서 새 강의를 개설하세요
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/professor/courses')}
            size="large"
          >
            강의 등록하기
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default ProfessorMyCourses;

