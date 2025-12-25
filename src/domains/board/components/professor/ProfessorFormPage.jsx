import React from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import {ArrowBack as ArrowBackIcon,} from '@mui/icons-material';
import {useNavigate, useParams} from 'react-router-dom';
import {usePostForm} from '../../hooks/usePostForm';
import {useFileManager} from '../../hooks/useFileManager';
import {useProfessor} from '../../hooks/useProfessor';
import {usePostFormSubmit} from '../../hooks/usePostFormSubmit';
import HashtagInput from '../common/HashtagInput';
import FileAttachment from '../common/FileAttachment';
import PostTypeSelector from '../common/PostTypeSelector';
import PostFormActions from '../common/PostFormActions';

/**
 * 교수 게시판 작성/수정 페이지
 */
const ProfessorFormPage = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const isEditMode = Boolean(id);

    // Custom Hooks
    const {formData, setFormData, handleInputChange, validateForm} = usePostForm({
        title: '',
        content: '',
        postType: 'NORMAL',
        isAnonymous: false,
        hashtags: [],
    });
    const {
        files,
        existingFiles,
        deletedFileIds,
        setExistingFiles,
        handleFileChange,
        handleFileRemove,
        handleExistingFileRemove,
        uploadFiles,
    } = useFileManager();
    const {
        loading,
        error,
        setError,
        createProfessorPost,
        updateProfessorPost,
        loadProfessorForEdit,
    } = useProfessor();

    const {
        submitting,
        hashtags,
        setHashtags,
        handleSubmit,
        handleCancel,
    } = usePostFormSubmit({
        id,
        isEditMode,
        basePath: '/boards/professor',
        categoryId: 6,
        boardName: '교수 게시판',
        createPostFn: createProfessorPost,
        updatePostFn: updateProfessorPost,
        loadForEditFn: loadProfessorForEdit,
        setFormData,
        setExistingFiles,
        validateForm,
        setError,
        uploadFiles,
        deletedFileIds,
        formData,
    });

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400}}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Box>
            {/* 헤더 */}
            <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                <Button
                    startIcon={<ArrowBackIcon/>}
                    onClick={handleCancel}
                    sx={{mr: 2}}
                >
                    {isEditMode ? '취소' : '목록으로'}
                </Button>
                <Typography variant="h5" sx={{fontWeight: 600}}>
                    {isEditMode ? '교수 게시글 수정' : '교수 게시글 작성'}
                </Typography>
            </Box>

            {/* 에러 메시지 */}
            {error && (
                <Alert severity="error" sx={{mb: 3}} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* 폼 */}
            <Paper sx={{p: 4}}>
                {/* 게시글 유형 */}
                <PostTypeSelector
                    value={formData.postType}
                    onChange={handleInputChange}
                />

                {/* 제목 */}
                <TextField
                    fullWidth
                    label="제목"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    sx={{mb: 3}}
                />

                {/* 내용 */}
                <TextField
                    fullWidth
                    label="내용"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    multiline
                    rows={15}
                    required
                    sx={{mb: 3}}
                />

                {/* 해시태그 */}
                <HashtagInput
                    hashtags={hashtags}
                    onHashtagsChange={setHashtags}
                />

                {/* 파일 첨부 */}
                <FileAttachment
                    files={files}
                    existingFiles={existingFiles}
                    onFileChange={handleFileChange}
                    onFileRemove={handleFileRemove}
                    onExistingFileRemove={handleExistingFileRemove}
                />

                {/* 익명 여부 */}
                <FormControlLabel
                    control={
                        <Checkbox
                            name="isAnonymous"
                            checked={formData.isAnonymous}
                            onChange={(e) => setFormData(prev => ({...prev, isAnonymous: e.target.checked}))}
                        />
                    }
                    label="익명으로 작성"
                    sx={{mb: 3}}
                />

                {/* 액션 버튼 */}
                <PostFormActions
                    submitting={submitting}
                    isEditMode={isEditMode}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </Paper>
        </Box>
    );
};

export default ProfessorFormPage;
