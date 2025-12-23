import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Collapse,
  Chip,
  Stack,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import CommentForm from './CommentForm';
import { formatDateTime } from '../../../../utils/boardUtils';
import { useFileManager } from '../../hooks/useFileManager';

// 개별 댓글 컴포넌트
const CommentItem = ({
  comment,
  replies = [],
  currentUserId,
  onEdit,
  onDelete,
  onReply,
  allowComments = true,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const { downloadFile } = useFileManager();

  const authorId = comment.author?.id || comment.authorId;
  const authorName = comment.author?.name || comment.authorName;
  const thumbnailUrl = comment.author?.thumbnailUrl;
  const isAuthor = currentUserId === authorId;
  const displayName = comment.isAnonymous ? '익명' : authorName || '사용자';

  // 메뉴 열기/닫기
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // 수정 모드 토글
  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(comment.content);
    handleMenuClose();
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleEditSubmit = (content, isAnonymous, attachedFiles, removedAttachmentIds = []) => {
    if (content.trim()) {
      onEdit(comment.id, content, attachedFiles, removedAttachmentIds);
      setIsEditing(false);
    }
  };

  // 삭제
  const handleDeleteClick = () => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      onDelete(comment.id);
    }
    handleMenuClose();
  };

  // 답글 작성
  const handleReplySubmit = (content, isAnonymous, attachedFiles) => {
    onReply(comment.id, content, attachedFiles);
    setShowReplyForm(false);
  };

  return (
    <Box>
      {/* 메인 댓글 */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* 프로필 아바타 */}
          <Avatar
            src={thumbnailUrl || undefined}
            alt={displayName}
            sx={{ width: 40, height: 40 }}
          >
            {displayName.charAt(0)}
          </Avatar>

          {/* 댓글 내용 */}
          <Box sx={{ flex: 1 }}>
            {/* 작성자 및 날짜 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(comment.createdAt)}
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && ' (수정됨)'}
                </Typography>
              </Box>

              {/* 메뉴 버튼 (본인 댓글만) */}
              {isAuthor && (
                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* 댓글 내용 또는 수정 폼 */}
            {isEditing ? (
              <CommentForm
                onSubmit={handleEditSubmit}
                onCancel={handleEditCancel}
                placeholder="댓글 내용을 수정하세요..."
                allowAnonymous={false}
                allowAttachments={true}
                currentUserId={currentUserId}
                initialContent={comment.content}
                initialAttachments={comment.attachments || []}
              />
            ) : (
              <>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                  {comment.content}
                </Typography>

                {/* 첨부파일 목록 */}
                {comment.attachments && comment.attachments.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    {comment.attachments.map((attachment) => (
                      <Chip
                        key={attachment.id}
                        icon={<AttachFileIcon />}
                        label={`${attachment.fileName || attachment.originalName} (${(attachment.fileSize / 1024).toFixed(1)}KB)`}
                        size="small"
                        onClick={() => downloadFile(attachment)}
                        sx={{ maxWidth: 300, cursor: 'pointer' }}
                      />
                    ))}
                  </Stack>
                )}

                {/* 답글 버튼 */}
                {allowComments && comment.depth === 0 && (
                  <Button
                    size="small"
                    startIcon={<ReplyIcon />}
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    sx={{ textTransform: 'none' }}
                  >
                    답글
                  </Button>
                )}
              </>
            )}

            {/* 답글 작성 폼 */}
            <Collapse in={showReplyForm}>
              <Box sx={{ mt: 2 }}>
                <CommentForm
                  onSubmit={handleReplySubmit}
                  onCancel={() => setShowReplyForm(false)}
                  placeholder="답글을 입력하세요..."
                  currentUserId={currentUserId}
                />
              </Box>
            </Collapse>
          </Box>
        </Box>

        {/* 메뉴 */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleEditClick}>수정</MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            삭제
          </MenuItem>
        </Menu>
      </Paper>

      {/* 대댓글 목록 */}
      {replies.length > 0 && (
        <Box sx={{ 
          ml: { xs: 3, sm: 4, md: 6 }, 
          mt: 1,
          pl: 2,
          borderLeft: '3px solid',
          borderColor: 'divider',
        }}>
          {replies.map((reply) => (
            <Box key={reply.id} sx={{ mb: 1 }}>
              <CommentItem
                comment={reply}
                replies={[]}
                currentUserId={currentUserId}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
                allowComments={false} // 대댓글의 대댓글은 불가
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CommentItem;
