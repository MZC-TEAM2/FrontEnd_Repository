import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

/**
 * 과목 목록 테이블 컴포넌트
 */
const CourseListTable = ({
  courses,
  loading,
  pagination,
  onPageChange,
  cart,
  registered,
  onAddToCart,
  onRemoveFromCart,
}) => {
  return (
    <Box sx={{ 
      flex: 1, 
      minHeight: 0, 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* 로딩 오버레이 */}
      {loading && (
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 10,
        }}>
          <CircularProgress />
        </Box>
      )}

      {/* 과목 목록 테이블 */}
      <TableContainer 
        sx={{ 
          flex: courses.length > 0 ? '1 1 auto' : '0 0 auto',
          overflow: 'auto',
          minHeight: courses.length === 0 ? '200px' : 'auto',
          opacity: loading ? 0.3 : 1,
          transition: 'opacity 0.2s ease',
          position: 'relative',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#555',
            },
          },
        }}
      >
        <Table 
          stickyHeader
          sx={{
            minWidth: 1000,
            width: '100%',
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 100 }}>과목코드</TableCell>
              <TableCell sx={{ minWidth: 150 }}>과목명</TableCell>
              <TableCell sx={{ minWidth: 100 }}>교수</TableCell>
              <TableCell sx={{ minWidth: 80 }}>학점</TableCell>
              <TableCell sx={{ minWidth: 100 }}>이수구분</TableCell>
              <TableCell sx={{ minWidth: 200 }}>시간/강의실</TableCell>
              <TableCell align="center" sx={{ minWidth: 100 }}>정원</TableCell>
              <TableCell align="center" sx={{ minWidth: 100 }}>신청</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8, minWidth: 1000 }}>
                  <Typography variant="body2" color="text.secondary">
                    조회된 강의가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => {
                const isFull = course.isFull || course.currentStudents >= course.maxStudents;
                const isInCart = cart.find((c) => c.id === course.id);
                const isRegistered = registered.find((c) => c.id === course.id);

                return (
                  <TableRow key={course.id}>
                    <TableCell>{course.subjectCode}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {course.subjectName}
                      </Typography>
                    </TableCell>
                    <TableCell>{course.professor}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>
                      <Chip
                        label={course.courseType}
                        size="small"
                        color={
                          course.courseType.includes('필수') ? 'error' : 'primary'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {course.schedule.map((s) => {
                          const dayMap = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금' };
                          return `${dayMap[s.dayOfWeek] || s.dayName || ''} ${s.startTime}-${s.endTime}`;
                        }).join(', ')}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {course.classroom}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${course.currentStudents}/${course.maxStudents}`}
                        size="small"
                        color={isFull ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {isRegistered ? (
                        <Chip label="신청완료" size="small" color="success" />
                      ) : isInCart ? (
                        <IconButton
                          color="error"
                          onClick={() => onRemoveFromCart(course.id)}
                        >
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="primary"
                          onClick={() => onAddToCart(course)}
                          disabled={isFull || !course.canEnroll}
                        >
                          <AddCircleOutlineIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 페이지네이션 */}
      {pagination.total > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          mt: 2,
          pt: 2,
          pb: 1,
          borderTop: '1px solid #e0e0e0',
          flexShrink: 0,
          minHeight: 56,
          backgroundColor: '#ffffff',
          gap: 1,
        }}>
          <Button
            disabled={pagination.page === 0 || loading}
            onClick={() => onPageChange(pagination.page - 1)}
            size="small"
          >
            이전
          </Button>
          
          {Array.from({ length: pagination.totalPages }, (_, i) => i).map((pageNum) => {
            const currentPage = pagination.page;
            const totalPages = pagination.totalPages;
            
            const showPage = 
              pageNum === 0 ||
              pageNum === totalPages - 1 ||
              (pageNum >= currentPage - 4 && pageNum <= currentPage + 4);
            
            if (!showPage) {
              if (pageNum === currentPage - 5 || pageNum === currentPage + 5) {
                return (
                  <Typography key={pageNum} sx={{ px: 1 }}>...</Typography>
                );
              }
              return null;
            }
            
            return (
              <Button
                key={pageNum}
                variant={pageNum === pagination.page ? 'contained' : 'outlined'}
                onClick={() => onPageChange(pageNum)}
                disabled={loading}
                size="small"
                sx={{
                  minWidth: 40,
                  px: 1,
                }}
              >
                {pageNum + 1}
              </Button>
            );
          })}
          
          <Button
            disabled={pagination.page >= pagination.totalPages - 1 || loading}
            onClick={() => onPageChange(pagination.page + 1)}
            size="small"
          >
            다음
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CourseListTable;
