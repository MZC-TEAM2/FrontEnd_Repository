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
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState(initialAttachments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // 초기값 설정
  useEffect(() => {
    setContent(initialContent);
    setExistingAttachments(initialAttachments);
  }, [initialContent, initialAttachments]);

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
      // 삭제된 첨부파일 ID 계산
      const originalAttachmentIds = initialAttachments.map(att => att.id);
      const currentAttachmentIds = existingAttachments.map(att => att.id);
      const removedAttachmentIds = originalAttachmentIds.filter(id => !currentAttachmentIds.includes(id));

      await onSubmit(content, isAnonymous, attachedFiles, removedAttachmentIds);
      setContent('');
      setIsAnonymous(false);
      setAttachedFiles([]);
      setExistingAttachments([]);
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
    setAttachedFiles([]);
    if (onCancel) {
      onCancel();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // 최대 5개 파일 제한
      const totalFiles = attachedFiles.length + files.length;
      if (totalFiles > 5) {
        alert('최대 5개까지만 첨부할 수 있습니다.');
        return;
      }

      // 파일 크기 제한 (10MB)
      const maxSize = 10 * 1024 * 1024;
      const invalidFiles = files.filter(file => file.size > maxSize);
      if (invalidFiles.length > 0) {
        alert('10MB 이하의 파일만 첨부할 수 있습니다.');
        return;
      }

      setAttachedFiles([...attachedFiles, ...files]);
    }
    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleRemoveExistingAttachment = (attachmentId) => {
    setExistingAttachments(existingAttachments.filter(att => att.id !== attachmentId));
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
      {existingAttachments.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
          {existingAttachments.map((attachment) => (
            <Chip
              key={attachment.id}
              label={attachment.originalName}
              onDelete={() => handleRemoveExistingAttachment(attachment.id)}
              size="small"
              color="default"
            />
          ))}
        </Stack>
      )}

      {/* 새로 추가된 첨부파일 목록 */}
      {attachedFiles.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
          {attachedFiles.map((file, index) => (
            <Chip
              key={index}
              label={`${file.name} (${(file.size / 1024).toFixed(1)}KB)`}
              onDelete={() => handleRemoveFile(index)}
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
                disabled={isSubmitting || attachedFiles.length >= 5}
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
