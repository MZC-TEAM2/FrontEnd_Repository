/**
 * CourseRegistration 페이지
 *
 * MZC 대학교 수강신청 페이지입니다.
 * 학생들이 매 학기 수강신청을 진행할 수 있습니다.
 *
 * 주요 기능:
 * - 개설 과목 목록 조회
 * - 과목 검색 및 필터링
 * - 장바구니 기능
 * - 시간표 미리보기
 * - 수강신청 확정
 */

import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Chip,
  Alert,
} from '@mui/material';

// 컴포넌트
import TabPanel from '../domains/course/components/TabPanel';
import TimeTable from '../domains/course/components/TimeTable';
import CourseSearchFilters from '../domains/course/components/CourseSearchFilters';
import CourseListTable from '../domains/course/components/CourseListTable';
import CartTab from '../domains/course/components/CartTab';
import RegisteredTab from '../domains/course/components/RegisteredTab';
import EnrollmentSummary from '../domains/course/components/EnrollmentSummary';

// 커스텀 훅
import useCourseRegistration from '../domains/course/hooks/useCourseRegistration';

/**
 * CourseRegistration 메인 컴포넌트
 */
const CourseRegistration = () => {
  const {
    tabValue,
    setTabValue,
    searchTerm,
    setSearchTerm,
    selectedDepartment,
    setSelectedDepartment,
    selectedCourseType,
    setSelectedCourseType,
    selectedCredits,
    setSelectedCredits,
    cart,
    registered,
    courses,
    loading,
    error,
    pagination,
    totalCredits,
    registeredCredits,
    handlePageChange,
    addToCart,
    removeFromCart,
    confirmRegistration,
    handleSearchKeyPress,
    setError,
  } = useCourseRegistration();

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        수강신청
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 왼쪽: 과목 목록 및 검색 */}
        <Grid item xs={12} md={7}>
          <Paper 
            sx={{ 
              p: 3,
              height: 'auto',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={(e, val) => setTabValue(val)} 
              sx={{ 
                mb: 3, 
                flexShrink: 0,
                '& .MuiTabs-flexContainer': {
                  justifyContent: 'space-between',
                },
              }}
            >
              <Tab label="개설 과목" sx={{ minWidth: 'auto', mr: 'auto' }} />
              <Box sx={{ display: 'flex' }}>
                <Tab label="장바구니" icon={<Chip label={cart.length} size="small" color="error" />} />
                <Tab label="신청 완료" icon={<Chip label={registered.length} size="small" color="success" />} />
              </Box>
            </Tabs>

            {/* 개설 과목 탭 */}
            <TabPanel value={tabValue} index={0}>
              <CourseSearchFilters
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                onSearchKeyPress={handleSearchKeyPress}
                selectedDepartment={selectedDepartment}
                onDepartmentChange={(e) => setSelectedDepartment(e.target.value)}
                selectedCourseType={selectedCourseType}
                onCourseTypeChange={(e) => setSelectedCourseType(e.target.value)}
                selectedCredits={selectedCredits}
                onCreditsChange={(e) => setSelectedCredits(e.target.value)}
              />

              <CourseListTable
                courses={courses}
                loading={loading}
                pagination={pagination}
                onPageChange={handlePageChange}
                cart={cart}
                registered={registered}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
              />
            </TabPanel>

            {/* 장바구니 탭 */}
            <TabPanel value={tabValue} index={1}>
              <CartTab
                cart={cart}
                totalCredits={totalCredits}
                registeredCredits={registeredCredits}
                onRemoveFromCart={removeFromCart}
                onConfirmRegistration={confirmRegistration}
              />
            </TabPanel>

            {/* 신청 완료 탭 */}
            <TabPanel value={tabValue} index={2}>
              <RegisteredTab registered={registered} />
            </TabPanel>
          </Paper>
        </Grid>

        {/* 오른쪽: 시간표 및 요약 */}
        <Grid item xs={12} md={5}>
          <Grid container spacing={3}>
            {/* 시간표 미리보기 */}
            <Grid item xs={12} lg={6}>
              <Box sx={{ height: '38vh' }}>
                <TimeTable courses={[...registered, ...cart]} isPreview={true} />
              </Box>
            </Grid>

            {/* 학점 요약 */}
            <Grid item xs={12} lg={6}>
              <EnrollmentSummary
                registeredCredits={registeredCredits}
                totalCredits={totalCredits}
                registeredCount={registered.length}
                cartCount={cart.length}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseRegistration;
