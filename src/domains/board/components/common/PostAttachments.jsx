import React from 'react';
import {Box, Divider, IconButton, Stack, Typography} from '@mui/material';
import {AttachFile as AttachFileIcon, Download as DownloadIcon} from '@mui/icons-material';

/**
 * 게시글 첨부파일 목록
 * @param {Array} attachments - 첨부파일 배열 [{ id, originalName }, ...]
 * @param {Function} onDownload - 파일 다운로드 함수
 */
const PostAttachments = ({attachments, onDownload}) => {
    if (!attachments || attachments.length === 0) {
        return null;
    }

    return (
        <Box sx={{mb: 3}}>
            <Divider sx={{mb: 2}}/>
            <Typography variant="subtitle2" sx={{mb: 1, fontWeight: 600}}>
                첨부파일 ({attachments.length})
            </Typography>
            <Stack spacing={1}>
                {attachments.map((attachment) => (
                    <Box
                        key={attachment.id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            '&:hover': {bgcolor: 'action.hover'},
                        }}
                    >
                        <AttachFileIcon fontSize="small" color="action"/>
                        <Typography variant="body2" sx={{flex: 1}}>
                            {attachment.originalName}
                        </Typography>
                        <IconButton size="small" onClick={() => onDownload(attachment)} title="다운로드">
                            <DownloadIcon fontSize="small"/>
                        </IconButton>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};

export default PostAttachments;
