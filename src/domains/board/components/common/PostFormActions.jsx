import React from 'react';
import PropTypes from 'prop-types';
import {Box, Button, CircularProgress,} from '@mui/material';

/**
 * 게시글 폼 액션 버튼 컴포넌트
 * 게시글 작성/수정 폼의 취소 및 제출 버튼을 관리하는 공통 컴포넌트
 *
 * @param {boolean} isEditMode - 수정 모드 여부
 * @param {boolean} submitting - 제출 중 상태
 * @param {Function} onCancel - 취소 버튼 클릭 시 호출되는 콜백
 * @param {Function} onSubmit - 제출 버튼 클릭 시 호출되는 콜백
 */
const PostFormActions = ({isEditMode, submitting, onCancel, onSubmit}) => {
    return (
        <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 2}}>
            <Button
                variant="outlined"
                onClick={onCancel}
                disabled={submitting}
            >
                취소
            </Button>
            <Button
                variant="contained"
                onClick={onSubmit}
                disabled={submitting}
                startIcon={submitting && <CircularProgress size={20}/>}
            >
                {submitting ? (isEditMode ? '수정 중...' : '작성 중...') : (isEditMode ? '수정 완료' : '작성 완료')}
            </Button>
        </Box>
    );
};

PostFormActions.propTypes = {
    isEditMode: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default PostFormActions;
