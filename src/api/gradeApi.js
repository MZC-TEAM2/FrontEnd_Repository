/**
 * 성적/성적공개(교수) 관련 API
 *
 * - 성적산출기간(GRADE_CALCULATION) 조회
 * - 학기 단위 성적 산출/공개 수동 실행(교수)
 * - (가능하면) 학생 성적 조회 API를 read-only로 재사용
 */

import axiosInstance from './axiosInstance';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 현재 성적산출기간 조회 (GRADE_CALCULATION)
 * GET /api/v1/enrollments/periods/current?type=GRADE_CALCULATION
 */
export const getCurrentGradeCalculationPeriod = async () => {
    const response = await axiosInstance.get(
        `${BASE_URL}/api/v1/enrollments/periods/current?type=GRADE_CALCULATION`
    );
    return response.data;
};

/**
 * 현재 성적공개기간 조회 (GRADE_PUBLISH)
 * GET /api/v1/enrollments/periods/current?type=GRADE_PUBLISH
 */
export const getCurrentGradePublishPeriod = async () => {
    const response = await axiosInstance.get(
        `${BASE_URL}/api/v1/enrollments/periods/current?type=GRADE_PUBLISH`
    );
    return response.data;
};

/**
 * 학기 목록 조회 (학생, 성적 조회용)
 * GET /api/v1/student/academic-terms
 */
export const getStudentAcademicTerms = async () => {
    const response = await axiosInstance.get(`${BASE_URL}/api/v1/student/academic-terms`);
    return response.data;
};

/**
 * 학기 목록 조회 (교수, 지난 학기 강의/성적 조회용)
 * GET /api/v1/professor/academic-terms
 */
export const getProfessorAcademicTerms = async () => {
    const response = await axiosInstance.get(`${BASE_URL}/api/v1/professor/academic-terms`);
    return response.data;
};

/**
 * 성적 조회 (학생, 공개된 성적만)
 * GET /api/v1/student/grades?academicTermId={academicTermId}
 */
export const getStudentGrades = async (academicTermId = null) => {
    const response = await axiosInstance.get(`${BASE_URL}/api/v1/student/grades`, {
        params: academicTermId ? {academicTermId} : {},
    });
    return response.data;
};

/**
 * 종료된 성적산출기간 대상 일괄 산출/공개(교수)
 * POST /api/v1/professor/grades/publish-ended-terms
 */
export const publishEndedTermsGrades = async () => {
    const response = await axiosInstance.post(
        `${BASE_URL}/api/v1/professor/grades/publish-ended-terms`
    );
    return response.data;
};

/**
 * 특정 학기 산출/공개(교수)
 * POST /api/v1/professor/grades/publish/terms/{academicTermId}
 */
export const publishGradesForTerm = async (academicTermId) => {
    const response = await axiosInstance.post(
        `${BASE_URL}/api/v1/professor/grades/publish/terms/${academicTermId}`
    );
    return response.data;
};

/**
 * 담당 강의 수강생 성적 전체 조회 (교수)
 * GET /api/v1/professor/courses/{courseId}/grades?status=ALL|PUBLISHED
 */
export const getCourseGradesForProfessor = async (courseId, status = 'ALL') => {
    const response = await axiosInstance.get(`${BASE_URL}/api/v1/professor/courses/${courseId}/grades`, {
        params: {status},
    });
    return response.data;
};

/**
 * 특정 강의 성적 산출(점수 계산) 수동 실행 (교수)
 * POST /api/v1/professor/courses/{courseId}/grades/calculate
 */
export const calculateGradesForCourse = async (courseId) => {
    const response = await axiosInstance.post(
        `${BASE_URL}/api/v1/professor/courses/${courseId}/grades/calculate`
    );
    return response.data;
};

/**
 * 특정 강의 성적 공개(등급 확정) 수동 실행 (교수)
 * POST /api/v1/professor/courses/{courseId}/grades/publish
 */
export const publishGradesForCourse = async (courseId) => {
    const response = await axiosInstance.post(
        `${BASE_URL}/api/v1/professor/courses/${courseId}/grades/publish`
    );
    return response.data;
};


