import React from 'react';
import PropTypes from 'prop-types';
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
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { useBoard } from '../../hooks/useBoard';
import { formatDate, getPostTypeLabel } from '../../../../utils/boardUtils';
import { useNavigate } from 'react-router-dom';

/**
 * 범용 게시판 목록 컴포넌트
 * 모든 게시판 타입에서 재사용 가능
 * 
 * @param {string} boardType - 게시판 타입 (NOTICE, PROFESSOR, STUDENT, FREE, etc.)
 * @param {string} title - 게시판 제목
 * @param {React.ReactNode} icon - 헤더 아이콘
 * @param {string} basePath - 기본 경로 (예: /boards/professor)
 * @param {string} createPath - 작성 페이지 경로 (예: /boards/professor/create)
 * @param {boolean} showCreateButton - 작성 버튼 표시 여부 (기본: true)
 * @param {string} createButtonText - 작성 버튼 텍스트 (기본: "글 작성")
 */
const BoardListPage = ({
  boardType,
  title,
  icon,
  basePath,
  createPath,
  showCreateButton = true,
  createButtonText = '글 작성',
}) => {
  const {
    posts,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    searchTerm,
    setSearchTerm,
    handlePageChange,
    handleSearch,
    handleSearchKeyPress,
    handleRowClick,
  } = useBoard(boardType);

  const navigate = useNavigate();

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        {showCreateButton && (
          <Button
            variant="contained"
            onClick={() => navigate(createPath)}
          >
            {createButtonText}
          </Button>
        )}
      </Box>

      {/* 검색 영역 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="제목으로 검색하세요"
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

      {/* 게시글 테이블 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell width="10%" align="center">
                  번호
                </TableCell>
                <TableCell width="10%" align="center">
                  구분
                </TableCell>
                <TableCell width="45%">제목</TableCell>
                <TableCell width="15%" align="center">
                  작성일
                </TableCell>
                <TableCell width="10%" align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <VisibilityIcon fontSize="small" />
                    조회
                  </Box>
                </TableCell>
                <TableCell width="10%" align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <ThumbUpIcon fontSize="small" />
                    좋아요
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">게시글이 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post, index) => {
                  const postType = getPostTypeLabel(post.postType);
                  return (
                    <TableRow
                      key={post.id}
                      hover
                      onClick={() => handleRowClick(post.id, basePath)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell align="center">
                        {totalElements - (page * 20 + index)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={postType.label}
                          color={postType.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {post.title}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(post.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {post.viewCount || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {post.likeCount || 0}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 */}
        {!loading && posts.length > 0 && (
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={20}
            rowsPerPageOptions={[20]}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} / 총 ${count}개`
            }
          />
        )}
      </Paper>
    </Box>
  );
};

BoardListPage.propTypes = {
  boardType: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  basePath: PropTypes.string.isRequired,
  createPath: PropTypes.string.isRequired,
  showCreateButton: PropTypes.bool,
  createButtonText: PropTypes.string,
};

export default BoardListPage;
