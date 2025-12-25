import React, {useEffect, useState} from 'react';
import {Alert, Box, Button, CircularProgress, Divider, Paper,} from '@mui/material';
import {ArrowBack as ArrowBackIcon, RecordVoiceOver as RecordVoiceOverIcon,} from '@mui/icons-material';
import {useNavigate, useParams} from 'react-router-dom';
import {usePostLike} from '../../hooks/usePostLike';
import {usePostDelete} from '../../hooks/usePostDelete';
import {useComments} from '../../hooks/useComments';
import {useFileManager} from '../../hooks/useFileManager';
import {useDiscussion} from '../../hooks/useDiscussion';
import {formatDateTime, getPostTypeLabel} from '../../../../utils/boardUtils';
import CommentList from '../comments/CommentList';
import authService from '../../../../services/authService';
import PostNavigation from '../common/PostNavigation';
import PostHeader from '../common/PostHeader';
import PostContent from '../common/PostContent';
import PostHashtags from '../common/PostHashtags';
import PostAttachments from '../common/PostAttachments';
import PostActions from '../common/PostActions';

const DiscussionPage = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useDiscussion 훅에서 공통 함수 가져오기
    const {fetchDiscussionDetail, handleBackToList} = useDiscussion();

    // 현재 로그인한 사용자 정보 가져오기
    const currentUser = authService.getCurrentUser();
    const currentUserId = currentUser?.userId || null;

    // Custom Hooks
    const {isLiked, likeCount, setLikeCount, handleLike, fetchLikeStatus} = usePostLike(id, currentUserId);
    const {deleting, handleDelete} = usePostDelete(navigate);
    const {
        comments,
        createComment,
        createReply,
        updateComment,
        deleteComment,
    } = useComments(id, currentUserId);
    const {downloadFile} = useFileManager();

    // 토론 게시판 상세 조회
    useEffect(() => {
        const loadDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchDiscussionDetail(id);
                setPost(data);
                setLikeCount(data.likeCount || 0);

                // 사용자의 좋아요 여부 조회
                await fetchLikeStatus();
            } catch (err) {
                console.error('토론 게시판 조회 실패:', err);
                setError('게시글을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadDetail();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (error || !post) {
        return (
            <Box>
                <Alert severity="error" sx={{mb: 3}}>
                    {error || '게시글을 찾을 수 없습니다.'}
                </Alert>
                <Button startIcon={<ArrowBackIcon/>} onClick={handleBackToList}>
                    목록으로
                </Button>
            </Box>
        );
    }

    const postType = getPostTypeLabel(post.postType);

    return (
        <Box>
            {/* 상단 네비게이션 */}
            <PostNavigation
                onBack={handleBackToList}
                onEdit={() => navigate(`/discussions/${id}/edit`)}
                onDelete={() => handleDelete(id, {
                    confirmMessage: '정말 삭제하시겠습니까?',
                    successMessage: '게시글이 삭제되었습니다.',
                    redirectPath: '/discussions',
                })}
                deleting={deleting}
            />

            {/* 게시글 상세 */}
            <Paper sx={{p: 4}}>
                {/* 헤더 */}
                <PostHeader
                    icon={<RecordVoiceOverIcon sx={{color: 'primary.main'}}/>}
                    postType={postType}
                    title={post.title}
                    authorName={post.createdByName}
                    isAnonymous={post.isAnonymous}
                    createdAt={formatDateTime(post.createdAt)}
                    viewCount={post.viewCount}
                    likeCount={likeCount}
                />

                <Divider sx={{my: 3}}/>

                {/* 본문 */}
                <PostContent content={post.content}/>

                {/* 해시태그 */}
                <PostHashtags hashtags={post.hashtags} boardType="DISCUSSION"/>

                {/* 첨부파일 */}
                <PostAttachments attachments={post.attachments} onDownload={downloadFile}/>

                <Divider sx={{my: 3}}/>

                {/* 액션 버튼 */}
                <PostActions
                    isLiked={isLiked}
                    likeCount={likeCount}
                    onLike={handleLike}
                    isAuthor={currentUserId === post.createdBy}
                    onEdit={() => navigate(`/boards/discussion/${id}/edit`)}
                    onDelete={() => handleDelete(id, handleBackToList)}
                    deleting={deleting}
                />
            </Paper>

            {/* 댓글 영역 */}
            <Paper sx={{p: 4, mt: 3}}>
                <CommentList
                    comments={comments}
                    currentUserId={currentUserId}
                    onSubmit={createComment}
                    onEdit={updateComment}
                    onDelete={deleteComment}
                    onReply={createReply}
                    allowComments={true}
                />
            </Paper>
        </Box>
    );
};

export default DiscussionPage;
