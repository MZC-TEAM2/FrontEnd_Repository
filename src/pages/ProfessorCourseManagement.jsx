/**
 * 교수용 강의 관리 페이지
 *
 * 주요 기능:
 * - 내가 담당하는 강의 목록 조회 (카드형)
 * - 새 강의 개설
 * - 강의 수정/삭제
 * - 주차 관리
 */

import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Box, Button, CircularProgress, Container, Grid, Paper, Typography,} from '@mui/material';
import {Add as AddIcon,} from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// 컴포넌트
import CourseCard from '../domains/professor/components/CourseCard';
import CourseCreateDialog from '../domains/professor/components/CourseCreateDialog';
import ErrorDialog from '../components/ErrorDialog';

// API
import {createCourse, deleteCourse, getCurrentCourseRegistrationPeriod, getMyCourses,} from '../api/professorApi';
import axiosInstance from '../api/axiosInstance';
import {useNavigate} from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * ProfessorCourseManagement 컴포넌트
 */
const ProfessorCourseManagement = () => {
    const navigate = useNavigate();
    // const navigate = useNavigate(); // 현재 파일에서 사용하지 않음
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorDetails, setErrorDetails] = useState(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [enrollmentPeriods, setEnrollmentPeriods] = useState([]);

    const fetchCourses = useCallback(async (academicTermId) => {
        try {
            setLoading(true);
            setError(null);
            const response =
                academicTermId !== null && academicTermId !== undefined
                    ? await getMyCourses({academicTermId})
                    : await getMyCourses();

            // 응답 형식 확인
            if (response && response.success && response.data) {
                // 새로운 응답 형식: data.courses 배열
                const coursesData = response.data.courses || response.data || [];
                setCourses(Array.isArray(coursesData) ? coursesData : []);
            } else if (Array.isArray(response)) {
                // 응답이 배열로 직접 오는 경우
                setCourses(response);
            } else {
                setError(response?.error?.message || response?.message || '강의 목록을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('강의 목록 조회 실패:', err);

            // 404 에러인 경우 특별 처리
            if (err.status === 404 || err.response?.status === 404) {
                setError('강의 목록 API가 아직 구현되지 않았습니다. 백엔드 개발이 완료되면 사용할 수 있습니다.');
                setCourses([]); // 빈 배열로 설정하여 UI가 정상적으로 표시되도록
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
    }, []);

    const fetchCurrentTerm = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/api/v1/enrollments/periods/current`);
            const term = response.data?.data?.currentPeriod?.term;
            const termId = term?.id ?? null;
            await fetchCourses(termId);
        } catch (err) {
            console.error('현재 학기 조회 실패:', err);
            await fetchCourses(undefined);
        }
    }, [fetchCourses]);

    // 학기 변경 시 강의 목록 조회는 fetchCurrentTerm에서 함께 처리

    // 현재 학기 조회
    useEffect(() => {
        fetchCurrentTerm();
        fetchEnrollmentPeriods();
    }, [fetchCurrentTerm]);

    const fetchEnrollmentPeriods = async () => {
        try {
            const response = await getCurrentCourseRegistrationPeriod();
            if (response.success && response.data?.currentPeriod) {
                // 강의 등록 기간만 배열로 변환
                setEnrollmentPeriods([response.data.currentPeriod]);
            } else {
                // 강의 등록 기간이 아닌 경우
                setEnrollmentPeriods([]);
                if (response.error?.code === 'COURSE_REGISTRATION_PERIOD_NOT_ACTIVE') {
                    setError('현재 강의 등록 기간이 아닙니다. 강의 등록 기간에만 새 강의를 개설할 수 있습니다.');
                }
            }
        } catch (err) {
            console.error('강의 등록 기간 조회 실패:', err);
            setEnrollmentPeriods([]);
        }
    };

    const handleManageCourse = (courseId) => {
        navigate(`/professor/course/${courseId}/manage`);
    };

    const handleCreateCourse = async (courseData) => {

        try {
            const response = await createCourse(courseData);

            if (response.success) {
                setCreateDialogOpen(false);
                fetchCourses(); // 목록 새로고침
            } else {
                // 에러 다이얼로그 표시
                setErrorDetails({
                    code: response.error?.code,
                    message: response.error?.message || '강의 등록에 실패했습니다.',
                    details: response.error?.details,
                });
                setErrorDialogOpen(true);
                setCreateDialogOpen(false);
            }
        } catch (err) {
            console.error('❌ 강의 등록 API 에러:', err);
            console.error('에러 상세:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });

            // API 에러 응답 파싱
            const errorResponse = err.response?.data;
            setErrorDetails({
                code: errorResponse?.error?.code || `HTTP_${err.response?.status || 'ERROR'}`,
                message: errorResponse?.error?.message || errorResponse?.message || err.message || '강의 등록에 실패했습니다.',
                details: errorResponse?.error?.details || null,
            });
            setErrorDialogOpen(true);
            setCreateDialogOpen(false);
        }

    };

    const handleDeleteCourse = async (course) => {
        if (!window.confirm(`정말 "${course.courseName}" 강의를 삭제하시겠습니까?`)) {
            return;
        }

        try {
            const response = await deleteCourse(course.id);
            if (response.success) {
                fetchCourses(); // 목록 새로고침
            } else {
                setError(response.error?.message || '강의 삭제에 실패했습니다.');
            }
        } catch (err) {
            console.error('강의 삭제 실패:', err);
            setError('강의 삭제에 실패했습니다.');
        }
    };


    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px'}}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            {/* 헤더 */}
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4}}>
                <Typography variant="h4" sx={{fontWeight: 600}}>
                    강의 등록
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon/>}
                    onClick={() => setCreateDialogOpen(true)}
                    size="large"
                >
                    새 강의 개설
                </Button>
            </Box>

            {/* 에러 메시지 */}
            {error && (
                <Alert severity="error" sx={{mb: 3}} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* 강의 목록 */}
            {courses.length > 0 ? (
                <Grid container spacing={3}>
                    {courses.map((course) => (
                        <Grid size={{xs: 12, sm: 6, md: 4}} key={course.id}>
                            <CourseCard
                                course={course}
                                onManage={handleManageCourse}
                                onDelete={handleDeleteCourse}
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{p: 6, textAlign: 'center'}}>
                    <Typography variant="h6" color="text.secondary" sx={{mb: 2}}>
                        등록된 강의가 없습니다
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                        새 강의를 개설하여 시작하세요
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={() => setCreateDialogOpen(true)}
                        size="large"
                        disabled={enrollmentPeriods.length === 0}
                    >
                        새 강의 개설
                    </Button>
                    {enrollmentPeriods.length === 0 && (
                        <Typography variant="body2" color="error" sx={{mt: 2}}>
                            현재 강의 등록 기간이 아닙니다. 강의 등록 기간에만 새 강의를 개설할 수 있습니다.
                        </Typography>
                    )}
                </Paper>
            )}

            {/* 강의 등록 다이얼로그 */}
            <CourseCreateDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSubmit={handleCreateCourse}
                enrollmentPeriods={enrollmentPeriods}
                disabled={enrollmentPeriods.length === 0}
            />

            {/* 에러 다이얼로그 */}
            <ErrorDialog
                open={errorDialogOpen}
                onClose={() => {
                    setErrorDialogOpen(false);
                    setErrorDetails(null);
                }}
                error={errorDetails || {}}
                title="강의 등록 실패"
            />
        </Container>
    );
};

export default ProfessorCourseManagement;

