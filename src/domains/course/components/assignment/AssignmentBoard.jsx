import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAssignment } from '../../hooks/useAssignment';
import { formatDate, formatDateTime, getDueDateStatus } from '../../../../utils/boardUtils';
import authService from '../../../../services/authService';

/**
 * 과제 목록 페이지
 * - 과제 전용 API (/api/v1/assignments) 사용
 * - assignment.id로 상세 페이지 이동
 */
const AssignmentBoard = ({ courseId, isEmbedded = false }) => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getAssignmentsByCourse } = useAssignment();
  const currentUser = authService.getCurrentUser();
  const isProfessor = currentUser?.userType === 'PROFESSOR';

  // 과제 목록 조회
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      setError(null);
      try {
        // courseId로 해당 강의의 과제만 조회 (없으면 전체 조회)
        const data = await getAssignmentsByCourse(courseId || null);
        setAssignments(data);
        setFilteredAssignments(data);
      } catch (err) {
        console.error('과제 목록 조회 실패:', err);
        setError('과제 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [courseId]);

  // 검색
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredAssignments(assignments);
      return;
    }

    const filtered = assignments.filter(assignment =>
      assignment.post?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAssignments(filtered);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 상세 페이지로 이동 (assignment.id 사용)
  const handleRowClick = (assignmentId) => {
    if (isEmbedded && courseId) {
      navigate(`/assignment/${assignmentId}?from=course&courseId=${courseId}`);
    } else {
      navigate(`/assignment/${assignmentId}`);
    }
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        {isProfessor && (
          <Button
            variant="contained"
            onClick={() => {
              if (isEmbedded && courseId) {
                navigate(`/assignment/create?courseId=${courseId}`);
              } else {
                navigate('/assignment/create');
              }
            }}
          >
            과제 등록
          </Button>
        )}
      </Box>

      {/* 검색 영역 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="과제 제목으로 검색하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} edge="end">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 과제 테이블 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell width="10%" align="center">
                  번호
                </TableCell>
                <TableCell width="50%">과제 제목</TableCell>
                <TableCell width="20%" align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <CalendarIcon fontSize="small" />
                    마감일
                  </Box>
                </TableCell>
                <TableCell width="10%" align="center">
                  만점
                </TableCell>
                <TableCell width="10%" align="center">
                  상태
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      {searchTerm ? '검색 결과가 없습니다.' : '등록된 과제가 없습니다.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssignments.map((assignment, index) => {
                  const dueDateStatus = getDueDateStatus(assignment.dueDate);
                  return (
                    <TableRow
                      key={assignment.id}
                      hover
                      onClick={() => handleRowClick(assignment.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell align="center">
                        {filteredAssignments.length - index}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {assignment.post?.title || '제목 없음'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(assignment.dueDate)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {assignment.maxScore}점
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={dueDateStatus.label}
                          color={dueDateStatus.color}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AssignmentBoard;
