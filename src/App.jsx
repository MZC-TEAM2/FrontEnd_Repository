/**
 * App 컴포넌트
 *
 * LMS 시스템의 최상위 컴포넌트입니다.
 * Material UI 테마 설정과 라우팅을 관리합니다.
 *
 * 구조:
 * - ThemeProvider: Material UI 커스텀 테마 적용
 * - BrowserRouter: React Router 설정
 * - MainLayout: 전체 레이아웃 (헤더, 사이드바, 콘텐츠)
 *
 * 사용 방법:
 * 1. 새 페이지 추가 시 pages 폴더에 컴포넌트 생성
 * 2. 아래 라우터에 Route 추가
 * 3. Sidebar.jsx의 menuItems에 메뉴 추가
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 테마 Context 임포트
import { ThemeContextProvider } from './contexts/ThemeContext';

// 레이아웃 컴포넌트
import MainLayout from './layouts/MainLayout';

// 페이지 컴포넌트들
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Community from './pages/Community';
import CourseRegistration from './pages/CourseRegistration';
import CourseDetail from './pages/CourseDetail';
import CourseSchedule from './pages/CourseSchedule';
import Grades from './pages/Grades';
import ProfessorCourseManagement from './pages/ProfessorCourseManagement';
import ProfessorMyCourses from './pages/ProfessorMyCourses';
import ProfessorCourseDetail from './pages/ProfessorCourseDetail';
import ProfessorSchedule from './pages/ProfessorSchedule';

// 인증 관련 페이지
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Messages from './pages/Messages';

// 임시 페이지 컴포넌트 (나중에 실제 페이지로 교체)
import { Box, Typography, Paper } from '@mui/material';

// 게시판 컴포넌트
import NoticeBoard from './domains/board/components/notice/NoticeBoard';
import Notice from './domains/board/components/notice/NoticePage';
import NoticeFormPage from './domains/board/components/notice/NoticeFormPage';
import ProfessorBoard from './domains/board/components/professor/ProfessorBoardPage';
import ProfessorPage from './domains/board/components/professor/ProfessorPage';
import ProfessorFormPage from './domains/board/components/professor/ProfessorFormPage';
import StudentBoard from './domains/board/components/student/StudentBoardPage';
import StudentPage from './domains/board/components/student/StudentPage';
import StudentFormPage from './domains/board/components/student/StudentFormPage';
import FreeBoard from './domains/board/components/free/FreeBoardPage';
import FreePage from './domains/board/components/free/FreePage';
import FreeFormPage from './domains/board/components/free/FreeFormPage';
import QuestionBoard from './domains/board/components/question/QuestionBoardPage';
import QuestionPage from './domains/board/components/question/QuestionPage';
import QuestionFormPage from './domains/board/components/question/QuestionFormPage';
import DiscussionBoard from './domains/board/components/discussion/DiscussionBoardPage';
import DiscussionPage from './domains/board/components/discussion/DiscussionPage';
import DiscussionFormPage from './domains/board/components/discussion/DiscussionFormPage';
import DepartmentBoard from './domains/board/components/department/DepartmentBoardPage';
import DepartmentPage from './domains/board/components/department/DepartmentPage';
import DepartmentFormPage from './domains/board/components/department/DepartmentFormPage';
import ContestBoard from './domains/board/components/contest/ContestBoardPage';
import ContestPage from './domains/board/components/contest/ContestPage';
import ContestFormPage from './domains/board/components/contest/ContestFormPage';
import CareerBoard from './domains/board/components/career/CareerBoardPage';
import CareerPage from './domains/board/components/career/CareerPage';
import CareerFormPage from './domains/board/components/career/CareerFormPage';
import AssignmentBoard from './domains/course/components/assignment/AssignmentBoard';
import AssignmentDetailPage from './domains/course/components/assignment/AssignmentDetailPage';
import AssignmentFormPage from './domains/course/components/assignment/AssignmentFormPage';
import AssignmentSubmissionsPage from './domains/course/components/assignment/AssignmentSubmissionsPage';
import ExamBoard from './domains/board/components/exam/ExamBoardPage';
import QuizBoard from './domains/board/components/quiz/QuizBoardPage';
import StudyBoard from './domains/board/components/study/StudyRecruitmentBoardPage';

/**
 * 임시 페이지 컴포넌트
 * 아직 구현되지 않은 페이지를 위한 플레이스홀더
 *
 * @param {string} title - 페이지 제목
 */
const TempPage = ({ title }) => (
  <Box>
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        이 페이지는 아직 준비 중입니다.
      </Typography>
    </Paper>
  </Box>
);

/**
 * App 컴포넌트
 */
function App() {
  return (
    // 테마 Context Provider (다크모드 지원)
    <ThemeContextProvider>
      {/* React Router 설정 */}
      <Router>
        <Routes>
          {/* 인증 관련 라우트 (MainLayout 없음) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 메인 앱 라우트 (MainLayout 포함) */}
          <Route element={<MainLayout />}>
            {/* 기본 경로 - 로그인 페이지로 리다이렉트 */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 대시보드 */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* 강의 관련 라우트 - 순서 중요: 구체적인 경로를 먼저 */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/all" element={<Courses />} />
            <Route path="/courses/my" element={<Courses />} />
            <Route path="/courses/schedule" element={<CourseSchedule />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />

            {/* 수강신청 */}
            <Route path="/registration" element={<CourseRegistration />} />

            {/* 교수용 강의 관리 */}
            <Route path="/professor/courses" element={<ProfessorCourseManagement />} />
            <Route path="/professor/my-courses" element={<ProfessorMyCourses />} />
            <Route path="/professor/schedule" element={<ProfessorSchedule />} />
            <Route path="/professor/course/:courseId/manage" element={<ProfessorCourseDetail />} />

            {/* 과제 */}
            <Route path="/assignments" element={<TempPage title="과제" />} />

            {/* 퀴즈/시험 */}
            <Route path="/exams" element={<TempPage title="퀴즈/시험" />} />

            {/* 커뮤니티 관련 라우트 */}
            <Route path="/notices" element={<NoticeBoard />} />
            <Route path="/notices/create" element={<NoticeFormPage />} />
            <Route path="/notices/:id/edit" element={<NoticeFormPage />} />
            <Route path="/notices/:id" element={<Notice />} />
            
            {/* 자유 게시판 */}
            <Route path="/free" element={<FreeBoard />} />
            <Route path="/free/create" element={<FreeFormPage />} />
            <Route path="/free/:id/edit" element={<FreeFormPage />} />
            <Route path="/free/:id" element={<FreePage />} />
            
            {/* 질문 게시판 */}
            <Route path="/questions" element={<QuestionBoard />} />
            <Route path="/questions/create" element={<QuestionFormPage />} />
            <Route path="/questions/:id/edit" element={<QuestionFormPage />} />
            <Route path="/questions/:id" element={<QuestionPage />} />
            
            {/* 토론 게시판 */}
            <Route path="/discussions" element={<DiscussionBoard />} />
            <Route path="/discussions/create" element={<DiscussionFormPage />} />
            <Route path="/discussions/:id/edit" element={<DiscussionFormPage />} />
            <Route path="/discussions/:id" element={<DiscussionPage />} />
            
            {/* 학과 게시판 */}
            <Route path="/departments" element={<DepartmentBoard />} />
            <Route path="/departments/create" element={<DepartmentFormPage />} />
            <Route path="/departments/:id/edit" element={<DepartmentFormPage />} />
            <Route path="/departments/:id" element={<DepartmentPage />} />

            {/* 교수, 학생 게시판 라우트 (레거시 경로 유지) */}
            <Route path="/boards/professor" element={<ProfessorBoard />} />
            <Route path="/boards/professor/create" element={<ProfessorFormPage />} />
            <Route path="/boards/professor/:id/edit" element={<ProfessorFormPage />} />
            <Route path="/boards/professor/:id" element={<ProfessorPage />} />

            <Route path="/boards/student" element={<StudentBoard />} />
            <Route path="/boards/student/create" element={<StudentFormPage />} />
            <Route path="/boards/student/:id/edit" element={<StudentFormPage />} />
            <Route path="/boards/student/:id" element={<StudentPage />} />

            {/* 공모전 게시판 */}
            <Route path="/contest" element={<ContestBoard />} />
            <Route path="/contest/create" element={<ContestFormPage />} />
            <Route path="/contest/:id/edit" element={<ContestFormPage />} />
            <Route path="/contest/:id" element={<ContestPage />} />

            {/* 취업정보 게시판 */}
            <Route path="/career" element={<CareerBoard />} />
            <Route path="/career/create" element={<CareerFormPage />} />
            <Route path="/career/:id/edit" element={<CareerFormPage />} />
            <Route path="/career/:id" element={<CareerPage />} />

            {/* 과제 라우트 */}
            <Route path="/assignment" element={<AssignmentBoard />} />
            <Route path="/assignment/create" element={<AssignmentFormPage />} />
            <Route path="/assignment/:id/edit" element={<AssignmentFormPage />} />
            <Route path="/assignment/:id/submissions" element={<AssignmentSubmissionsPage />} />
            <Route path="/assignment/:id" element={<AssignmentDetailPage />} />

            {/* 학습자 관리 */}
            <Route path="/students" element={<TempPage title="학습자 관리" />} />

            {/* 성적 조회 */}
            <Route path="/grades" element={<Grades />} />

            {/* 알림 */}
            <Route path="/notifications" element={<Notifications />} />

            {/* 메시지 */}
            <Route path="/messages" element={<Messages />} />

            {/* 프로필 */}
            <Route path="/profile" element={<Profile />} />

            {/* 설정 */}
            <Route path="/settings" element={<Settings />} />

            {/* 404 페이지 */}
            <Route
              path="*"
              element={
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                  <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 700, color: 'primary.main' }}>
                    404
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    페이지를 찾을 수 없습니다
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    요청하신 페이지가 존재하지 않습니다.
                  </Typography>
                </Box>
              }
            />
          </Route>
        </Routes>
      </Router>
    </ThemeContextProvider>
  );
}

export default App;
