import React from 'react';
import {
  Box,
  Button,
  Typography,
} from '@mui/material';

/**
 * 강의 목록 테이블 페이지네이션 컴포넌트
 */
const CourseTablePagination = ({
  pagination,
  loading,
  onPageChange,
}) => {
  if (pagination.total <= 0) return null;

  return (
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
  );
};

export default CourseTablePagination;

