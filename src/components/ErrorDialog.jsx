/**
 * 에러 다이얼로그 컴포넌트
 * 
 * API 에러를 사용자 친화적인 다이얼로그로 표시
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Close as CloseIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

/**
 * ErrorDialog 컴포넌트
 * @param {boolean} open - 다이얼로그 열림 상태
 * @param {Function} onClose - 닫기 핸들러
 * @param {Object} error - 에러 객체
 * @param {string} error.code - 에러 코드 (예: "COURSE_007")
 * @param {string} error.message - 에러 메시지
 * @param {Object} error.details - 에러 상세 정보
 * @param {string} title - 다이얼로그 제목 (기본값: "오류가 발생했습니다")
 */
const ErrorDialog = ({ open, onClose, error = {}, title = "오류가 발생했습니다" }) => {
  // 에러 코드별 한글 메시지 매핑
  const getErrorDescription = (errorCode) => {
    const errorMessages = {
      // 인증/권한
      AUTH_001: '인증 토큰이 없거나 유효하지 않습니다. 다시 로그인해주세요.',
      AUTH_002: '토큰이 만료되었습니다. 다시 로그인해주세요.',
      AUTH_003: '이 작업을 수행할 권한이 없습니다.',
      
      // 사용자
      USER_001: '사용자를 찾을 수 없습니다.',
      USER_002: '잘못된 비밀번호입니다.',
      
      // 과목
      SUBJECT_001: '선택한 과목을 찾을 수 없습니다. 다시 선택해주세요.',
      SUBJECT_002: '이미 같은 과목코드가 존재합니다.',
      SUBJECT_003: '선수과목을 찾을 수 없습니다.',
      SUBJECT_004: '과목 정보를 확인해주세요.',
      
      // 강의
      COURSE_001: '강의를 찾을 수 없습니다.',
      COURSE_002: '수강신청되지 않은 과목입니다.',
      COURSE_003: '본인의 강의가 아닙니다.',
      COURSE_004: '수강신청 시작 후에는 수정하거나 삭제할 수 없습니다.',
      COURSE_005: '중복된 과목코드/분반입니다.',
      COURSE_006: '수강생이 있어 삭제할 수 없습니다.',
      COURSE_007: '같은 학기, 같은 과목, 같은 분반이 이미 존재합니다.',
      
      // 교수
      PROFESSOR_001: '교수 권한이 필요합니다.',
      
      // 주차 관리
      WEEK_001: '중복된 주차 번호입니다.',
      WEEK_002: '유효하지 않은 주차 번호입니다.',
      WEEK_003: '콘텐츠가 있어 삭제할 수 없습니다.',
      WEEK_004: '이미 공개된 주차는 삭제할 수 없습니다.',
      
      // 콘텐츠
      CONTENT_001: '지원하지 않는 콘텐츠 타입입니다.',
      CONTENT_002: '파일 크기가 너무 큽니다 (최대 500MB).',
      CONTENT_003: '허용되지 않는 파일 형식입니다.',
      CONTENT_004: '필수 필드가 누락되었습니다.',
      
      // 과제
      ASSIGNMENT_001: '과제를 찾을 수 없습니다.',
      ASSIGNMENT_002: '제출 기한이 지났습니다.',
      ASSIGNMENT_003: '이미 제출되었습니다.',
      
      // 시간표/수강신청
      TIME_CONFLICT: '같은 시간에 다른 강의가 이미 있습니다.',
      COURSE_FULL: '수강 정원이 마감되었습니다.',
      CREDIT_LIMIT_EXCEEDED: '학점 제한을 초과했습니다.',
      PREREQUISITE_NOT_MET: '선수과목을 이수하지 않았습니다.',
      ALREADY_ENROLLED: '이미 수강신청했습니다.',
      DUPLICATE_SUBJECT: '동일한 과목의 다른 분반을 이미 신청했습니다.',
      ENROLLMENT_PERIOD_CLOSED: '수강신청 기간이 아닙니다.',
      CANCELLATION_PERIOD_CLOSED: '취소 가능한 기간이 아닙니다.',
      ENROLLMENT_NOT_FOUND: '수강신청 내역이 없습니다.',
      ENROLLMENT_ACCESS_DENIED: '접근 권한이 없습니다.',
      ENROLLMENT_PERIOD_NOT_FOUND: '수강신청 기간을 찾을 수 없습니다.',
      COURSE_NOT_FOUND: '과목을 찾을 수 없습니다.',
      
      // 장바구니
      CART_ITEM_NOT_FOUND: '장바구니 항목을 찾을 수 없습니다.',
      COURSE_NOT_IN_CART: '장바구니에 없는 과목입니다.',
      CART_ACCESS_DENIED: '다른 사용자의 장바구니입니다.',
      CART_ALREADY_EMPTY: '이미 비어있는 장바구니입니다.',
      
      // 파일
      FILE_001: '파일 크기가 초과되었습니다.',
      FILE_002: '허용되지 않는 파일 형식입니다.',
    };
    
    return errorMessages[errorCode] || null;
  };

  const errorCode = error.code || error.errorCode || '';
  const errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
  const errorDescription = getErrorDescription(errorCode);
  const errorDetails = error.details || null;

  // 에러 심각도 판단
  const getSeverity = (code) => {
    if (code.startsWith('AUTH_') || code.startsWith('PROFESSOR_')) {
      return 'error';
    }
    return 'warning';
  };

  const severity = getSeverity(errorCode);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        }
      }}
    >
      <DialogTitle
        sx={{
          background: severity === 'error' 
            ? 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)'
            : 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
          color: 'white',
          py: 3,
          px: 3,
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {severity === 'error' ? (
                <ErrorIcon sx={{ fontSize: 28, color: 'white' }} />
              ) : (
                <WarningIcon sx={{ fontSize: 28, color: 'white' }} />
              )}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {title}
              </Typography>
              {errorCode && (
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  오류 코드: {errorCode}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 3 }}>
        {/* 메인 에러 메시지 */}
        <Alert 
          severity={severity} 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%',
            }
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {errorMessage}
          </Typography>
        </Alert>

        {/* 에러 설명 */}
        {errorDescription && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {errorDescription}
            </Typography>
          </Box>
        )}

        {/* 에러 상세 정보 */}
        {errorDetails && Object.keys(errorDetails).length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              상세 정보
            </Typography>
            <List dense sx={{ 
              bgcolor: 'grey.50', 
              borderRadius: 2,
              p: 1,
            }}>
              {Object.entries(errorDetails).map(([key, value]) => (
                <ListItem key={key} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={`${key}: ${JSON.stringify(value)}`}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* 도움말 */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
          <Typography variant="body2" color="info.main" sx={{ fontWeight: 600, mb: 0.5 }}>
            💡 도움말
          </Typography>
          <Typography variant="caption" color="text.secondary">
            문제가 계속되면 관리자에게 문의하거나 다시 시도해주세요.
            {errorCode && ` (오류 코드: ${errorCode})`}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{ 
            borderRadius: 2,
            px: 4,
            background: severity === 'error'
              ? 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)'
              : 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
            '&:hover': {
              background: severity === 'error'
                ? 'linear-gradient(135deg, #e91e63 0%, #f44336 100%)'
                : 'linear-gradient(135deg, #ff5722 0%, #ff9800 100%)',
            }
          }}
        >
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;

