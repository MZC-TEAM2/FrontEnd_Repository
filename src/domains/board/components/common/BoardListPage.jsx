import React, { useState } from 'react';
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
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useBoard } from '../../hooks/useBoard';
import { formatDate, getPostTypeLabel } from '../../../../utils/boardUtils';
import { useNavigate, useSearchParams } from 'react-router-dom';

const BoardListPage = ({
  boardType,
  title,
  icon,
  basePath,
  createPath,
  showCreateButton = true,
  createButtonText = '글 작성',
  hashtags = [],
  showHashtagsInTable = false,
  showAuthor = true,
  showViewCount = true,
  showLikeCount = true,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentHashtag = searchParams.get('hashtag') || null;
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

  // 해시태그 필터 제거
  const handleRemoveHashtagFilter = () => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    const currentPage = parseInt(searchParams.get('page') || '0', 10);
    if (currentPage > 0) params.page = currentPage.toString();
    setSearchParams(params);
  };

  // 해시태그 클릭 처리 (URL 파라미터 변경)
  const handleHashtagClick = (hashtagName) => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (hashtagName) {
      params.hashtag = hashtagName;
    }
    setSearchParams(params);
  };

  // 해시태그로 필터링된 게시글 (URL 파라미터 기반)
  const filteredPosts = posts;

  // 동적 컬럼 수 계산
  const totalColumns = 4 + (showAuthor ? 1 : 0) + (showViewCount ? 1 : 0) + (showLikeCount ? 1 : 0);

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {currentHashtag && (
            <Chip
              label={`필터: #${currentHashtag}`}
              onDelete={handleRemoveHashtagFilter}
              color="primary"
              size="small"
              deleteIcon={<CloseIcon />}
            />
          )}
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

      {/* 해시태그 필터 */}
      {hashtags.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            주제 선택
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label="전체"
              onClick={() => handleHashtagClick(null)}
              color={!currentHashtag ? 'primary' : 'default'}
              sx={{ mb: 1 }}
            />
            {hashtags.map(hashtag => (
              <Chip
                key={hashtag.id}
                label={`${hashtag.icon || ''} ${hashtag.name}`}
                onClick={() => handleHashtagClick(hashtag.name)}
                color={currentHashtag === hashtag.name ? hashtag.color || 'primary' : 'default'}
                variant={currentHashtag === hashtag.name ? 'filled' : 'outlined'}
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>
        </Paper>
      )}

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
                <TableCell width={showAuthor ? "35%" : "45%"}>제목</TableCell>
                {showAuthor && (
                  <TableCell width="10%" align="center">
                    작성자
                  </TableCell>
                )}
                <TableCell width="15%" align="center">
                  작성일
                </TableCell>
                {showViewCount && (
                  <TableCell width="10%" align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <VisibilityIcon fontSize="small" />
                      조회
                    </Box>
                  </TableCell>
                )}
                {showLikeCount && (
                  <TableCell width="10%" align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <ThumbUpIcon fontSize="small" />
                      좋아요
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={totalColumns} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={totalColumns} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      {currentHashtag ? `"#${currentHashtag}" 해시태그의 게시글이 없습니다.` : '게시글이 없습니다.'}
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
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {post.title}
                          </Typography>
                          {showHashtagsInTable && post.hashtags && post.hashtags.length > 0 && (
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
                      {showAuthor && (
                        <TableCell align="center">
                          <Typography variant="body2" color="text.secondary">
                            {post.isAnonymous ? '익명' : (post.createdByName || '알 수 없음')}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(post.createdAt)}
                        </Typography>
                      </TableCell>
                      {showViewCount && (
                        <TableCell align="center">
                          <Typography variant="body2" color="text.secondary">
                            {post.viewCount || 0}
                          </Typography>
                        </TableCell>
                      )}
                      {showLikeCount && (
                        <TableCell align="center">
                          <Typography variant="body2" color="text.secondary">
                            {post.likeCount || 0}
                          </Typography>
                        </TableCell>
                      )}
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
  hashtags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string,
      color: PropTypes.string,
    })
  ),
  showHashtagsInTable: PropTypes.bool,
  showAuthor: PropTypes.bool,
  showViewCount: PropTypes.bool,
  showLikeCount: PropTypes.bool,
};

export default BoardListPage;
