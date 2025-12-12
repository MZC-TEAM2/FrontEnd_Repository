import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { formatScheduleTime } from '../utils/scheduleUtils';

/**
 * 장바구니 탭 컴포넌트
 */
const CartTab = ({
  cart,
  totalCredits,
  registeredCredits,
  onRemoveFromCart,
  onClearAllCarts,
  onConfirmRegistration,
}) => {
  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {cart.length === 0 ? (
        <Box sx={{ 
          width: '100%',
          display: 'flex', 
          justifyContent: 'center',
          pt: 2,
        }}>
          <Alert severity="info">장바구니가 비어있습니다.</Alert>
        </Box>
      ) : (
        <>
          <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>과목코드</TableCell>
                  <TableCell>과목명</TableCell>
                  <TableCell>교수</TableCell>
                  <TableCell>학점</TableCell>
                  <TableCell>시간</TableCell>
                  <TableCell align="center">제거</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((course) => (
                  <TableRow key={course.cartId || course.id}>
                    <TableCell>{course.subjectCode}</TableCell>
                    <TableCell>{course.subjectName}</TableCell>
                    <TableCell>{course.professor}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {course.schedule?.map(formatScheduleTime).join(', ') || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => onRemoveFromCart(course.cartId || course.id)}
                        title="장바구니에서 제거"
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 3, flexShrink: 0 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                총 {totalCredits}학점
              </Typography>
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                {totalCredits}
              </Typography>
              <Typography variant="body1" sx={{ color: 'white' }}>
                학점 ({cart.length}과목)
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              size="large"
              fullWidth
              onClick={onClearAllCarts}
              sx={{ mt: 2 }}
            >
              장바구니 비우기
            </Button>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={onConfirmRegistration}
              disabled={totalCredits === 0 || totalCredits + registeredCredits > 21}
              sx={{ mt: 2 }}
            >
              수강신청 확정
            </Button>

            {totalCredits + registeredCredits > 21 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                최대 수강 가능 학점(21학점)을 초과했습니다.
              </Alert>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default CartTab;
