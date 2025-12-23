import React from 'react';
import { Box, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * 게시글 해시태그 목록
 * @param {Array} hashtags - 해시태그 배열 [{ id, tagName }, ...]
 * @param {string} boardType - 게시판 타입 (FREE, DISCUSSION, STUDENT 등)
 * @param {boolean} clickable - 클릭 가능 여부 (기본값: true)
 */
const PostHashtags = ({ hashtags, boardType, clickable = true }) => {
  const navigate = useNavigate();

  if (!hashtags || hashtags.length === 0) {
    return null;
  }

  const handleHashtagClick = (tagName) => {
    if (!clickable || !boardType) return;
    
    // 게시판 타입에 따른 경로 매핑
    const boardPaths = {
      'FREE': '/free',
      'QUESTION': '/questions',
      'DISCUSSION': '/discussions',
      'DEPARTMENT': '/departments',
      'STUDENT': '/boards/student',
      'CONTEST': '/boards/contest',
      'CAREER': '/boards/career',
      'STUDY_RECRUITMENT': '/boards/study',
    };

    const basePath = boardPaths[boardType];
    if (basePath) {
      navigate(`${basePath}?hashtag=${encodeURIComponent(tagName)}`);
    }
  };

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
            clickable={clickable && !!boardType}
            onClick={() => handleHashtagClick(hashtag.tagName)}
            sx={{ 
              borderRadius: 2,
              cursor: clickable && boardType ? 'pointer' : 'default',
              '&:hover': clickable && boardType ? {
                backgroundColor: 'primary.light',
                color: 'white',
              } : {},
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default PostHashtags;
