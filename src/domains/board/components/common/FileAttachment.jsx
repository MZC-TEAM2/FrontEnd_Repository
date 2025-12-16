import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

/**
 * 파일 첨부 컴포넌트
 * 게시글 작성/수정 시 파일 첨부를 관리하는 공통 컴포넌트
 * 
 * @param {boolean} isEditMode - 수정 모드 여부
 * @param {Array} existingFiles - 기존 첨부파일 목록 (수정 시)
 * @param {Array} files - 새로 추가된 파일 목록
 * @param {Function} onFileChange - 파일 선택 시 호출되는 콜백
 * @param {Function} onFileRemove - 새 파일 삭제 시 호출되는 콜백
 * @param {Function} onExistingFileRemove - 기존 파일 삭제 시 호출되는 콜백
 */
const FileAttachment = ({
  isEditMode,
  existingFiles,
  files,
  onFileChange,
  onFileRemove,
  onExistingFileRemove,
}) => {
  return (
    <>
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
                  <IconButton edge="end" onClick={() => onExistingFileRemove(file.id)} color="error">
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
            onChange={onFileChange}
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
                  <IconButton edge="end" onClick={() => onFileRemove(index)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </>
  );
};

FileAttachment.propTypes = {
  isEditMode: PropTypes.bool.isRequired,
  existingFiles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      originalName: PropTypes.string,
      size: PropTypes.number,
    })
  ).isRequired,
  files: PropTypes.array.isRequired,
  onFileChange: PropTypes.func.isRequired,
  onFileRemove: PropTypes.func.isRequired,
  onExistingFileRemove: PropTypes.func.isRequired,
};

export default FileAttachment;
