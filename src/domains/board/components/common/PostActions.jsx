import React from 'react';
import { Box, Button } from '@mui/material';
import { ThumbUp as ThumbUpIcon, ThumbUpOutlined as ThumbUpOutlinedIcon } from '@mui/icons-material';

/**
 * 게시글 액션 버튼 (좋아요)
 * @param {Boolean} isLiked - 좋아요 여부
 * @param {Number} likeCount - 좋아요 수
 * @param {Function} onLike - 좋아요 클릭 함수
 */
const PostActions = ({ isLiked, likeCount, onLike }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
      <Button
        variant={isLiked ? 'contained' : 'outlined'}
        startIcon={isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
        onClick={onLike}
        sx={{ minWidth: 120 }}
      >
        좋아요 {likeCount}
      </Button>
    </Box>
  );
};

export default PostActions;
