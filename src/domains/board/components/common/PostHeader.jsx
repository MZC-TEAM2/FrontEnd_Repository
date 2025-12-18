import React from 'react';
import { Box, Typography, Chip, Divider, Avatar } from '@mui/material';
import { Visibility as VisibilityIcon, ThumbUp as ThumbUpIcon } from '@mui/icons-material';

const PostHeader = ({ icon, postType, title, authorName, isAnonymous, createdAt, viewCount, likeCount }) => {
  const displayName = isAnonymous ? '익명' : (authorName || '익명');
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
          <Avatar sx={{ width: 32, height: 32 }}>{displayName?.[0] || 'A'}</Avatar>
          <Typography variant="body2" color="text.secondary">
            {displayName}
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
