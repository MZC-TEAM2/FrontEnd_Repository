import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function NoticeForm({
  mode = 'create', // 'create' | 'edit'
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
  error = null,
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [allowComments, setAllowComments] = useState(true);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setAllowComments(initialData.allowComments ?? true);
    }
  }, [mode, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      allowComments,
    });
  };

  const isValid = title.trim().length > 0 && content.trim().length > 0;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onCancel} sx={{ mb: 2 }}>
        {mode === 'edit' ? '돌아가기' : '목록으로'}
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          {mode === 'create' ? '공지사항 작성' : '공지사항 수정'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            inputProps={{ maxLength: 200 }}
            helperText={`${title.length}/200`}
            disabled={submitting}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            multiline
            rows={10}
            disabled={submitting}
            sx={{ mb: 3 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={allowComments}
                onChange={(e) => setAllowComments(e.target.checked)}
                disabled={submitting}
              />
            }
            label="댓글 허용"
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={submitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !isValid}
            >
              {submitting ? '저장 중...' : mode === 'create' ? '작성' : '수정'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
