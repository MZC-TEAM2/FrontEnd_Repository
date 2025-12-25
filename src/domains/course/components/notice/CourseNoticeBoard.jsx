import React, {useCallback, useEffect, useState} from 'react';
import {Box, Button, Paper, Typography} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NoticeList from './NoticeList';
import NoticeDetail from './NoticeDetail';
import NoticeForm from './NoticeForm';
import {
    createComment,
    createNotice,
    createReply,
    deleteComment,
    deleteNotice,
    getNoticeDetail,
    getNotices,
    updateComment,
    updateNotice,
} from '../../../../api/noticeApi';
import authService from '../../../../services/authService';

// 뷰 모드 상수
const VIEW_MODE = {
    LIST: 'list',
    DETAIL: 'detail',
    CREATE: 'create',
    EDIT: 'edit',
};

export default function CourseNoticeBoard({courseId}) {
    const [viewMode, setViewMode] = useState(VIEW_MODE.LIST);
    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState(null);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    const currentUser = authService.getCurrentUser();
    const isProfessor = currentUser?.userType === 'PROFESSOR' || currentUser?.userType === 'ROLE_PROFESSOR';

    // 목록 조회
    const fetchNotices = useCallback(async (pageNum = 0) => {
        setListLoading(true);
        setListError(null);
        try {
            const res = await getNotices(courseId, {page: pageNum, size: 10});
            if (res?.success) {
                setNotices(res.data?.content || []);
                setTotalPages(res.data?.totalPages || 0);
                setPage(res.data?.number || 0);
            } else {
                setNotices([]);
                setTotalPages(0);
            }
        } catch (e) {
            setListError(e?.message || '공지사항 목록을 불러오는데 실패했습니다.');
            setNotices([]);
        } finally {
            setListLoading(false);
        }
    }, [courseId]);

    // 상세 조회
    const fetchNoticeDetail = useCallback(async (noticeId) => {
        setDetailLoading(true);
        setDetailError(null);
        try {
            const res = await getNoticeDetail(courseId, noticeId);
            if (res?.success) {
                setSelectedNotice(res.data);
            } else {
                setDetailError('공지사항을 불러오는데 실패했습니다.');
            }
        } catch (e) {
            setDetailError(e?.message || '공지사항을 불러오는데 실패했습니다.');
        } finally {
            setDetailLoading(false);
        }
    }, [courseId]);

    // 초기 로드
    useEffect(() => {
        fetchNotices(0);
    }, [fetchNotices]);

    // 목록에서 공지사항 선택
    const handleSelectNotice = (noticeId) => {
        setViewMode(VIEW_MODE.DETAIL);
        fetchNoticeDetail(noticeId);
    };

    // 목록으로 돌아가기
    const handleBackToList = () => {
        setViewMode(VIEW_MODE.LIST);
        setSelectedNotice(null);
        setFormError(null);
        fetchNotices(page);
    };

    // 페이지 변경
    const handlePageChange = (newPage) => {
        fetchNotices(newPage);
    };

    // 새 공지사항 작성 화면으로
    const handleCreateMode = () => {
        setViewMode(VIEW_MODE.CREATE);
        setFormError(null);
    };

    // 수정 화면으로
    const handleEditMode = () => {
        setViewMode(VIEW_MODE.EDIT);
        setFormError(null);
    };

    // 공지사항 생성
    const handleCreateNotice = async (data) => {
        setFormSubmitting(true);
        setFormError(null);
        try {
            const res = await createNotice(courseId, data);
            if (res?.success) {
                setViewMode(VIEW_MODE.LIST);
                fetchNotices(0);
            } else {
                setFormError('공지사항 작성에 실패했습니다.');
            }
        } catch (e) {
            setFormError(e?.message || '공지사항 작성에 실패했습니다.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // 공지사항 수정
    const handleUpdateNotice = async (data) => {
        if (!selectedNotice) return;
        setFormSubmitting(true);
        setFormError(null);
        try {
            const res = await updateNotice(courseId, selectedNotice.id, data);
            if (res?.success) {
                setViewMode(VIEW_MODE.DETAIL);
                fetchNoticeDetail(selectedNotice.id);
            } else {
                setFormError('공지사항 수정에 실패했습니다.');
            }
        } catch (e) {
            setFormError(e?.message || '공지사항 수정에 실패했습니다.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // 공지사항 삭제
    const handleDeleteNotice = async () => {
        if (!selectedNotice) return;
        try {
            const res = await deleteNotice(courseId, selectedNotice.id);
            if (res?.success !== false) {
                handleBackToList();
            }
        } catch (e) {
            setDetailError(e?.message || '공지사항 삭제에 실패했습니다.');
        }
    };

    // 댓글 작성
    const handleCreateComment = async (data) => {
        if (!selectedNotice) return;
        try {
            await createComment(courseId, selectedNotice.id, data);
            fetchNoticeDetail(selectedNotice.id);
        } catch (e) {
            console.error('댓글 작성 실패:', e);
        }
    };

    // 대댓글 작성
    const handleCreateReply = async (parentId, data) => {
        if (!selectedNotice) return;
        try {
            await createReply(courseId, selectedNotice.id, parentId, data);
            fetchNoticeDetail(selectedNotice.id);
        } catch (e) {
            console.error('대댓글 작성 실패:', e);
        }
    };

    // 댓글 수정
    const handleEditComment = async (commentId, data) => {
        if (!selectedNotice) return;
        try {
            await updateComment(courseId, selectedNotice.id, commentId, data);
            fetchNoticeDetail(selectedNotice.id);
        } catch (e) {
            console.error('댓글 수정 실패:', e);
        }
    };

    // 댓글 삭제
    const handleDeleteComment = async (commentId) => {
        if (!selectedNotice) return;
        try {
            await deleteComment(courseId, selectedNotice.id, commentId);
            fetchNoticeDetail(selectedNotice.id);
        } catch (e) {
            console.error('댓글 삭제 실패:', e);
        }
    };

    return (
        <Paper sx={{p: 3}}>
            {viewMode === VIEW_MODE.LIST && (
                <>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography variant="h6" sx={{fontWeight: 700}}>
                            공지사항
                        </Typography>
                        {isProfessor && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon/>}
                                onClick={handleCreateMode}
                            >
                                작성
                            </Button>
                        )}
                    </Box>
                    <NoticeList
                        notices={notices}
                        loading={listLoading}
                        error={listError}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        onSelectNotice={handleSelectNotice}
                    />
                </>
            )}

            {viewMode === VIEW_MODE.DETAIL && (
                <NoticeDetail
                    notice={selectedNotice}
                    loading={detailLoading}
                    error={detailError}
                    isProfessor={isProfessor}
                    onBack={handleBackToList}
                    onEdit={handleEditMode}
                    onDelete={handleDeleteNotice}
                    onCreateComment={handleCreateComment}
                    onCreateReply={handleCreateReply}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                />
            )}

            {viewMode === VIEW_MODE.CREATE && (
                <NoticeForm
                    mode="create"
                    onSubmit={handleCreateNotice}
                    onCancel={handleBackToList}
                    submitting={formSubmitting}
                    error={formError}
                />
            )}

            {viewMode === VIEW_MODE.EDIT && (
                <NoticeForm
                    mode="edit"
                    initialData={selectedNotice}
                    onSubmit={handleUpdateNotice}
                    onCancel={() => setViewMode(VIEW_MODE.DETAIL)}
                    submitting={formSubmitting}
                    error={formError}
                />
            )}
        </Paper>
    );
}
