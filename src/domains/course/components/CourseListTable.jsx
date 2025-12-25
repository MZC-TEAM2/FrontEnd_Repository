import React, {memo, useState} from 'react';
import {
    Box,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import CancelDialog from './CourseListTable/CancelDialog';
import EnrollDialog from './CourseListTable/EnrollDialog';
import CourseTableRow from './CourseListTable/CourseTableRow';
import CourseTablePagination from './CourseListTable/CourseTablePagination';

/**
 * 과목 목록 테이블 컴포넌트
 */
const CourseListTable = memo(({
                                  courses,
                                  loading,
                                  pagination,
                                  onPageChange,
                                  cart,
                                  registered,
                                  onAddToCart,
                                  onRemoveFromCart,
                                  onEnroll,
                                  onCancelEnrollment,
                                  enrollDialogOpen,
                                  pendingEnrollCourse,
                                  onEnrollDialogClose,
                                  onEnrollConfirm,
                              }) => {
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(null);
    const [selectedCourseName, setSelectedCourseName] = useState('');

    const handleCancelClick = (enrollmentId, courseName) => {
        setSelectedEnrollmentId(enrollmentId);
        setSelectedCourseName(courseName);
        setCancelDialogOpen(true);
    };

    const handleCancelConfirm = () => {
        if (selectedEnrollmentId && onCancelEnrollment) {
            onCancelEnrollment(selectedEnrollmentId);
        } else if (!selectedEnrollmentId) {
            // enrollmentId가 없으면 경고 표시
            console.warn('수강신청 ID를 찾을 수 없습니다.');
        }
        setCancelDialogOpen(false);
        setSelectedEnrollmentId(null);
        setSelectedCourseName('');
    };

    const handleCancelClose = () => {
        setCancelDialogOpen(false);
        setSelectedEnrollmentId(null);
        setSelectedCourseName('');
    };
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
                    <CircularProgress/>
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
                            <TableCell sx={{width: '8%', px: 1}}>과목코드</TableCell>
                            <TableCell sx={{width: '14%', px: 1}}>과목명</TableCell>
                            <TableCell sx={{width: '7%', px: 1}}>교수</TableCell>
                            <TableCell sx={{width: '5%', px: 1}}>학점</TableCell>
                            <TableCell sx={{width: '9%', px: 1}}>이수구분</TableCell>
                            <TableCell sx={{width: '28%', px: 1}}>시간/강의실</TableCell>
                            <TableCell align="center" sx={{width: '7%', px: 1}}>정원</TableCell>
                            <TableCell align="center" sx={{width: '7%', px: 1}}>장바구니</TableCell>
                            <TableCell align="center" sx={{width: '7%', px: 1}}>신청</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{py: 8}}>
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
                                const isEnrolled = course.isEnrolled === true || isRegistered;
                                const canEnroll = course.canEnroll !== false;

                                return (
                                    <CourseTableRow
                                        key={course.id}
                                        course={course}
                                        isInCart={!!isInCart}
                                        isRegistered={!!isRegistered}
                                        isEnrolled={isEnrolled}
                                        canEnroll={canEnroll}
                                        isFull={isFull}
                                        onAddToCart={onAddToCart}
                                        onRemoveFromCart={onRemoveFromCart}
                                        onEnroll={onEnroll}
                                        onCancelClick={(course) => {
                                            const enrollment = registered.find((c) => c.id === course.id);
                                            const enrollmentId = enrollment?.enrollmentId || course.enrollmentId;
                                            if (enrollmentId) {
                                                handleCancelClick(enrollmentId, course.subjectName);
                                            } else {
                                                console.warn('수강신청 ID를 찾을 수 없습니다:', course);
                                            }
                                        }}
                                    />
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 페이지네이션 */}
            <CourseTablePagination
                pagination={pagination}
                loading={loading}
                onPageChange={onPageChange}
            />

            {/* 취소 확인 다이얼로그 */}
            <CancelDialog
                open={cancelDialogOpen}
                onClose={handleCancelClose}
                onConfirm={handleCancelConfirm}
                courseName={selectedCourseName}
            />

            {/* 수강신청 확인 다이얼로그 */}
            <EnrollDialog
                open={enrollDialogOpen}
                onClose={onEnrollDialogClose}
                onConfirm={onEnrollConfirm}
                course={pendingEnrollCourse}
            />
        </Box>
    );
}, (prevProps, nextProps) => {
    // 실제로 변경된 props만 비교하여 불필요한 리렌더링 방지

    // 기본 props 비교
    if (prevProps.loading !== nextProps.loading) {
        return false;
    }
    if (prevProps.enrollDialogOpen !== nextProps.enrollDialogOpen) {
        return false;
    }

    // pagination 비교
    if (
        prevProps.pagination.page !== nextProps.pagination.page ||
        prevProps.pagination.size !== nextProps.pagination.size ||
        prevProps.pagination.total !== nextProps.pagination.total ||
        prevProps.pagination.totalPages !== nextProps.pagination.totalPages
    ) {
        return false;
    }

    // pendingEnrollCourse 비교
    if (prevProps.pendingEnrollCourse?.id !== nextProps.pendingEnrollCourse?.id) {
        return false;
    }

    // 배열 길이 비교
    if (prevProps.courses.length !== nextProps.courses.length) {
        return false;
    }
    if (prevProps.cart.length !== nextProps.cart.length) {
        return false;
    }
    if (prevProps.registered.length !== nextProps.registered.length) {
        return false;
    }

    // courses 배열 비교: ID와 주요 상태를 함께 비교
    if (prevProps.courses.length > 0) {
        const prevCoursesKey = prevProps.courses.map(c =>
            `${c.id}:${c.isInCart}:${c.isEnrolled}:${c.isFull}:${c.currentStudents}`
        ).join('|');
        const nextCoursesKey = nextProps.courses.map(c =>
            `${c.id}:${c.isInCart}:${c.isEnrolled}:${c.isFull}:${c.currentStudents}`
        ).join('|');
        if (prevCoursesKey !== nextCoursesKey) {
            return false;
        }
    }

    // cart 배열의 ID 비교
    const prevCartIds = prevProps.cart.map(c => c.id || c.cartId).sort().join(',');
    const nextCartIds = nextProps.cart.map(c => c.id || c.cartId).sort().join(',');
    if (prevCartIds !== nextCartIds) {
        return false;
    }

    // registered 배열의 ID 비교
    const prevRegisteredIds = prevProps.registered.map(c => c.id).sort().join(',');
    const nextRegisteredIds = nextProps.registered.map(c => c.id).sort().join(',');
    if (prevRegisteredIds !== nextRegisteredIds) {
        return false;
    }

    // 함수 참조 비교 (useCallback으로 메모이제이션되어 있으므로 참조만 비교)
    if (prevProps.onPageChange !== nextProps.onPageChange) {
        return false;
    }
    if (prevProps.onAddToCart !== nextProps.onAddToCart) {
        return false;
    }
    if (prevProps.onRemoveFromCart !== nextProps.onRemoveFromCart) {
        return false;
    }
    if (prevProps.onEnroll !== nextProps.onEnroll) {
        return false;
    }
    if (prevProps.onCancelEnrollment !== nextProps.onCancelEnrollment) {
        return false;
    }
    if (prevProps.onEnrollDialogClose !== nextProps.onEnrollDialogClose) {
        return false;
    }
    if (prevProps.onEnrollConfirm !== nextProps.onEnrollConfirm) {
        return false;
    }

    // 모든 props가 동일하면 리렌더링 방지
    return true;
});

export default CourseListTable;
