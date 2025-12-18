import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  Chip,
  Stack,
} from '@mui/material';

/**
 * 해시태그 입력 컴포넌트
 * 게시글 작성/수정 시 해시태그를 입력하고 관리하는 공통 컴포넌트
 * 
 * @param {Array} hashtags - 현재 입력된 해시태그 배열
 * @param {Function} onHashtagsChange - 해시태그 변경 시 호출되는 콜백 함수
 * @param {string} placeholder - TextField placeholder 텍스트
 */
const HashtagInput = ({ hashtags, onHashtagsChange, placeholder }) => {
  const [hashtagInput, setHashtagInput] = React.useState('');

  const handleHashtagAdd = () => {
    if (!hashtagInput.trim()) return;
    
    const newTag = hashtagInput.trim().replace(/^#/, '');
    if (!hashtags.includes(newTag)) {
      onHashtagsChange([...hashtags, newTag]);
    }
    setHashtagInput('');
  };

  const handleHashtagDelete = (tagToDelete) => {
    onHashtagsChange(hashtags.filter(tag => tag !== tagToDelete));
  };

  const handleHashtagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleHashtagAdd();
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        label="해시태그"
        value={hashtagInput}
        onChange={(e) => setHashtagInput(e.target.value)}
        onKeyPress={handleHashtagKeyPress}
        placeholder={placeholder || "해시태그를 입력하고 Enter를 누르세요"}
        InputProps={{
          endAdornment: (
            <Button onClick={handleHashtagAdd} disabled={!hashtagInput.trim()}>
              추가
            </Button>
          ),
        }}
      />
      {hashtags.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
          {hashtags.map((tag, index) => (
            <Chip
              key={index}
              label={`#${tag}`}
              onDelete={() => handleHashtagDelete(tag)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

HashtagInput.propTypes = {
  hashtags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onHashtagsChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default HashtagInput;
