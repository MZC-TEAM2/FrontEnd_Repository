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
  // 중첩된 childComments를 평면 배열로 변환
  const flattenComments = (commentsList) => {
    const result = [];
    const flatten = (comment) => {
      result.push(comment);
      if (comment.childComments && comment.childComments.length > 0) {
        comment.childComments.forEach(child => flatten(child));
      }
    };
    commentsList.forEach(comment => flatten(comment));
    return result;
  };

  // 백엔드에서 중첩 구조로 오는 경우 평면화
  const allComments = flattenComments(comments);

  // 최상위 댓글만 필터링 (depth === 0)
  const topLevelComments = allComments.filter(comment => comment.depth === 0);

  // 각 최상위 댓글의 다음에 나오는 depth === 1 댓글들을 대댓글로 처리
  const getSequentialReplies = (topLevelIndex) => {
    const replies = [];
    // 현재 최상위 댓글의 인덱스 찾기
    const startIdx = allComments.findIndex(c => c.id === topLevelComments[topLevelIndex].id);
    
    // 다음 최상위 댓글의 인덱스 찾기 (없으면 끝까지)
    const nextTopLevelIdx = topLevelComments[topLevelIndex + 1] 
      ? allComments.findIndex(c => c.id === topLevelComments[topLevelIndex + 1].id)
      : allComments.length;
    
    // 그 사이의 depth === 1 댓글들 수집
    for (let i = startIdx + 1; i < nextTopLevelIdx; i++) {
      if (allComments[i].depth === 1) {
        replies.push(allComments[i]);
      }
    }
    
    return replies;
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
          댓글 {allComments.length}개
        </Typography>

        {topLevelComments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            첫 번째 댓글을 작성해보세요!
          </Typography>
        ) : (
          topLevelComments.map((comment, index) => (
            <Box key={comment.id} sx={{ mb: 2 }}>
              <CommentItem
                comment={comment}
                replies={getSequentialReplies(index)}
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
