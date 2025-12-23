import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  Pagination,
  Alert,
  CircularProgress,
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { formatDateTimeDot } from '../../../../utils/dateUtils';

export default function NoticeList({
  notices = [],
  loading = false,
  error = null,
  page = 0,
  totalPages = 0,
  onPageChange,
  onSelectNotice,
}) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (notices.length === 0) {
    return <Alert severity="info">등록된 공지사항이 없습니다.</Alert>;
  }

  return (
    <Box>
      <List>
        {notices.map((notice, index) => (
          <ListItem
            key={notice.id}
            disablePadding
            divider={index < notices.length - 1}
          >
            <ListItemButton onClick={() => onSelectNotice(notice.id)}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {notice.title}
                    </Typography>
                    {notice.allowComments && (
                      <ChatBubbleOutlineIcon
                        sx={{ fontSize: 16, color: 'text.secondary' }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box
                    component="span"
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}
                  >
                    <Chip
                      label={notice.authorName}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.75rem' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTimeDot(notice.createdAt)}
                    </Typography>
                    {notice.updatedAt && (
                      <Typography variant="caption" color="text.secondary">
                        (수정됨)
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(e, newPage) => onPageChange(newPage - 1)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
