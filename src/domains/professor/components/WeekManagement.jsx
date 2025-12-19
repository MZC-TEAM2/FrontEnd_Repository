/**
 * 주차 관리 컴포넌트
 * 강의의 주차별 콘텐츠를 관리하는 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VideoLibrary as VideoIcon,
  Description as DocumentIcon,
  Link as LinkIcon,
  Quiz as QuizIcon,
  CloudUpload as UploadIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

/**
 * WeekManagement 컴포넌트
 * @param {number} courseId - 강의 ID
 * @param {Array} weeks - 주차 목록
 * @param {Function} onCreateWeek - 주차 생성 핸들러
 * @param {Function} onUpdateWeek - 주차 수정 핸들러
 * @param {Function} onDeleteWeek - 주차 삭제 핸들러
 * @param {Function} onCreateContent - 콘텐츠 추가 핸들러 (application/json)
 * @param {Function} onDeleteContent - 콘텐츠 삭제 핸들러
 */
const WeekManagement = ({
  courseId,
  weeks = [],
  onCreateWeek,
  onUpdateWeek,
  onDeleteWeek,
  onCreateContent,
  onDeleteContent,
}) => {
  const MAX_WEEKS = 16;

  const [expandedWeek, setExpandedWeek] = useState(null);
  const [weekDialogOpen, setWeekDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [editingWeek, setEditingWeek] = useState(null);
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [weekFormData, setWeekFormData] = useState({
    weekNumber: 1,
    weekTitle: '',
    contents: [],
  });
  const [contentFormData, setContentFormData] = useState({
    contentType: 'DOCUMENT',
    title: '',
    contentUrl: '',
    duration: '',
  });

  // 스펙(12.5)에 맞춘 콘텐츠 추가 폼(파일/링크)
  const [contentUploadForm, setContentUploadForm] = useState({
    contentType: 'DOCUMENT',
    title: '',
    description: '',
    contentUrl: '',
    duration: '',
  });
  const [contentSubmitLoading, setContentSubmitLoading] = useState(false);
  const [contentSubmitError, setContentSubmitError] = useState(null);

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId) || null;

  const getNextAvailableWeekNumber = () => {
    const used = new Set(
      weeks
        .map((w) => Number(w.weekNumber))
        .filter((n) => Number.isFinite(n) && n > 0)
    );
    for (let i = 1; i <= MAX_WEEKS; i += 1) {
      if (!used.has(i)) return i;
    }
    return null;
  };

  const canCreateMoreWeeks = getNextAvailableWeekNumber() !== null;

  const isValidUrl = (value) => {
    if (!value) return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  // NOTE: 12.5가 application/json + contentUrl 기반으로 변경되어 파일 크기 표시가 불필요해짐

  const canSubmitContent = () => {
    if (!contentUploadForm.title.trim()) return false;
    return isValidUrl(contentUploadForm.contentUrl.trim());
  };

  // 첫 번째 주차 자동 확장
  useEffect(() => {
    if (weeks.length > 0 && !expandedWeek) {
      setExpandedWeek(weeks[0].id);
    }
  }, [weeks, expandedWeek]);

  const handleWeekExpand = (weekId) => (event, isExpanded) => {
    setExpandedWeek(isExpanded ? weekId : null);
  };

  const handleCreateWeekClick = () => {
    const nextWeekNumber = getNextAvailableWeekNumber();
    if (!nextWeekNumber) {
      alert(`주차는 최대 ${MAX_WEEKS}개까지 생성할 수 있습니다.`);
      return;
    }
    setWeekFormData({
      weekNumber: nextWeekNumber,
      weekTitle: `${nextWeekNumber}주차`,
      contents: [],
    });
    setEditingWeek(null);
    setWeekDialogOpen(true);
  };

  const handleEditWeekClick = (week) => {
    setWeekFormData({
      weekNumber: week.weekNumber,
      weekTitle: week.weekTitle,
      contents: [], // 수정 시에는 콘텐츠를 별도로 관리
    });
    setEditingWeek(week);
    setWeekDialogOpen(true);
  };

  const handleWeekSubmit = () => {
    console.log('=== 주차 제출 시작 ===');
    console.log('전체 weekFormData:', weekFormData);
    console.log('콘텐츠 개수:', weekFormData.contents?.length || 0);
    
    if (editingWeek) {
      // 명세(12.3): 수정은 weekTitle만
      const updateData = { weekTitle: weekFormData.weekTitle };
      console.log('수정 데이터 (weekTitle만):', updateData);
      onUpdateWeek(editingWeek.id, updateData);
    } else {
      // 프론트에서 최대 주차 제한(백엔드 16개 제한과 동일)도 선제 적용
      const weekNumber = Number(weekFormData.weekNumber);
      if (!Number.isFinite(weekNumber) || weekNumber < 1 || weekNumber > MAX_WEEKS) {
        alert(`주차 번호는 1 ~ ${MAX_WEEKS} 사이여야 합니다.`);
        return;
      }
      // 생성 시에는 contents 포함
      const submitData = { ...weekFormData };
      console.log('생성 데이터 (contents 포함):', submitData);
      onCreateWeek(submitData);
    }
    setWeekDialogOpen(false);
    setEditingWeek(null);
  };

  const handleAddContentToWeekForm = () => {
    console.log('=== 콘텐츠 추가 시작 ===');
    console.log('현재 contentFormData:', contentFormData);
    
    if (!contentFormData.title.trim() || !contentFormData.contentUrl.trim()) {
      alert('콘텐츠 제목과 URL을 입력해주세요.');
      return;
    }

    const newContent = { ...contentFormData };

    // 주차 생성 시 콘텐츠는 DOCUMENT/LINK만 허용. duration은 사용하지 않음.
    delete newContent.duration;

    console.log('추가될 콘텐츠:', newContent);
    console.log('현재 weekFormData.contents:', weekFormData.contents);

    const updatedContents = [...weekFormData.contents, newContent];
    console.log('업데이트될 contents:', updatedContents);

    setWeekFormData({
      ...weekFormData,
      contents: updatedContents,
    });

    // 폼 초기화
    setContentFormData({
      contentType: 'DOCUMENT',
      title: '',
      contentUrl: '',
      duration: '',
    });
    
    console.log('=== 콘텐츠 추가 완료 ===');
  };

  const handleRemoveContentFromWeekForm = (index) => {
    setWeekFormData({
      ...weekFormData,
      contents: weekFormData.contents.filter((_, i) => i !== index),
    });
  };

  const handleAddContentClick = (weekId) => {
    setSelectedWeekId(weekId);
    setContentUploadForm({
      contentType: 'DOCUMENT',
      title: '',
      description: '',
      contentUrl: '',
      duration: '',
    });
    setContentSubmitLoading(false);
    setContentSubmitError(null);
    setContentDialogOpen(true);
  };

  const handleSubmitCreateContent = async () => {
    if (!selectedWeekId) return;
    if (!onCreateContent) return;

    setContentSubmitError(null);
    setContentSubmitLoading(true);

    const { contentType, title, description, contentUrl } = contentUploadForm;

    if (!title.trim()) {
      setContentSubmitError('콘텐츠 제목을 입력해주세요.');
      setContentSubmitLoading(false);
      return;
    }

    if (!contentUrl.trim() || !isValidUrl(contentUrl.trim())) {
      setContentSubmitError('유효한 URL을 입력해주세요. (예: https://...)');
      setContentSubmitLoading(false);
      return;
    }

    const payload = {
      contentType,
      title: title.trim(),
      description: description.trim() || undefined,
      contentUrl: contentUrl.trim(),
    };

    // 디버깅 로그: application/json 전송
    console.log('[WeekManagement] createContent payload (json)', {
      courseId,
      weekId: selectedWeekId,
      ...payload,
    });

    try {
      await onCreateContent(selectedWeekId, payload);
      setContentDialogOpen(false);
    } catch (e) {
      setContentSubmitError(e?.message || '콘텐츠 추가에 실패했습니다.');
    } finally {
      setContentSubmitLoading(false);
    }
  };

  const getContentIcon = (contentType) => {
    switch (contentType) {
      case 'VIDEO':
        return <VideoIcon />;
      case 'DOCUMENT':
        return <DocumentIcon />;
      case 'LINK':
        return <LinkIcon />;
      case 'QUIZ':
        return <QuizIcon />;
      default:
        return <DocumentIcon />;
    }
  };

  const getContentTypeLabel = (contentType) => {
    switch (contentType) {
      case 'DOCUMENT':
        return '자료';
      case 'LINK':
        return '강의 링크';
      default:
        return contentType;
    }
  };

  return (
    <Box>
      {/* 주차 목록 */}
      {weeks.length > 0 ? (
        weeks.map((week) => (
          <Accordion
            key={week.id}
            expanded={expandedWeek === week.id}
            onChange={handleWeekExpand(week.id)}
            sx={{
              mb: 2,
              '&:before': { display: 'none' },
              boxShadow: 2,
              position: 'relative',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 2,
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {week.weekNumber}주차: {week.weekTitle || '미등록'}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              {/* 버튼은 AccordionSummary 밖으로 이동 */}
            </AccordionSummary>
            
            {/* 액션 버튼들을 별도 영역으로 분리 */}
            <Box 
              sx={{ 
                position: 'absolute', 
                right: 48, 
                top: 12,
                display: 'flex', 
                gap: 1,
                zIndex: 1,
              }}
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditWeekClick(week);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('정말 이 주차를 삭제하시겠습니까?')) {
                    onDeleteWeek(week.id);
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <AccordionDetails>
              {/* 콘텐츠 목록 */}
              {week.contents && week.contents.length > 0 ? (
                <List>
                  {week.contents.map((content, index) => (
                    <React.Fragment key={content.id}>
                      <ListItem
                        sx={{
                          bgcolor: 'background.default',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                          {getContentIcon(content.contentType)}
                        </Box>
                        <ListItemText
                          primary={content.title}
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Chip
                                label={getContentTypeLabel(content.contentType)}
                                size="small"
                                variant="outlined"
                              />
                              {content.duration && (
                                <Chip
                                  label={content.duration}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                          <IconButton
                            size="small"
                            onClick={() => {
                              // TODO: 콘텐츠 수정 다이얼로그
                              console.log('Edit content', content);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              if (window.confirm('정말 이 콘텐츠를 삭제하시겠습니까?')) {
                                onDeleteContent(content.id);
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                      </ListItem>
                      {index < week.contents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                  <Typography variant="body2">등록된 콘텐츠가 없습니다</Typography>
                </Box>
              )}

              {/* 영상 업로드 버튼 */}
              <Box sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => handleAddContentClick(week.id)}
                >
                  콘텐츠 추가
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            등록된 주차가 없습니다
          </Typography>
          {canCreateMoreWeeks && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateWeekClick}
            >
              첫 번째 주차 생성
            </Button>
          )}
        </Paper>
      )}

      {/* 주차 추가 버튼 (하단) */}
      {weeks.length > 0 && canCreateMoreWeeks && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateWeekClick}
          >
            주차 생성
          </Button>
        </Box>
      )}

      {/* 주차 생성/수정 다이얼로그 */}
      <Dialog open={weekDialogOpen} onClose={() => setWeekDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingWeek ? '주차 수정' : '주차 생성'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="주차 번호"
              value={weekFormData.weekNumber}
              onChange={(e) =>
                setWeekFormData({
                  ...weekFormData,
                  weekNumber: parseInt(e.target.value) || 1,
                })
              }
              sx={{ mb: 2 }}
              inputProps={{ min: 1, max: MAX_WEEKS }}
              disabled={!!editingWeek}
              helperText={
                editingWeek ? '주차 번호는 변경할 수 없습니다.' : `주차 번호는 1 ~ ${MAX_WEEKS} 사이로 입력하세요.`
              }
            />
            <TextField
              fullWidth
              label="주차 제목"
              value={weekFormData.weekTitle}
              onChange={(e) =>
                setWeekFormData({
                  ...weekFormData,
                  weekTitle: e.target.value,
                })
              }
              sx={{ mb: 3 }}
            />

            {/* 콘텐츠 추가 섹션 (생성 시에만) */}
            {!editingWeek && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  콘텐츠 추가 (선택사항)
                </Typography>
                
                <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>콘텐츠 유형</InputLabel>
                    <Select
                      value={contentFormData.contentType}
                      label="콘텐츠 유형"
                      onChange={(e) =>
                        setContentFormData({
                          ...contentFormData,
                          contentType: e.target.value,
                        })
                      }
                    >
                      <MenuItem value="DOCUMENT">자료</MenuItem>
                      <MenuItem value="LINK">강의 링크</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="콘텐츠 제목"
                    value={contentFormData.title}
                    onChange={(e) =>
                      setContentFormData({
                        ...contentFormData,
                        title: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="콘텐츠 URL"
                    value={contentFormData.contentUrl}
                    onChange={(e) =>
                      setContentFormData({
                        ...contentFormData,
                        contentUrl: e.target.value,
                      })
                    }
                    placeholder={contentFormData.contentType === 'LINK' ? '강의 링크 URL (https://...)' : '자료 URL (https://...)'}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddContentToWeekForm}
                      disabled={!contentFormData.title.trim() || !contentFormData.contentUrl.trim()}
                    >
                      콘텐츠 추가
                    </Button>
                  </Box>
                </Box>

                {/* 추가된 콘텐츠 목록 */}
                {weekFormData.contents.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      추가된 콘텐츠 ({weekFormData.contents.length}개)
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>유형</TableCell>
                            <TableCell>제목</TableCell>
                            <TableCell align="right">삭제</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {weekFormData.contents.map((content, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Chip
                                  label={getContentTypeLabel(content.contentType)}
                                  size="small"
                                  icon={getContentIcon(content.contentType)}
                                />
                              </TableCell>
                              <TableCell>{content.title}</TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveContentFromWeekForm(index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWeekDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleWeekSubmit}
            variant="contained"
            disabled={!weekFormData.weekTitle.trim()}
          >
            {editingWeek ? '수정' : '생성'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 영상 업로드 다이얼로그 */}
      <Dialog
        open={contentDialogOpen}
        onClose={() => !contentSubmitLoading && setContentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UploadIcon color="primary" />
            콘텐츠 추가
          </Box>
          {selectedWeek && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              대상 주차: {selectedWeek.weekNumber}주차 · {selectedWeek.weekTitle || '미등록'}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {contentSubmitError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setContentSubmitError(null)}>
                {contentSubmitError}
              </Alert>
            )}

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              콘텐츠 유형
            </Typography>
            <ToggleButtonGroup
              fullWidth
              exclusive
              value={contentUploadForm.contentType}
              onChange={(_e, next) => {
                if (!next) return;
                setContentUploadForm((prev) => ({
                  ...prev,
                  contentType: next,
                  contentUrl: '',
                }));
              }}
              sx={{ mb: 2 }}
              disabled={contentSubmitLoading}
            >
              <ToggleButton value="DOCUMENT">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DocumentIcon fontSize="small" />
                  자료
                </Box>
              </ToggleButton>
              <ToggleButton value="LINK">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkIcon fontSize="small" />
                  강의 링크
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>

            <TextField
              fullWidth
              label="제목"
              value={contentUploadForm.title}
              onChange={(e) => setContentUploadForm((prev) => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 2 }}
              disabled={contentSubmitLoading}
            />

            <TextField
              fullWidth
              label="설명 (선택)"
              value={contentUploadForm.description}
              onChange={(e) => setContentUploadForm((prev) => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2 }}
              multiline
              minRows={2}
              disabled={contentSubmitLoading}
            />

            <TextField
              fullWidth
              label={contentUploadForm.contentType === 'LINK' ? '강의 링크 URL' : '자료 URL'}
              value={contentUploadForm.contentUrl}
              onChange={(e) => setContentUploadForm((prev) => ({ ...prev, contentUrl: e.target.value }))}
              sx={{ mb: 2 }}
              placeholder="https://..."
              disabled={contentSubmitLoading}
              error={!!contentUploadForm.contentUrl && !isValidUrl(contentUploadForm.contentUrl.trim())}
              helperText={
                contentUploadForm.contentType === 'LINK'
                  ? '수강생이 클릭해서 열 수 있는 강의 링크를 입력하세요.'
                  : '파일 업로드가 아닌 “자료 URL”을 입력하세요.'
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      disabled={!isValidUrl(contentUploadForm.contentUrl.trim())}
                      onClick={() => window.open(contentUploadForm.contentUrl.trim(), '_blank', 'noopener,noreferrer')}
                      title="미리 열기"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContentDialogOpen(false)} disabled={contentSubmitLoading}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitCreateContent}
            disabled={!canSubmitContent() || contentSubmitLoading}
            startIcon={contentSubmitLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {contentSubmitLoading ? '추가 중...' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeekManagement;


