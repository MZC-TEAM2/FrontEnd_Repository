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
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

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
    clearAllCarts,
    confirmRegistration,
    handleSearchKeyPress,
    handleEnroll,
    setError,
    toast,
    setToast,
  } = useCourseRegistration();

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        수강신청
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box>
        {/* 위쪽: 과목 목록 및 검색 */}
        <Paper 
          sx={{ 
            p: 3,
            mb: 3,
            height: 'auto',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            width: '100%',
            maxWidth: '100%',
          }}
        >
            <Tabs 
              value={tabValue} 
              onChange={(e, val) => {
                setTabValue(val);
              }}
              sx={{ 
                mb: 3,
                flexShrink: 0,
                '& .MuiTabs-flexContainer': {
                  justifyContent: 'space-between',
                },
              }}
            >
              <Tab label="개설 과목" sx={{ mr: 'auto' }} />
              <Tab 
                label="장바구니"
                icon={<Chip label={cart.length} size="small" color="warning" sx={{ pointerEvents: 'none' }} />}
                iconPosition="end"
              />
              <Tab 
                label="신청 완료"
                icon={<Chip label={registered.length} size="small" color="success" sx={{ pointerEvents: 'none' }} />}
                iconPosition="end"
              />
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
                onEnroll={handleEnroll}
              />
            </TabPanel>

            {/* 장바구니 탭 */}
            <TabPanel value={tabValue} index={1}>
              <CartTab
                cart={cart}
                totalCredits={totalCredits}
                registeredCredits={registeredCredits}
                onRemoveFromCart={removeFromCart}
                onClearAllCarts={clearAllCarts}
                onConfirmRegistration={confirmRegistration}
              />
            </TabPanel>

            {/* 신청 완료 탭 */}
            <TabPanel value={tabValue} index={2}>
              <RegisteredTab registered={registered} />
            </TabPanel>
          </Paper>

        {/* 아래쪽: 시간표 및 요약 */}
        <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
          {/* 시간표 미리보기 */}
          <Box sx={{ flex: 2.5, width: '100%' }}>
            <TimeTable 
              courses={[...registered, ...cart]} 
              isPreview={true}
              registeredIds={registered.map(c => c.id)}
            />
          </Box>

          {/* 학점 요약 */}
          <Box sx={{ flex: 0.8  }}>
            <EnrollmentSummary
              registeredCredits={registeredCredits}
              totalCredits={totalCredits}
              registeredCount={registered.length}
              cartCount={cart.length}
            />
          </Box>
        </Box>
      </Box>

      {/* 토스트 메시지 */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default CourseRegistration;
