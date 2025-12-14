import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Campaign as CampaignIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { usePostLike } from '../../hooks/usePostLike';
import { usePostDelete } from '../../hooks/usePostDelete';
import { useComments } from '../../hooks/useComments';
import { useFileManager } from '../../hooks/useFileManager';
import { useNotice } from '../../hooks/useNotice';
import { formatDateTime, getPostTypeLabel } from '../../../../utils/boardUtils';
import CommentList from '../comments/CommentList';
import authService from '../../../../services/authService';

const NoticePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // useNotice 훅에서 공통 함수 가져오기
  const { fetchNoticeDetail, handleBackToList } = useNotice();

  // 현재 로그인한 사용자 정보 가져오기
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
  } = useComments(id, currentUserId);
  const { downloadFile } = useFileManager();

  // 공지사항 상세 조회
  useEffect(() => {
    const loadNoticeDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNoticeDetail(id);
        setNotice(data);
        setLikeCount(data.likeCount || 0);
        
        // 사용자의 좋아요 여부 조회
        await fetchLikeStatus();
      } catch (err) {
        console.error('공지사항 조회 실패:', err);
        setError('공지사항을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadNoticeDetail();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !notice) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || '공지사항을 찾을 수 없습니다.'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList}>
          목록으로
        </Button>
      </Box>
    );
  }

  const postType = getPostTypeLabel(notice.postType);

  return (
    <Box>
      {/* 상단 네비게이션 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList}>
          목록으로
        </Button>
        <Box>
          <IconButton onClick={() => navigate(`/notices/${id}/edit`)} title="수정">
            <EditIcon />
          </IconButton>
          <IconButton 
            onClick={() => handleDelete(id, {
              confirmMessage: '정말 삭제하시겠습니까?',
              successMessage: '공지사항이 삭제되었습니다.',
              redirectPath: '/notices',
            })} 
            color="error" 
            title="삭제"
            disabled={deleting}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 공지사항 상세 */}
      <Paper sx={{ p: 4 }}>
        {/* 헤더 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CampaignIcon sx={{ color: 'primary.main' }} />
            <Chip label={postType.label} color={postType.color} size="small" />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            {notice.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32 }}>{notice.authorName?.[0] || 'A'}</Avatar>
              <Typography variant="body2" color="text.secondary">
                {notice.authorName || '익명'}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Typography variant="body2" color="text.secondary">
              {formatDateTime(notice.createdAt)}
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {notice.viewCount || 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ThumbUpIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {likeCount}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 본문 */}
        <Box
          sx={{
            minHeight: 300,
            mb: 3,
            '& img': {
              maxWidth: '100%',
              height: 'auto',
            },
          }}
        >
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
              color: 'text.primary',
            }}
          >
            {notice.content}
          </Typography>
        </Box>

        {/* 첨부파일 */}
        {notice.attachments && notice.attachments.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              첨부파일 ({notice.attachments.length})
            </Typography>
            <Stack spacing={1}>
              {notice.attachments.map((attachment) => (
                <Box
                  key={attachment.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <AttachFileIcon fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {attachment.originalName}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => downloadFile(attachment)}
                    title="다운로드"
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* 액션 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant={isLiked ? 'contained' : 'outlined'}
            startIcon={isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
            onClick={handleLike}
            sx={{ minWidth: 120 }}
          >
            좋아요 {likeCount}
          </Button>
        </Box>
      </Paper>

      {/* 댓글 영역 */}
      <Paper sx={{ p: 4, mt: 3 }}>
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

export default NoticePage;
