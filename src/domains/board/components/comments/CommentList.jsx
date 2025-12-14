import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

// 댓글 목록 컴포넌트
const CommentList = ({
  comments = [],
  currentUserId,
  onSubmit,
  onEdit,
  onDelete,
  onReply,
  allowComments = true,
}) => {
  // 최상위 댓글만 필터링 (depth === 0)
  const topLevelComments = comments.filter(comment => comment.depth === 0);

  // 각 댓글의 대댓글 가져오기
  const getReplies = (parentCommentId) => {
    return comments.filter(
      comment => comment.parentCommentId === parentCommentId && comment.depth === 1
    );
  };

  return (
    <Box>
      {/* 댓글 작성 폼 */}
      {allowComments && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            댓글 작성
          </Typography>
          <CommentForm onSubmit={onSubmit} currentUserId={currentUserId} />
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* 댓글 목록 */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          댓글 {comments.length}개
        </Typography>

        {topLevelComments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            첫 번째 댓글을 작성해보세요!
          </Typography>
        ) : (
          topLevelComments.map((comment) => (
            <Box key={comment.id} sx={{ mb: 2 }}>
              <CommentItem
                comment={comment}
                replies={getReplies(comment.id)}
                currentUserId={currentUserId}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
                allowComments={allowComments}
              />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default CommentList;
