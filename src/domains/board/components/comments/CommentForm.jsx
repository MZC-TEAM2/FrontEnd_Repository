import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import { AttachFile, Close } from '@mui/icons-material';
import { useFileManager } from '../../hooks/useFileManager';

// 댓글 작성 폼 컴포넌트
const CommentForm = ({
  onSubmit,
  onCancel,
  placeholder = '댓글을 입력하세요...',
  allowAnonymous = false,
  allowAttachments = true,
  currentUserId,
  initialContent = '',
  initialAttachments = [],
}) => {
  const [content, setContent] = useState(initialContent);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  
  // 파일 관리
  const {
    files,
    existingFiles,
    deletedFileIds,
    setExistingFiles,
    handleFileChange,
    handleFileRemove,
    handleExistingFileRemove,
    resetFiles,
  } = useFileManager({ maxFiles: 5, maxFileSize: 10 * 1024 * 1024 });

  // 초기값 설정
  useEffect(() => {
    setContent(initialContent);
    setExistingFiles(initialAttachments);
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    if (!currentUserId) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content, isAnonymous, files, deletedFileIds);
      setContent('');
      setIsAnonymous(false);
      resetFiles();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setIsAnonymous(false);
    resetFiles();
    if (onCancel) {
      onCancel();
    }
  };

  const handleFileSelect = (e) => {
    handleFileChange(e);
    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
        sx={{ mb: 1 }}
      />

      {/* 기존 첨부파일 목록 */}
      {existingFiles.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
          {existingFiles.map((attachment) => (
            <Chip
              key={attachment.id}
              label={attachment.originalName}
              onDelete={() => handleExistingFileRemove(attachment.id)}
              size="small"
              color="default"
            />
          ))}
        </Stack>
      )}

      {/* 새로 추가된 첨부파일 목록 */}
      {files.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
          {files.map((file, index) => (
            <Chip
              key={index}
              label={`${file.name} (${(file.size / 1024).toFixed(1)}KB)`}
              onDelete={() => handleFileRemove(index)}
              deleteIcon={<Close />}
              size="small"
              color="primary"
              sx={{ maxWidth: 300 }}
            />
          ))}
        </Stack>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* 익명 체크박스 */}
          {allowAnonymous && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  disabled={isSubmitting}
                />
              }
              label="익명으로 작성"
            />
          )}

          {/* 파일 첨부 버튼 */}
          {allowAttachments && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx,.hwp,.txt"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                disabled={isSubmitting}
              />
              <IconButton
                onClick={handleAttachClick}
                disabled={isSubmitting || files.length + existingFiles.length >= 5}
                size="small"
                sx={{ ml: 1 }}
              >
                <AttachFile />
              </IconButton>
            </>
          )}
        </Box>

        {/* 버튼 */}
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          {onCancel && (
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? '작성 중...' : '댓글 작성'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CommentForm;
