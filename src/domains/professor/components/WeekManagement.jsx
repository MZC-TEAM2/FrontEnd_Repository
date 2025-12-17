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
} from '@mui/icons-material';

/**
 * WeekManagement 컴포넌트
 * @param {number} courseId - 강의 ID
 * @param {Array} weeks - 주차 목록
 * @param {Function} onCreateWeek - 주차 생성 핸들러
 * @param {Function} onUpdateWeek - 주차 수정 핸들러
 * @param {Function} onDeleteWeek - 주차 삭제 핸들러
 * @param {Function} onCreateContent - 콘텐츠 생성 핸들러
 * @param {Function} onUpdateContent - 콘텐츠 수정 핸들러
 * @param {Function} onDeleteContent - 콘텐츠 삭제 핸들러
 */
const WeekManagement = ({
  courseId,
  weeks = [],
  onCreateWeek,
  onUpdateWeek,
  onDeleteWeek,
  onCreateContent,
  onUpdateContent,
  onDeleteContent,
}) => {
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
    contentType: 'VIDEO',
    title: '',
    contentUrl: '',
    duration: '',
    order: 1,
  });

  // 첫 번째 주차 자동 확장
  useEffect(() => {
    if (weeks.length > 0 && !expandedWeek) {
      setExpandedWeek(weeks[0].id);
    }
  }, [weeks]);

  const handleWeekExpand = (weekId) => (event, isExpanded) => {
    setExpandedWeek(isExpanded ? weekId : null);
  };

  const handleCreateWeekClick = () => {
    const nextWeekNumber = weeks.length > 0 
      ? Math.max(...weeks.map(w => w.weekNumber)) + 1 
      : 1;
    setWeekFormData({
      weekNumber: nextWeekNumber,
      weekTitle: '',
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
      // 수정 시에는 contents 제외
      const { contents, ...updateData } = weekFormData;
      console.log('수정 데이터 (contents 제외):', updateData);
      onUpdateWeek(editingWeek.id, updateData);
    } else {
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

    const newContent = {
      ...contentFormData,
      order: weekFormData.contents.length + 1,
    };

    // VIDEO 타입이 아닌 경우 duration 제거
    if (newContent.contentType !== 'VIDEO') {
      delete newContent.duration;
    }

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
      contentType: 'VIDEO',
      title: '',
      contentUrl: '',
      duration: '',
      order: 1,
    });
    
    console.log('=== 콘텐츠 추가 완료 ===');
  };

  const handleRemoveContentFromWeekForm = (index) => {
    const updatedContents = weekFormData.contents.filter((_, i) => i !== index);
    // 순서 재정렬
    const reorderedContents = updatedContents.map((content, i) => ({
      ...content,
      order: i + 1,
    }));
    setWeekFormData({
      ...weekFormData,
      contents: reorderedContents,
    });
  };

  const handleAddContentClick = (weekId) => {
    setSelectedWeekId(weekId);
    setContentDialogOpen(true);
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
      case 'VIDEO':
        return '영상';
      case 'DOCUMENT':
        return '자료';
      case 'LINK':
        return '링크';
      case 'QUIZ':
        return '퀴즈';
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
                        />
                        <ListItemSecondaryAction>
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
                        </ListItemSecondaryAction>
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

              {/* 콘텐츠 추가 버튼 */}
              <Box sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateWeekClick}
          >
            첫 번째 주차 생성
          </Button>
        </Paper>
      )}

      {/* 주차 추가 버튼 (하단) */}
      {weeks.length > 0 && (
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
              inputProps={{ min: 1 }}
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
              placeholder="예: 데이터베이스 개요"
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
                      <MenuItem value="VIDEO">영상</MenuItem>
                      <MenuItem value="DOCUMENT">자료</MenuItem>
                      <MenuItem value="LINK">링크</MenuItem>
                      <MenuItem value="QUIZ">퀴즈</MenuItem>
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
                    placeholder="https://..."
                    sx={{ mb: 2 }}
                  />

                  {contentFormData.contentType === 'VIDEO' && (
                    <TextField
                      fullWidth
                      label="재생 시간"
                      value={contentFormData.duration}
                      onChange={(e) =>
                        setContentFormData({
                          ...contentFormData,
                          duration: e.target.value,
                        })
                      }
                      placeholder="예: 42:30 또는 1:25:30"
                      sx={{ mb: 2 }}
                      helperText="형식: MM:SS 또는 HH:MM:SS"
                    />
                  )}

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
                            <TableCell>순서</TableCell>
                            <TableCell>유형</TableCell>
                            <TableCell>제목</TableCell>
                            <TableCell align="right">삭제</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {weekFormData.contents.map((content, index) => (
                            <TableRow key={index}>
                              <TableCell>{content.order}</TableCell>
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

      {/* 콘텐츠 추가 다이얼로그 */}
      <Dialog
        open={contentDialogOpen}
        onClose={() => setContentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>콘텐츠 추가</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              콘텐츠 추가 기능은 다음 단계에서 구현됩니다.
            </Typography>
            {/* TODO: 콘텐츠 추가 폼 구현 */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContentDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeekManagement;

