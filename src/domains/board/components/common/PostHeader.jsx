import React from 'react';
import { Box, Typography, Chip, Divider, Avatar } from '@mui/material';
import { Visibility as VisibilityIcon, ThumbUp as ThumbUpIcon } from '@mui/icons-material';

/**
 * 게시글 헤더 (아이콘, 타입, 제목, 작성자, 날짜, 조회수, 좋아요)
 * @param {ReactElement} icon - 게시판 아이콘
 * @param {Object} postType - { label, color } 형식의 게시글 타입
 * @param {String} title - 게시글 제목
 * @param {String} authorName - 작성자 이름
 * @param {String} createdAt - 작성 날짜 (포맷된 문자열)
 * @param {Number} viewCount - 조회수
 * @param {Number} likeCount - 좋아요 수
 */
const PostHeader = ({ icon, postType, title, authorName, createdAt, viewCount, likeCount }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {icon}
        <Chip label={postType.label} color={postType.color} size="small" />
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>{authorName?.[0] || 'A'}</Avatar>
          <Typography variant="body2" color="text.secondary">
            {authorName || '익명'}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Typography variant="body2" color="text.secondary">
          {createdAt}
        </Typography>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <VisibilityIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {viewCount || 0}
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
  );
};

export default PostHeader;
