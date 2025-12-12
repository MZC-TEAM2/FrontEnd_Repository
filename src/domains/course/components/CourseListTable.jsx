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
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import { formatScheduleTime } from '../utils/scheduleUtils';

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
  onEnroll,
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
            width: '100%',
            tableLayout: 'fixed',
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '8%', px: 1 }}>과목코드</TableCell>
              <TableCell sx={{ width: '14%', px: 1 }}>과목명</TableCell>
              <TableCell sx={{ width: '7%', px: 1 }}>교수</TableCell>
              <TableCell sx={{ width: '5%', px: 1 }}>학점</TableCell>
              <TableCell sx={{ width: '9%', px: 1 }}>이수구분</TableCell>
              <TableCell sx={{ width: '28%', px: 1 }}>시간/강의실</TableCell>
              <TableCell align="center" sx={{ width: '7%', px: 1 }}>정원</TableCell>
              <TableCell align="center" sx={{ width: '7%', px: 1 }}>장바구니</TableCell>
              <TableCell align="center" sx={{ width: '7%', px: 1 }}>신청</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
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
                const canEnroll = course.canEnroll !== false; // false가 아닌 경우 모두 true로 처리

                return (
                  <TableRow key={course.id}>
                    <TableCell sx={{ px: 1 }}>{course.subjectCode}</TableCell>
                    <TableCell sx={{ px: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                        {course.subjectName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ px: 1 }}>{course.professor}</TableCell>
                    <TableCell sx={{ px: 1 }}>{course.credits}</TableCell>
                    <TableCell sx={{ px: 1 }}>
                      <Chip
                        label={course.courseType}
                        size="small"
                        color={
                          course.courseType.includes('필수') ? 'error' : 'primary'
                        }
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: '24px' }}
                      />
                    </TableCell>
                    <TableCell sx={{ px: 1 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1.3, display: 'block' }}>
                        {course.schedule?.map(formatScheduleTime).join(', ') || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', mt: 0.3 }}>
                        {course.classroom}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ px: 1 }}>
                      <Chip
                        label={`${course.currentStudents}/${course.maxStudents}`}
                        size="small"
                        color={isFull ? 'error' : 'default'}
                        sx={{ fontSize: '0.7rem', height: '24px' }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ px: 1 }}>
                      {!canEnroll ? (
                        null
                      ) : isRegistered ? (
                        <Chip label="-" size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: '24px' }} />
                      ) : isInCart ? (
                        <IconButton
                          color="error"
                          onClick={() => onRemoveFromCart(course.id)}
                          size="small"
                          title="장바구니에서 제거"
                          sx={{ padding: '4px' }}
                        >
                          <RemoveCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="secondary"
                          onClick={() => onAddToCart(course)}
                          size="small"
                          title="장바구니에 추가"
                          sx={{ padding: '4px' }}
                        >
                          <ShoppingCartIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ px: 1 }}>
                      {!canEnroll ? (
                        null
                      ) : isRegistered ? (
                        <IconButton
                          color="primary"
                          disabled
                          size="small"
                          title="수강신청 완료"
                          sx={{ padding: '4px' }}
                        >
                          <CheckCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="primary"
                          onClick={() => onEnroll && onEnroll(course)}
                          disabled={isFull}
                          size="small"
                          title={isFull ? '정원 초과' : '수강신청'}
                          sx={{ padding: '4px' }}
                        >
                          <AddIcon fontSize="small" />
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
