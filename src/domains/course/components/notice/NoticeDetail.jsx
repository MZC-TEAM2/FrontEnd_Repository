import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import { formatDateTimeDot } from '../../../../utils/dateUtils';
import authService from '../../../../services/authService';

function CommentItem({
  comment,
  courseId,
  noticeId,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAuthor = String(comment.authorId) === String(currentUserId);
  const maxDepth = 1;

  const handleEditSubmit = async () => {
    if (!editContent.trim()) return;
    setSubmitting(true);
    try {
      await onEdit(comment.id, { content: editContent.trim() });
      setIsEditing(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await onReply(comment.id, { content: replyContent.trim() });
      setReplyContent('');
      setShowReplyForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ ml: depth * 4, mb: 2 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          bgcolor: depth > 0 ? 'grey.50' : 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={comment.authorName}
              size="small"
              color={depth === 0 ? 'primary' : 'default'}
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              {formatDateTimeDot(comment.createdAt)}
            </Typography>
            {comment.updatedAt && (
              <Typography variant="caption" color="text.secondary">
                (수정됨)
              </Typography>
            )}
          </Box>
          {isAuthor && (
            <Box>
              <IconButton
                size="small"
                onClick={() => {
                  setEditContent(comment.content);
                  setIsEditing(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(comment.id)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {isEditing ? (
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={submitting}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleEditSubmit}
                disabled={submitting || !editContent.trim()}
              >
                저장
              </Button>
              <Button
                size="small"
                onClick={() => setIsEditing(false)}
                disabled={submitting}
              >
                취소
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {comment.content}
          </Typography>
        )}

        {depth < maxDepth && !isEditing && (
          <Button
            size="small"
            startIcon={<ReplyIcon />}
            onClick={() => setShowReplyForm(!showReplyForm)}
            sx={{ mt: 1 }}
          >
            답글
          </Button>
        )}

        {showReplyForm && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="답글을 입력하세요"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              disabled={submitting}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleReplySubmit}
                disabled={submitting || !replyContent.trim()}
              >
                답글 작성
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
                disabled={submitting}
              >
                취소
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {comment.children?.map((child) => (
        <CommentItem
          key={child.id}
          comment={child}
          courseId={courseId}
          noticeId={noticeId}
          currentUserId={currentUserId}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}
    </Box>
  );
}

export default function NoticeDetail({
  notice,
  loading = false,
  error = null,
  isProfessor = false,
  onBack,
  onEdit,
  onDelete,
  onCreateComment,
  onCreateReply,
  onEditComment,
  onDeleteComment,
}) {
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.userId || currentUser?.userNumber;

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    setCommentSubmitting(true);
    try {
      await onCreateComment({ content: newComment.trim() });
      setNewComment('');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    await onDelete();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
          목록으로
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!notice) {
    return null;
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        목록으로
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {notice.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={notice.authorName} size="small" color="primary" variant="outlined" />
              <Typography variant="body2" color="text.secondary">
                {formatDateTimeDot(notice.createdAt)}
              </Typography>
              {notice.updatedAt && (
                <Typography variant="body2" color="text.secondary">
                  (수정됨: {formatDateTimeDot(notice.updatedAt)})
                </Typography>
              )}
            </Box>
          </Box>
          {isProfessor && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={onEdit}
              >
                수정
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                삭제
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography
          variant="body1"
          sx={{ whiteSpace: 'pre-wrap', minHeight: 100 }}
        >
          {notice.content}
        </Typography>
      </Paper>

      {notice.allowComments && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            댓글 {notice.comments?.length > 0 && `(${notice.comments.length})`}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="댓글을 입력하세요"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={commentSubmitting}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="contained"
                onClick={handleCommentSubmit}
                disabled={commentSubmitting || !newComment.trim()}
              >
                댓글 작성
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {notice.comments?.length > 0 ? (
            notice.comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                courseId={notice.courseId}
                noticeId={notice.id}
                currentUserId={currentUserId}
                onReply={onCreateReply}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              등록된 댓글이 없습니다.
            </Typography>
          )}
        </Paper>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>공지사항 삭제</DialogTitle>
        <DialogContent>
          <Typography>정말 이 공지사항을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
