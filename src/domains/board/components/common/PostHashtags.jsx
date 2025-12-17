import React from 'react';
import { Box, Chip, Stack } from '@mui/material';

/**
 * 게시글 해시태그 목록
 * @param {Array} hashtags - 해시태그 배열 [{ id, tagName }, ...]
 */
const PostHashtags = ({ hashtags }) => {
  if (!hashtags || hashtags.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {hashtags.map((hashtag) => (
          <Chip
            key={hashtag.id}
            label={`#${hashtag.tagName}`}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ borderRadius: 2 }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default PostHashtags;
