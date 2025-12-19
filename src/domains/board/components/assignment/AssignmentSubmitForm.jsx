import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
} from '@mui/material';
import { 
  Upload as UploadIcon, 
  Cancel as CancelIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAssignment } from '../../hooks/useAssignment';
import attachmentApi from '../../../../api/attachmentApi';

/**
 * 과제 제출 폼 컴포넌트
 */
const AssignmentSubmitForm = ({ assignmentId, onSuccess, onCancel }) => {
  const [submissionText, setSubmissionText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [error, setError] = useState(null);

  const { submitAssignment, loading } = useAssignment();

  // 파일 선택 처리
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    setError(null);

    try {
      const uploadedFiles = [];
      
      for (const file of files) {
        const response = await attachmentApi.uploadFile(file, 'DOCUMENT');

        if (response.status === 'SUCCESS') {
          uploadedFiles.push({
            id: response.data.id,
            name: response.data.originalName,
            size: response.data.fileSize,
          });
        }
      }

      setAttachedFiles([...attachedFiles, ...uploadedFiles]);
    } catch (err) {
      console.error('파일 업로드 에러:', err);
      setError(err.response?.data?.message || '파일 업로드에 실패했습니다.');
    } finally {
      setUploadingFiles(false);
      e.target.value = ''; // 같은 파일 재선택 가능하도록
    }
  };

  // 첨부파일 삭제
  const handleFileRemove = (fileId) => {
    setAttachedFiles(attachedFiles.filter(f => f.id !== fileId));
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!submissionText.trim()) {
      setError('제출 내용을 입력하세요.');
      return;
    }

    try {
      await submitAssignment(assignmentId, {
        content: submissionText,
        attachmentIds: attachedFiles.map(f => f.id),
      });
      alert('과제가 제출되었습니다.');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || '과제 제출에 실패했습니다.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        과제 제출
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 제출 내용 */}
      <TextField
        fullWidth
        label="제출 내용"
        value={submissionText}
        onChange={(e) => setSubmissionText(e.target.value)}
        placeholder="과제 내용을 작성하세요"
        multiline
        rows={8}
        required
        sx={{ mb: 3 }}
      />

      {/* 파일 업로드 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          첨부파일
        </Typography>
        
        <Button
          variant="outlined"
          component="label"
          startIcon={uploadingFiles ? <CircularProgress size={20} /> : <AttachFileIcon />}
          disabled={uploadingFiles || loading}
          sx={{ mb: 2 }}
        >
          {uploadingFiles ? '업로드 중...' : '파일 선택'}
          <input
            type="file"
            hidden
            multiple
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.hwp,.txt,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif"
          />
        </Button>

        {/* 첨부된 파일 목록 */}
        {attachedFiles.length > 0 && (
          <Paper variant="outlined" sx={{ p: 1 }}>
            <List dense>
              {attachedFiles.map((file) => (
                <ListItem key={file.id}>
                  <ListItemText
                    primary={file.name}
                    secondary={formatFileSize(file.size)}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleFileRemove(file.id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          * 허용 파일: 문서(PDF, DOC, HWP, TXT), 압축파일(ZIP, RAR, 7Z), 이미지(JPG, PNG, GIF)
        </Typography>
      </Box>

      {/* 제출 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={onCancel}
          disabled={loading}
        >
          취소
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
          disabled={loading}
        >
          제출
        </Button>
      </Box>
    </Box>
  );
};

export default AssignmentSubmitForm;
