import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAssignment } from '../../hooks/useAssignment';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const AssignmentFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = React.useState({
    courseId: '',
    title: '',
    content: '',
    dueDate: new Date(),
    maxScore: 100,
    submissionMethod: 'FILE_UPLOAD',
    attachmentUrls: [],
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const {
    getAssignment,
    createAssignment,
    updateAssignment,
    loading: actionLoading,
  } = useAssignment();

  // 수정 모드: 기존 과제 데이터 로드
  React.useEffect(() => {
    if (isEditMode) {
      const loadAssignment = async () => {
        setLoading(true);
        try {
          const data = await getAssignment(id);
          setFormData({
            courseId: data.courseId,
            title: data.post.title,
            content: data.post.content,
            dueDate: new Date(data.dueDate),
            maxScore: data.maxScore,
            submissionMethod: data.submissionMethod,
            attachmentUrls: data.attachmentUrls || [],
          });
        } catch (err) {
          setError('과제를 불러오는데 실패했습니다.');
        } finally {
          setLoading(false);
        }
      };
      loadAssignment();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      dueDate: date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (!formData.title.trim()) {
      setError('제목을 입력하세요.');
      return;
    }
    if (!formData.content.trim()) {
      setError('설명을 입력하세요.');
      return;
    }
    if (!formData.courseId) {
      setError('강의 ID를 입력하세요.');
      return;
    }
    if (formData.maxScore <= 0) {
      setError('만점은 0보다 커야 합니다.');
      return;
    }

    try {
      // 로컬 시간을 그대로 유지하여 ISO 형식으로 변환 (타임존 변환 방지)
      const localDueDate = new Date(formData.dueDate.getTime() - formData.dueDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19);

      const payload = {
        ...formData,
        dueDate: localDueDate,
      };

      if (isEditMode) {
        await updateAssignment(id, payload);
        alert('과제가 수정되었습니다.');
      } else {
        await createAssignment(payload);
        alert('과제가 등록되었습니다.');
      }
      navigate('/boards/assignment');
    } catch (err) {
      setError(err.message || '과제 저장에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    navigate('/boards/assignment');
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
          {isEditMode ? '과제 수정' : '과제 등록'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* 강의 ID */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="강의 ID"
                name="courseId"
                type="number"
                value={formData.courseId}
                onChange={handleInputChange}
                placeholder="강의 ID를 입력하세요"
                required
                disabled={isEditMode} // 수정 시에는 변경 불가
              />
            </Grid>

            {/* 제목 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="과제 제목"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="과제 제목을 입력하세요"
                required
              />
            </Grid>

            {/* 설명 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="과제 설명"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="과제 설명을 입력하세요"
                multiline
                rows={8}
                required
              />
            </Grid>

            {/* 마감일 */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="마감일"
                  value={formData.dueDate}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  ampm={false}
                />
              </LocalizationProvider>
            </Grid>

            {/* 만점 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="만점"
                name="maxScore"
                type="number"
                value={formData.maxScore}
                onChange={handleInputChange}
                placeholder="만점을 입력하세요"
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* 제출 방법 */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>제출 방법</InputLabel>
                <Select
                  name="submissionMethod"
                  value={formData.submissionMethod}
                  onChange={handleInputChange}
                  label="제출 방법"
                >
                  <MenuItem value="FILE_UPLOAD">파일 업로드</MenuItem>
                  <MenuItem value="TEXT_INPUT">텍스트 입력</MenuItem>
                  <MenuItem value="BOTH">파일 + 텍스트</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* TODO: 첨부파일 업로드 기능 추가 */}
            {/* <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                참고 자료: (파일 업로드 기능은 추후 추가 예정)
              </Typography>
            </Grid> */}
          </Grid>

          {/* 제출 버튼 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={actionLoading}
            >
              {isEditMode ? '수정' : '등록'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AssignmentFormPage;
