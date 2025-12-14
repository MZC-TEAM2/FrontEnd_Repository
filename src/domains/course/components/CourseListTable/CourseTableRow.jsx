import React from 'react';
import {
  TableRow,
  TableCell,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import { formatScheduleTime } from '../../utils/scheduleUtils';

/**
 * 강의 목록 테이블 행 컴포넌트
 */
const CourseTableRow = ({
  course,
  isInCart,
  isRegistered,
  isEnrolled,
  canEnroll,
  isFull,
  onAddToCart,
  onRemoveFromCart,
  onEnroll,
  onCancelClick,
}) => {
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
        ) : isEnrolled ? (
          null // 신청 완료된 과목은 장바구니 버튼 숨김
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
        {isEnrolled ? (
          // 신청 완료된 과목은 canEnroll과 관계없이 취소 버튼 표시
          <IconButton
            color="error"
            onClick={() => onCancelClick(course)}
            size="small"
            title="수강신청 취소"
            sx={{ padding: '4px' }}
          >
            <RemoveCircleOutlineIcon fontSize="small" />
          </IconButton>
        ) : !canEnroll ? (
          null
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
};

export default CourseTableRow;

