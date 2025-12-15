import React, { useState } from 'react';
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
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { useBoard } from '../../hooks/useBoard';
import { formatDate, getPostTypeLabel } from '../../../../utils/boardUtils';
import { useNavigate } from 'react-router-dom';

/**
 * 취업정보 게시판 페이지
 * - 모든 사용자 접근 가능
 * - 해시태그 기반 카테고리별 필터링
 */
const CareerBoardPage = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);

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
  } = useBoard('CAREER');

  // 취업 게시판 카테고리 목록
  const careerTopics = [
    { id: '채용공고', name: '채용공고', icon: '📢', color: 'primary' },
    { id: '면접후기', name: '면접후기', icon: '💼', color: 'secondary' },
    { id: '인턴', name: '인턴', icon: '🎓', color: 'info' },
    { id: '자소서첨삭', name: '자소서첨삭', icon: '✍️', color: 'warning' },
    { id: '포트폴리오', name: '포트폴리오', icon: '📁', color: 'success' },
    { id: '이력서', name: '이력서', icon: '📄', color: 'error' },
  ];

  // 주제별 필터링된 게시글
  const filteredPosts = selectedTopic
    ? posts.filter(post => 
        post.hashtags?.some(tag => tag.tagName === selectedTopic)
      )
    : posts;

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WorkIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            취업정보
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/boards/career/create')}
        >
          채용 공고 등록
        </Button>
      </Box>

      {/* 카테고리 필터 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          카테고리 선택
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label="전체"
            onClick={() => setSelectedTopic(null)}
            color={selectedTopic === null ? 'primary' : 'default'}
            sx={{ mb: 1 }}
          />
          {careerTopics.map(topic => (
            <Chip
              key={topic.id}
              label={`${topic.icon} ${topic.name}`}
              onClick={() => setSelectedTopic(topic.id)}
              color={selectedTopic === topic.id ? topic.color : 'default'}
              variant={selectedTopic === topic.id ? 'filled' : 'outlined'}
              sx={{ mb: 1 }}
            />
          ))}
        </Stack>
      </Paper>

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
              ) : filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      {selectedTopic ? `"${selectedTopic}" 카테고리의 게시글이 없습니다.` : '게시글이 없습니다.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post, index) => {
                  const postType = getPostTypeLabel(post.postType);
                  return (
                    <TableRow
                      key={post.id}
                      hover
                      onClick={() => handleRowClick(post.id, '/boards/career')}
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
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {post.title}
                          </Typography>
                          {post.hashtags && post.hashtags.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                              {post.hashtags.map((tag, idx) => (
                                <Chip
                                  key={idx}
                                  label={`#${tag.tagName}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
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
        {!loading && filteredPosts.length > 0 && (
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

export default CareerBoardPage;
