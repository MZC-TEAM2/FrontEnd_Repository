import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import userService from '../services/userService';
import messageService from '../services/messageService';

const NewConversationDialog = ({ open, onClose, onConversationCreated }) => {
  // 필터 상태
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [userType, setUserType] = useState('');

  // 검색 결과 상태
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursorId, setNextCursorId] = useState(null);

  // 단과대 목록 로드
  useEffect(() => {
    if (open) {
      fetchColleges();
    }
  }, [open]);

  // 단과대 변경 시 학과 목록 로드
  useEffect(() => {
    if (selectedCollegeId) {
      fetchDepartments(selectedCollegeId);
    } else {
      setDepartments([]);
      setSelectedDepartmentId('');
    }
  }, [selectedCollegeId]);

  // 필터 변경 시 검색 실행
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        searchUsers(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedCollegeId, selectedDepartmentId, searchName, userType, open]);

  const fetchColleges = async () => {
    try {
      const data = await userService.getColleges();
      setColleges(data || []);
    } catch (error) {
      console.error('단과대 목록 조회 실패:', error);
      setColleges([]);
    }
  };

  const fetchDepartments = async (collegeId) => {
    try {
      const data = await userService.getDepartmentsByCollege(collegeId);
      setDepartments(data || []);
    } catch (error) {
      console.error('학과 목록 조회 실패:', error);
      setDepartments([]);
    }
  };

  const searchUsers = async (reset = false) => {
    setIsLoading(true);
    try {
      const params = {
        size: 20,
      };

      if (selectedCollegeId) params.collegeId = selectedCollegeId;
      if (selectedDepartmentId) params.departmentId = selectedDepartmentId;
      if (searchName.trim()) params.name = searchName.trim();
      if (userType) params.userType = userType;

      if (!reset && nextCursorId) {
        params.cursorId = nextCursorId;
      }

      const data = await userService.searchUsers(params);

      if (reset) {
        setUsers(data.content || []);
      } else {
        setUsers(prev => [...prev, ...(data.content || [])]);
      }

      setHasNext(data.hasNext || false);
      setNextCursorId(data.nextCursorId || null);
    } catch (error) {
      console.error('유저 검색 실패:', error);
      if (reset) {
        setUsers([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = async (user) => {
    setIsCreating(true);
    try {
      const conversation = await messageService.createConversation(user.userId);
      onConversationCreated(conversation);
      handleClose();
    } catch (error) {
      console.error('대화방 생성 실패:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSelectedCollegeId('');
    setSelectedDepartmentId('');
    setSearchName('');
    setUserType('');
    setUsers([]);
    setNextCursorId(null);
    onClose();
  };

  const handleLoadMore = () => {
    if (hasNext && !isLoading) {
      searchUsers(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>새 대화 시작</DialogTitle>
      <DialogContent>
        {/* 필터 영역 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2, mt: 1 }}>
          {/* 이름 검색 */}
          <TextField
            fullWidth
            size="small"
            placeholder="이름으로 검색..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* 필터 행 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* 단과대 선택 */}
            <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
              <InputLabel>단과대</InputLabel>
              <Select
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                label="단과대"
              >
                <MenuItem value="">전체</MenuItem>
                {colleges.map((college) => (
                  <MenuItem key={college.id} value={college.id}>
                    {college.collegeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 학과 선택 */}
            <FormControl size="small" sx={{ minWidth: 120, flex: 1 }} disabled={!selectedCollegeId}>
              <InputLabel>학과</InputLabel>
              <Select
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                label="학과"
              >
                <MenuItem value="">전체</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.departmentName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 사용자 유형 */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>구분</InputLabel>
              <Select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                label="구분"
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="STUDENT">학생</MenuItem>
                <MenuItem value="PROFESSOR">교수</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* 검색 결과 */}
        <Box sx={{ height: 300, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
          {isLoading && users.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress size={32} />
            </Box>
          ) : users.length > 0 ? (
            <List disablePadding>
              {users.map((user) => (
                <ListItem key={user.userId} disablePadding>
                  <ListItemButton
                    onClick={() => handleUserSelect(user)}
                    disabled={isCreating}
                  >
                    <ListItemAvatar>
                      <Avatar src={user.thumbnailUrl || undefined}>
                        {user.name?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{user.userNumber ? `${user.userNumber} / ${user.name}` : user.name}</span>
                          <Chip
                            label={user.userType === 'STUDENT' ? '학생' : '교수'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={`${user.collegeName} / ${user.departmentName}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}

              {/* 더보기 버튼 */}
              {hasNext && (
                <ListItem>
                  <Button
                    fullWidth
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={20} /> : '더 보기'}
                  </Button>
                </ListItem>
              )}
            </List>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                검색 결과가 없습니다
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isCreating}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewConversationDialog;
