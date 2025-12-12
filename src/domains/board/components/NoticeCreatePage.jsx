import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { createNotice } from '../../../api/boardApi';

const NoticeCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    postType: 'NORMAL',
    isAnonymous: false,
  });
  const [files, setFiles] = useState([]);

  // 카테고리 ID (실제로는 API에서 가져오거나 상수로 관리)
  const NOTICE_CATEGORY_ID = 1; // NOTICE 카테고리의 실제 ID로 변경 필요

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const handleFileRemove = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // JSON 데이터를 Blob으로 변환하여 추가
      const requestDto = {
        categoryId: NOTICE_CATEGORY_ID,
        title: formData.title,
        content: formData.content,
        postType: formData.postType,
        isAnonymous: formData.isAnonymous,
      };
      
      formDataToSend.append(
        'request',
        new Blob([JSON.stringify(requestDto)], { type: 'application/json' })
      );

      // 파일 추가
      files.forEach((file) => {
        formDataToSend.append('files', file);
      });

      const response = await createNotice(formDataToSend);
      
      // 생성된 게시글 상세 페이지로 이동
      navigate(`/notices/${response.id}`);
    } catch (err) {
      console.error('공지사항 생성 실패:', err);
      setError(err.response?.data?.message || '공지사항 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* 상단 네비게이션 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/notices')}>
          목록으로
        </Button>
      </Box>

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 작성 폼 */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          공지사항 작성
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

          {/* 파일 첨부 */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFileIcon />}
            >
              파일 첨부
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileChange}
              />
            </Button>

            {/* 첨부된 파일 목록 */}
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
              onClick={() => navigate('/notices')}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? '작성 중...' : '작성 완료'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default NoticeCreatePage;
