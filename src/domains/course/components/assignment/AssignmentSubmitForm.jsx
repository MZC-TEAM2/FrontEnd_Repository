import React from 'react';
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
import { formatFileSize } from '../../../../utils/boardUtils';
import { useAssignmentSubmit } from '../../hooks/useAssignmentSubmit';

/**
 * 과제 제출 폼 컴포넌트 (UI only)
 */
const AssignmentSubmitForm = ({ assignmentId, existingSubmission, submissionMethod, onSuccess, onCancel }) => {
  const {
    submissionText,
    setSubmissionText,
    attachedFiles,
    uploadingFiles,
    error,
    setError,
    loading,
    handleFileSelect,
    handleFileRemove,
    handleSubmit,
  } = useAssignmentSubmit({ assignmentId, existingSubmission, submissionMethod, onSuccess });

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
      {submissionMethod !== 'FILE_UPLOAD' && (
        <TextField
          fullWidth
          label="제출 내용"
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          placeholder="과제 내용을 작성하세요"
          multiline
          rows={8}
          required={submissionMethod === 'TEXT_INPUT' || submissionMethod === 'BOTH'}
          sx={{ mb: 3 }}
        />
      )}

      {/* 파일 업로드 */}
      {submissionMethod !== 'TEXT_INPUT' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            첨부파일 {(submissionMethod === 'FILE_UPLOAD' || submissionMethod === 'BOTH') && <span style={{ color: 'red' }}>*</span>}
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
      )}

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
