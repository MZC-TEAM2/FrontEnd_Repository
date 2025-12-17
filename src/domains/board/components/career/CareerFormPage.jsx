import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { usePostForm } from '../../hooks/usePostForm';
import { useFileManager } from '../../hooks/useFileManager';
import { useCareer } from '../../hooks/useCareer';
import { usePostFormSubmit } from '../../hooks/usePostFormSubmit';
import HashtagInput from '../common/HashtagInput';
import FileAttachment from '../common/FileAttachment';
import PostTypeSelector from '../common/PostTypeSelector';
import PostFormActions from '../common/PostFormActions';

const CareerFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Custom Hooks
  const { formData, setFormData, handleInputChange, validateForm } = usePostForm({
    title: '',
    content: '',
    postType: 'NORMAL',
    isAnonymous: false,
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
    createCareerPost,
    updateCareerPost,
    loadCareerForEdit,
  } = useCareer();

  const {
    submitting,
    hashtags,
    setHashtags,
    handleSubmit,
    handleCancel,
  } = usePostFormSubmit({
    id,
    isEditMode,
    basePath: '/boards/career',
    categoryId: 9,
    boardName: '취업 게시판',
    createPostFn: createCareerPost,
    updatePostFn: updateCareerPost,
    loadForEditFn: loadCareerForEdit,
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 상단 네비게이션 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleCancel}>
          {isEditMode ? '취소' : '목록으로'}
        </Button>
      </Box>

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 작성/수정 폼 */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          {isEditMode ? '취업 게시판 수정' : '취업 게시판 작성'}
        </Typography>

        {/* 게시글 타입 */}
        <PostTypeSelector
          boardType="CAREER"
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
            placeholder="제목을 입력하세요"
            required
            sx={{ mb: 3 }}
          />

          {/* 내용 */}
          <TextField
            fullWidth
            label="내용"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="내용을 입력하세요"
            multiline
            rows={12}
            required
            sx={{ mb: 3 }}
          />

          {/* 해시태그 입력 */}
          <HashtagInput
            hashtags={hashtags}
            onHashtagsChange={setHashtags}
            placeholder="해시태그를 입력하고 Enter를 누르세요 (예: 채용공고, 면접후기)"
          />

          {/* 파일 첨부 */}
          <FileAttachment
            isEditMode={isEditMode}
            existingFiles={existingFiles}
            files={files}
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
                onChange={handleInputChange}
              />
            }
            label="익명으로 작성"
            sx={{ mb: 3 }}
          />

          {/* 제출 버튼 */}
          <PostFormActions
            isEditMode={isEditMode}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
      </Paper>
    </Box>
  );
};

export default CareerFormPage;
