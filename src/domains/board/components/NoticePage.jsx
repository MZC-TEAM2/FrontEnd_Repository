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
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteNotice, getNoticeDetail, toggleLike, checkLiked } from '../../../api/boardApi';

const Notice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // TODO: 실제 로그인한 사용자 ID 가져오기 (현재는 테스트 계정)
  const currentUserId = 20250101003;

  // 공지사항 상세 조회
  useEffect(() => {
    fetchNoticeDetail();
  }, [id]);

  const fetchNoticeDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNoticeDetail(id);
      setNotice(data);
      setLikeCount(data.likeCount || 0);
      
      // 사용자의 좋아요 여부 조회
      const likedData = await checkLiked(id, currentUserId);
      setIsLiked(likedData.liked || false);
    } catch (err) {
      console.error('공지사항 조회 실패:', err);
      setError('공지사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 게시글 타입 라벨
  const getPostTypeLabel = (postType) => {
    const types = {
      NOTICE: { label: '공지', color: 'error' },
      IMPORTANT: { label: '중요', color: 'warning' },
      GENERAL: { label: '일반', color: 'default' },
    };
    return types[postType] || types.GENERAL;
  };

  // 좋아요 토글
  const handleLike = async () => {
    try {
      const response = await toggleLike(id, currentUserId);
      
      // 서버 응답에 따라 상태 업데이트
      setIsLiked(response.liked);
      
      // 좋아요 수 업데이트
      if (response.liked) {
        setLikeCount((prev) => prev + 1);
      } else {
        setLikeCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteNotice(id);
      alert('공지사항이 삭제되었습니다.');
      navigate('/notices');
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

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
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/notices')}>
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
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/notices')}>
          목록으로
        </Button>
        <Box sx={{ display: 'none' }}> {/* TODO: 권한에 따라 표시 */}
          <IconButton onClick={() => navigate(`/notices/${id}/edit`)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={handleDelete} color="error">
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
              {formatDate(notice.createdAt)}
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
              {notice.attachments.map((file, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  href={file.url}
                  target="_blank"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {file.originalName || `첨부파일 ${index + 1}`}
                </Button>
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

      {/* 댓글 영역 (TODO: 추후 구현) */}
      <Paper sx={{ p: 4, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          댓글
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
          댓글 기능은 준비 중입니다.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Notice;
