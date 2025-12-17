import React from 'react';
import { Box, Button } from '@mui/material';
import { 
  ThumbUp, 
  ThumbUpOutlined,
  Edit,
  Delete 
} from '@mui/icons-material';

const PostActions = ({ isLiked, likeCount, onLike, isAuthor, onEdit, onDelete, deleting }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* 좋아요 버튼 */}
      <Button
        variant={isLiked ? 'contained' : 'outlined'}
        startIcon={isLiked ? <ThumbUp /> : <ThumbUpOutlined />}
        onClick={onLike}
        sx={{ minWidth: 120 }}
      >
        좋아요 {likeCount}
      </Button>

      {/* 작성자만 보이는 수정/삭제 버튼 */}
      {isAuthor && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={onEdit}
          >
            수정
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PostActions;
