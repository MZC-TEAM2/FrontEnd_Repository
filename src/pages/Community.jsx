/**
 * Community 페이지
 *
 * 커뮤니티 게시판 페이지입니다.
 * 공지사항, 자유게시판, Q&A 등을 표시합니다.
 */

import React from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const Community = () => {
  // 예시 게시글 데이터
  const posts = [
    {
      id: 1,
      title: '[공지] 12월 학습 일정 안내',
      author: '관리자',
      date: '2024-12-04',
      views: 245,
      comments: 5,
      category: '공지사항',
      isPinned: true,
    },
    {
      id: 2,
      title: 'React Hook 사용법 질문드립니다',
      author: '학습자1',
      date: '2024-12-03',
      views: 78,
      comments: 12,
      category: 'Q&A',
      isAnswered: true,
    },
    {
      id: 3,
      title: '프론트엔드 개발 팁 공유합니다',
      author: '학습자2',
      date: '2024-12-03',
      views: 156,
      comments: 8,
      category: '자유게시판',
    },
    {
      id: 4,
      title: 'JavaScript 비동기 처리 관련 질문',
      author: '학습자3',
      date: '2024-12-02',
      views: 92,
      comments: 6,
      category: 'Q&A',
      isAnswered: false,
    },
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case '공지사항':
        return <AnnouncementIcon />;
      case 'Q&A':
        return <QuestionAnswerIcon />;
      default:
        return <ForumIcon />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case '공지사항':
        return 'error';
      case 'Q&A':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          커뮤니티
        </Typography>
        <Button variant="contained">글쓰기</Button>
      </Box>

      <Paper>
        <List sx={{ p: 0 }}>
          {posts.map((post, index) => (
            <React.Fragment key={post.id}>
              <ListItem
                sx={{
                  py: 2,
                  px: 3,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    cursor: 'pointer',
                  },
                  backgroundColor: post.isPinned ? 'primary.light' + '10' : 'transparent',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                  <Avatar sx={{ bgcolor: getCategoryColor(post.category) + '.light' }}>
                    {getCategoryIcon(post.category)}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {post.isPinned && (
                        <Chip label="고정" size="small" color="primary" />
                      )}
                      <Chip
                        label={post.category}
                        size="small"
                        color={getCategoryColor(post.category)}
                        variant="outlined"
                      />
                      {post.isAnswered !== undefined && (
                        <Chip
                          label={post.isAnswered ? '답변완료' : '미답변'}
                          size="small"
                          color={post.isAnswered ? 'success' : 'default'}
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                      {post.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {post.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {post.date}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        조회 {post.views}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        댓글 {post.comments}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
              {index < posts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Community;