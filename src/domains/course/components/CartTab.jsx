import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {formatScheduleTime} from '../utils/scheduleUtils';

/**
 * 장바구니 탭 컴포넌트
 */
const CartTab = ({
                     cart,
                     cartCredits,
                     registeredCredits,
                     onRemoveFromCart,
                     onClearAllCarts,
                     onConfirmRegistration,
                 }) => {
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

    const handleClearClick = () => {
        setClearDialogOpen(true);
    };

    const handleClearConfirm = () => {
        onClearAllCarts();
        setClearDialogOpen(false);
    };

    const handleClearClose = () => {
        setClearDialogOpen(false);
    };

    const handleRegisterClick = () => {
        setRegisterDialogOpen(true);
    };

    const handleRegisterConfirm = () => {
        onConfirmRegistration();
        setRegisterDialogOpen(false);
    };

    const handleRegisterClose = () => {
        setRegisterDialogOpen(false);
    };

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
                    <TableContainer sx={{flex: 1, overflow: 'auto'}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>과목코드</TableCell>
                                    <TableCell>과목명</TableCell>
                                    <TableCell>교수</TableCell>
                                    <TableCell>학점</TableCell>
                                    <TableCell>시간/강의실</TableCell>
                                    <TableCell align="center">정원</TableCell>
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
                                            <br/>
                                            <Typography variant="caption" color="text.secondary">
                                                {course.classroom || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">
                                                {course.currentStudents || 0}/{course.maxStudents || 0}
                                            </Typography>
                                            {course.isFull && (
                                                <Typography variant="caption" color="error" sx={{display: 'block'}}>
                                                    마감
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="error"
                                                onClick={() => onRemoveFromCart(course.cartId || course.id)}
                                                title="장바구니에서 제거"
                                            >
                                                <RemoveCircleOutlineIcon/>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{mt: 3, flexShrink: 0}}>
                        <Box sx={{textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2}}>
                            <Typography variant="body1" sx={{color: 'white', mb: 1}}>
                                총 {cartCredits}학점
                            </Typography>
                            <Typography variant="h3" sx={{color: 'white', fontWeight: 700}}>
                                {cartCredits}
                            </Typography>
                            <Typography variant="body1" sx={{color: 'white'}}>
                                학점 ({cart.length}과목)
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            color="error"
                            size="large"
                            fullWidth
                            onClick={handleClearClick}
                            sx={{mt: 2}}
                        >
                            장바구니 비우기
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleRegisterClick}
                            disabled={cartCredits === 0 || cartCredits + registeredCredits > 21}
                            sx={{mt: 2}}
                        >
                            장바구니 일괄 수강신청
                        </Button>

                        {cartCredits + registeredCredits > 21 && (
                            <Alert severity="error" sx={{mt: 2}}>
                                최대 수강 가능 학점(21학점)을 초과했습니다.
                            </Alert>
                        )}
                    </Box>
                </>
            )}

            {/* 장바구니 비우기 확인 다이얼로그 */}
            <Dialog
                open={clearDialogOpen}
                onClose={handleClearClose}
                aria-labelledby="clear-dialog-title"
                aria-describedby="clear-dialog-description"
            >
                <DialogTitle id="clear-dialog-title">
                    장바구니 비우기 확인
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="clear-dialog-description">
                        정말로 장바구니의 모든 항목을 비우시겠습니까?
                        <br/>
                        <strong>{cart.length}개 과목 ({cartCredits}학점)</strong>이 삭제됩니다.
                        <br/>
                        이 작업은 되돌릴 수 없습니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClearClose} color="inherit">
                        취소
                    </Button>
                    <Button onClick={handleClearConfirm} color="error" variant="contained" autoFocus>
                        비우기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 장바구니 일괄 수강신청 확인 다이얼로그 */}
            <Dialog
                open={registerDialogOpen}
                onClose={handleRegisterClose}
                aria-labelledby="register-dialog-title"
                aria-describedby="register-dialog-description"
            >
                <DialogTitle id="register-dialog-title">
                    장바구니 일괄 수강신청 확인
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="register-dialog-description">
                        장바구니에 있는 <strong>{cart.length}개 과목 ({cartCredits}학점)</strong>을 모두 수강신청하시겠습니까?
                        <br/>
                        현재 신청 완료된 학점: <strong>{registeredCredits}학점</strong>
                        <br/>
                        신청 후 총 학점: <strong>{cartCredits + registeredCredits}학점</strong>
                        {cartCredits + registeredCredits > 21 && (
                            <>
                                <br/>
                                <Typography variant="body2" color="error" sx={{mt: 1}}>
                                    ⚠️ 최대 수강 가능 학점(21학점)을 초과합니다.
                                </Typography>
                            </>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRegisterClose} color="inherit">
                        취소
                    </Button>
                    <Button
                        onClick={handleRegisterConfirm}
                        variant="contained"
                        color="primary"
                        autoFocus
                        disabled={cartCredits + registeredCredits > 21}
                    >
                        신청하기
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CartTab;
