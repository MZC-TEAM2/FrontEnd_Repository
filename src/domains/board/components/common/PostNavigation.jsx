import React from 'react';
import {Box, Button, IconButton} from '@mui/material';
import {ArrowBack as ArrowBackIcon, Delete as DeleteIcon, Edit as EditIcon} from '@mui/icons-material';

/**
 * 게시글 상단 네비게이션 (목록/수정/삭제 버튼)
 * @param {Function} onBack - 목록으로 돌아가기 함수
 * @param {Function} onEdit - 수정 버튼 클릭 함수
 * @param {Function} onDelete - 삭제 버튼 클릭 함수
 * @param {Boolean} deleting - 삭제 중 상태
 */
const PostNavigation = ({onBack, onEdit, onDelete, deleting = false}) => {
    return (
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
            <Button startIcon={<ArrowBackIcon/>} onClick={onBack}>
                목록으로
            </Button>
            <Box>
                <IconButton onClick={onEdit} title="수정">
                    <EditIcon/>
                </IconButton>
                <IconButton onClick={onDelete} color="error" title="삭제" disabled={deleting}>
                    <DeleteIcon/>
                </IconButton>
            </Box>
        </Box>
    );
};

export default PostNavigation;
