import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { usePostLike } from '../../hooks/usePostLike';
import { usePostDelete } from '../../hooks/usePostDelete';
import { useComments } from '../../hooks/useComments';
import { useFileManager } from '../../hooks/useFileManager';
import { formatDateTime, getPostTypeLabel } from '../../../../utils/boardUtils';
import CommentList from '../comments/CommentList';
import authService from '../../../../services/authService';
import PostNavigation from '../common/PostNavigation';
import PostHeader from '../common/PostHeader';
import PostContent from '../common/PostContent';
import PostHashtags from '../common/PostHashtags';
import PostAttachments from '../common/PostAttachments';
import PostActions from '../common/PostActions';
import { getPost } from '../../../../api/postApi';

/**
 * 학생 게시판 상세 페이지
 */
const StudentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const handleBackToList = () => navigate('/boards/student');

  // 현재 로그인한 사용자 정보
  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.userId || null;

  // Custom Hooks
  const { isLiked, likeCount, setLikeCount, handleLike, fetchLikeStatus } = usePostLike(id, currentUserId);
  const { deleting, handleDelete } = usePostDelete(navigate);
  const {
    comments,
    createComment,
    createReply,
    updateComment,
    deleteComment,
    loading: commentsLoading,
  } = useComments(id);
  const { downloadFile } = useFileManager();

  // 게시글 상세 조회
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPost('STUDENT', id);
        setPost(data);
        setLikeCount(data.likeCount || 0);
      } catch (err) {
        console.error('게시글 조회 실패:', err);
        setError(err.response?.data?.message || '게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
      fetchLikeStatus();
    }
  }, [id]);

  // 로딩 중
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 에러
  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList}>
          목록으로
        </Button>
      </Box>
    );
  }

  // 게시글 없음
  if (!post) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          게시글을 찾을 수 없습니다.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList}>
          목록으로
        </Button>
      </Box>
    );
  }

  const postTypeInfo = getPostTypeLabel(post.postType);
  const isAuthor = currentUserId === post.author?.id;

  return (
    <Box>
      {/* 네비게이션 */}
      <PostNavigation
        icon={<GroupsIcon />}
        title="학생 게시판"
        onBack={handleBackToList}
      />

      {/* 게시글 내용 */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <PostHeader
          icon={<SchoolIcon sx={{ color: 'primary.main' }} />}
          postType={postTypeInfo}
          title={post.title}
          authorName={post.authorName}
          createdAt={formatDateTime(post.createdAt)}
          viewCount={post.viewCount}
          likeCount={likeCount}
        />

        <Divider sx={{ my: 3 }} />

        <PostContent content={post.content} />

        {post.hashtags && post.hashtags.length > 0 && (
          <PostHashtags hashtags={post.hashtags} />
        )}

        {post.attachments && post.attachments.length > 0 && (
          <PostAttachments
            attachments={post.attachments}
            onDownload={downloadFile}
          />
        )}

        <Divider sx={{ my: 3 }} />

        <PostActions
          isLiked={isLiked}
          likeCount={likeCount}
          viewCount={post.viewCount}
          onLike={handleLike}
          isAuthor={isAuthor}
          onEdit={() => navigate(`/boards/student/${id}/edit`)}
          onDelete={() => handleDelete(id, handleBackToList)}
          deleting={deleting}
        />
      </Paper>

      {/* 댓글 */}
      <CommentList
        comments={comments}
        onCreateComment={createComment}
        onCreateReply={createReply}
        onUpdateComment={updateComment}
        onDeleteComment={deleteComment}
        loading={commentsLoading}
      />
    </Box>
  );
};

export default StudentPage;
