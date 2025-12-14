import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { usePostForm } from '../../hooks/usePostForm';
import { useFileManager } from '../../hooks/useFileManager';
import { useNotice } from '../../hooks/useNotice';

const NoticeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [submitting, setSubmitting] = useState(false);
  
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
    createNoticePost,
    updateNoticePost,
    loadNoticeForEdit,
  } = useNotice();

  // 카테고리 ID (실제로는 API에서 가져오거나 상수로 관리)
  const NOTICE_CATEGORY_ID = 1;

  // 수정 모드일 때 기존 게시글 데이터 로드
  useEffect(() => {
    if (isEditMode) {
      loadNoticeForEdit(id, setFormData, setExistingFiles);
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const attachmentIds = await uploadFiles();
      
      if (isEditMode) {
        await updateNoticePost(id, formData, attachmentIds, deletedFileIds, NOTICE_CATEGORY_ID);
        navigate(`/notices/${id}`, { replace: true });
        window.location.reload();
      } else {
        const response = await createNoticePost(formData, attachmentIds, NOTICE_CATEGORY_ID);
        navigate(`/notices/${response.id}`);
      }
    } catch (err) {
      console.error(`공지사항 ${isEditMode ? '수정' : '생성'} 실패:`, err);
      setError(err.response?.data?.message || `공지사항 ${isEditMode ? '수정' : '생성'}에 실패했습니다.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/notices/${id}`);
    } else {
      navigate('/notices');
    }
  };

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
          {isEditMode ? '공지사항 수정' : '공지사항 작성'}
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* 게시글 타입 */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>게시글 유형</InputLabel>
            <Select
              name="postType"
              value={formData.postType}
              onChange={handleInputChange}
              label="게시글 유형"
            >
              <MenuItem value="NORMAL">일반</MenuItem>
              <MenuItem value="URGENT">긴급</MenuItem>
              <MenuItem value="NOTICE">공지</MenuItem>
            </Select>
          </FormControl>

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

          {/* 기존 첨부파일 (수정 모드에서만 표시) */}
          {isEditMode && existingFiles.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                기존 첨부파일
              </Typography>
              <List sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                {existingFiles.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={file.originalName}
                      secondary={file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleExistingFileRemove(file.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* 새 파일 첨부 */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFileIcon />}
            >
              {isEditMode ? '파일 추가' : '파일 첨부'}
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileChange}
              />
            </Button>

            {/* 새로 추가된 파일 목록 */}
            {files.length > 0 && (
              <List sx={{ mt: 2 }}>
                {files.map((file, index) => (
                  <ListItem key={index} sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(2)} KB`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleFileRemove(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* 익명 여부 (공지사항은 보통 익명 불가) */}
          <FormControlLabel
            control={
              <Checkbox
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
                disabled // 공지사항은 익명 불가
              />
            }
            label="익명으로 작성"
            sx={{ mb: 3 }}
          />

          {/* 제출 버튼 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={submitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting && <CircularProgress size={20} />}
            >
              {submitting ? (isEditMode ? '수정 중...' : '작성 중...') : (isEditMode ? '수정 완료' : '작성 완료')}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default NoticeFormPage;
