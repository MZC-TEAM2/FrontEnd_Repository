/**
 * 교수용 내 강의 목록 페이지
 *
 * 주요 기능:
 * - 내가 담당하는 강의 목록 조회 (카드형)
 * - 강의 상세 정보 조회
 * - 강의별 통계 정보 (수강생 수, 출석률 등)
 */

import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Box, Button, CircularProgress, Container, Grid, Paper, Typography,} from '@mui/material';
import {School as SchoolIcon,} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import CourseCard from '../domains/professor/components/CourseCard';

// API
import {getMyCourses} from '../api/professorApi';
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

    const fetchCourses = useCallback(async (academicTermId) => {
        try {
            setLoading(true);
            setError(null);

            // term.id(academicTermId)가 없을 수도 있으므로, 없으면 파라미터 없이 조회(백엔드 기본 현재학기)
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
    }, []);

    const fetchCurrentTerm = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/api/v1/enrollments/periods/current`);
            const term = response.data?.data?.currentPeriod?.term;
            const termId = term?.id ?? null;
            await fetchCourses(termId);
        } catch (err) {
            console.error('❌ 현재 학기 조회 실패:', err);
            await fetchCourses(undefined);
        }
    }, [fetchCourses]);

    // 현재 학기 조회
    useEffect(() => {
        fetchCurrentTerm();
    }, [fetchCurrentTerm]);

    // 학기 변경 시 강의 목록 조회는 fetchCurrentTerm에서 함께 처리

    const handleManageClick = (courseId) => {
        // 강의 관리 페이지로 이동 (주차 관리, 콘텐츠 관리 등)
        navigate(`/professor/course/${courseId}/manage`);
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
            <Box sx={{mb: 4}}>
                <Typography variant="h4" sx={{fontWeight: 600, mb: 1}}>
                    내 강의
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    담당하고 있는 강의 목록을 확인할 수 있습니다.
                </Typography>
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
                            <CourseCard course={course} onManage={handleManageClick}/>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{p: 6, textAlign: 'center'}}>
                    <SchoolIcon sx={{fontSize: 64, color: 'text.secondary', mb: 2}}/>
                    <Typography variant="h6" color="text.secondary" sx={{mb: 2}}>
                        등록된 강의가 없습니다
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
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

