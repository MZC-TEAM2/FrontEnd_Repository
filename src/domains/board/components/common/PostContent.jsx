import React from 'react';
import {Box, Typography} from '@mui/material';

/**
 * 게시글 본문
 * @param {String} content - 게시글 내용
 */
const PostContent = ({content}) => {
    return (
        <Box
            sx={{
                minHeight: 300,
                mb: 3,
                '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                },
            }}
        >
            <Typography
                variant="body1"
                sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.8,
                    color: 'text.primary',
                }}
            >
                {content}
            </Typography>
        </Box>
    );
};

export default PostContent;
