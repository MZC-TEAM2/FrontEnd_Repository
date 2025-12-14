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
import { getNoticeDetail } from '../../../../api/noticeApi';
import { updatePost } from '../../../../api/postApi';
import attachmentApi from '../../../../api/attachmentApi';
import { usePostForm } from '../../hooks/usePostForm';
import { useFileManager } from '../../hooks/useFileManager';

const NoticeEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
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
  } = useFileManager();

  // 카테고리 ID (실제로는 API에서 가져오거나 상수로 관리)
  const NOTICE_CATEGORY_ID = 1; // NOTICE 카테고리의 실제 ID로 변경 필요

  // 기존 게시글 데이터 로드
  useEffect(() => {
    fetchNoticeData();
  }, [id]);

  const fetchNoticeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNoticeDetail(id);
      setFormData({
        title: data.title || '',
        content: data.content || '',
        postType: data.postType || 'NORMAL',
        isAnonymous: data.isAnonymous || false,
      });
      setExistingFiles(data.attachments || []);
    } catch (err) {
      console.error('공지사항 조회 실패:', err);
      setError('공지사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };



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
      // 1단계: 새 파일 업로드
      let newAttachmentIds = [];
      if (files.length > 0) {
        console.log('새 파일 업로드 중... (' + files.length + '개)');
        const uploadResult = await attachmentApi.uploadMultipleFiles(files, 'POST_CONTENT');
        newAttachmentIds = uploadResult.data.map(file => file.id);
        console.log('파일 업로드 완료:', newAttachmentIds);
      }

      // 2단계: 게시글 수정
      console.log('게시글 수정 중...');
      const requestData = {
        categoryId: NOTICE_CATEGORY_ID,
        title: formData.title,
        content: formData.content,
        postType: formData.postType,
        isAnonymous: formData.isAnonymous,
        attachmentIds: newAttachmentIds,
        deleteAttachmentIds: deletedFileIds.length > 0 ? deletedFileIds : [],
      };

      await updatePost(id, requestData);
      console.log('게시글 수정 완료');
      
      // 수정된 게시글 상세 페이지로 이동 (replace로 히스토리 대체)
      navigate(`/notices/${id}`, { replace: true });
      // 페이지 강제 새로고침으로 최신 데이터 가져오기
      window.location.reload();
    } catch (err) {
      console.error('공지사항 수정 실패:', err);
      setError(err.response?.data?.message || '공지사항 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
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
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/notices/${id}`)}>
          취소
        </Button>
      </Box>

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 수정 폼 */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          공지사항 수정
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

          {/* 기존 첨부파일 */}
          {existingFiles.length > 0 && (
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
              파일 추가
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
              onClick={() => navigate(`/notices/${id}`)}
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
              {submitting ? '수정 중...' : '수정 완료'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default NoticeEditPage;
