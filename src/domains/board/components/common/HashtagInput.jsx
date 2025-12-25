import React from 'react';
import PropTypes from 'prop-types';
import {Box, Button, Chip, CircularProgress, Paper, Stack, TextField, Typography,} from '@mui/material';
import {searchHashtags} from '../../../../api/hashtagApi';
import {BOARD_HASHTAGS_MAP, getBoardTypeLabel} from '../../constants/boardHashtags';

/**
 * 해시태그 입력 컴포넌트
 * 게시글 작성/수정 시 해시태그를 입력하고 관리하는 공통 컴포넌트
 *
 * @param {Array} hashtags - 현재 입력된 해시태그 배열
 * @param {Function} onHashtagsChange - 해시태그 변경 시 호출되는 콜백 함수
 * @param {string} placeholder - TextField placeholder 텍스트
 * @param {string} boardType - 게시판 타입 (초기 추천 태그용)
 */
const HashtagInput = ({hashtags, onHashtagsChange, placeholder, boardType}) => {
    const [hashtagInput, setHashtagInput] = React.useState('');
    const [suggestions, setSuggestions] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    // 초기 추천 태그 (입력 없을 때 표시)
    const defaultSuggestions = boardType && BOARD_HASHTAGS_MAP[boardType]
        ? BOARD_HASHTAGS_MAP[boardType].slice(0, 6)
        : [];
    // 자동완성 검색 (디바운스)
    React.useEffect(() => {
        if (!hashtagInput.trim()) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const results = await searchHashtags(hashtagInput);
                setSuggestions(results);
            } catch (error) {
                console.error('해시태그 검색 실패:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [hashtagInput]);

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
        <Box sx={{mb: 3}}>
            <TextField
                fullWidth
                label="해시태그"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyPress={handleHashtagKeyPress}
                placeholder={placeholder || "해시태그를 입력하고 Enter를 누르세요"}
                InputProps={{
                    endAdornment: (
                        <>
                            {loading && <CircularProgress size={20} sx={{mr: 1}}/>}
                            <Button onClick={handleHashtagAdd} disabled={!hashtagInput.trim()}>
                                추가
                            </Button>
                        </>
                    ),
                }}
            />

            {/* 자동완성 추천 (검색 결과) */}
            {suggestions.length > 0 && (
                <Paper sx={{mt: 1, p: 1.5, bgcolor: 'background.default'}}>
                    <Typography variant="caption" color="text.secondary" sx={{mb: 1, display: 'block'}}>
                        추천 해시태그:
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', gap: 1}}>
                        {suggestions.map((suggestion) => (
                            <Chip
                                key={suggestion.id}
                                label={`#${suggestion.displayName || suggestion.name}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                    cursor: 'default',
                                    borderColor: suggestion.color || '#1976d2',
                                    color: suggestion.color || '#1976d2',
                                }}
                            />
                        ))}
                    </Stack>
                    {suggestions.length > 0 && suggestions[0].category && (
                        <Typography variant="caption" color="text.secondary" sx={{mt: 1, display: 'block'}}>
                            카테고리: {getBoardTypeLabel(suggestions[0].category)}
                        </Typography>
                    )}
                </Paper>
            )}

            {/* 초기 추천 태그 (입력 없고 검색 결과 없을 때) */}
            {!hashtagInput.trim() && suggestions.length === 0 && defaultSuggestions.length > 0 && (
                <Paper sx={{mt: 1, p: 1.5, bgcolor: 'action.hover'}}>
                    <Typography variant="caption" color="text.secondary" sx={{mb: 1, display: 'block'}}>
                        {boardType} 게시판 추천 태그:
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', gap: 1}}>
                        {defaultSuggestions.map((tag) => (
                            <Chip
                                key={tag.id}
                                icon={<span>{tag.icon}</span>}
                                label={`#${tag.name}`}
                                size="small"
                                color={tag.color || 'default'}
                                variant="outlined"
                                sx={{cursor: 'default'}}
                            />
                        ))}
                    </Stack>
                </Paper>
            )}

            {hashtags.length > 0 && (
                <Stack direction="row" spacing={1} sx={{mt: 1.5, flexWrap: 'wrap', gap: 1}}>
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
    boardType: PropTypes.string,
};

export default HashtagInput;
