import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Divider,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import messageService from '../services/messageService';
import NewConversationDialog from '../components/NewConversationDialog';

const CONVERSATION_LIST_WIDTH = 320;

const Messages = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  // 상태 관리
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [newConversationDialogOpen, setNewConversationDialogOpen] = useState(false);

  // URL 파라미터에서 대화방 ID 가져오기
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setSelectedConversationId(Number(idParam));
    }
  }, [searchParams]);

  // 대화방 목록 로드
  useEffect(() => {
    fetchConversations();
  }, []);

  // 선택된 대화방의 메시지 로드
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId]);

  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const data = await messageService.getConversations();
      setConversations(data || []);

      // URL에 id가 없고 대화방이 있으면 첫 번째 대화방 선택
      const idParam = searchParams.get('id');
      if (!idParam && data && data.length > 0) {
        setSelectedConversationId(data[0].conversationId);
      }
    } catch (error) {
      console.error('대화방 목록 조회 실패:', error);
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    setIsLoadingMessages(true);
    try {
      const data = await messageService.getMessages(conversationId);
      setMessages(data || []);
    } catch (error) {
      console.error('메시지 조회 실패:', error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await messageService.markConversationAsRead(conversationId);
      // 대화방 목록에서 해당 대화방의 unreadCount 업데이트
      setConversations(prev =>
        prev.map(conv =>
          conv.conversationId === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  };

  const handleConversationSelect = (conversationId) => {
    setSelectedConversationId(conversationId);
    setSearchParams({ id: conversationId.toString() });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    setIsSending(true);
    try {
      const sentMessage = await messageService.sendMessage(selectedConversationId, newMessage.trim());
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');

      // 대화방 목록의 마지막 메시지 업데이트
      setConversations(prev =>
        prev.map(conv =>
          conv.conversationId === selectedConversationId
            ? {
                ...conv,
                lastMessageContent: sentMessage.content,
                lastMessageAt: sentMessage.createdAt,
                isLastMessageMine: true,
              }
            : conv
        )
      );
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm('대화방을 삭제하시겠습니까?')) return;

    try {
      await messageService.deleteConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.conversationId !== conversationId));

      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
        setMessages([]);
        setSearchParams({});
      }
    } catch (error) {
      console.error('대화방 삭제 실패:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversationCreated = (conversation) => {
    // 새 대화방을 목록 맨 앞에 추가
    setConversations(prev => [
      {
        conversationId: conversation.conversationId,
        otherUserId: conversation.otherUserId,
        otherUserName: conversation.otherUserName,
        otherUserThumbnailUrl: conversation.otherUserThumbnailUrl,
        lastMessageContent: '',
        lastMessageAt: conversation.createdAt,
        isLastMessageMine: false,
        unreadCount: 0,
      },
      ...prev.filter(c => c.conversationId !== conversation.conversationId),
    ]);

    // 새 대화방 선택
    setSelectedConversationId(conversation.conversationId);
    setSearchParams({ id: conversation.conversationId.toString() });
    setMessages([]);
  };

  const selectedConversation = conversations.find(
    conv => conv.conversationId === selectedConversationId
  );

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 180px)', gap: 2 }}>
      {/* 대화방 목록 패널 */}
      <Paper
        sx={{
          width: CONVERSATION_LIST_WIDTH,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 헤더 */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              메시지
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setNewConversationDialogOpen(true)}
            >
              새 대화
            </Button>
          </Box>
        </Box>

        {/* 대화방 리스트 */}
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {isLoadingConversations ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : conversations.length > 0 ? (
            conversations.map((conversation) => (
              <ListItem
                key={conversation.conversationId}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conversation.conversationId);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={selectedConversationId === conversation.conversationId}
                  onClick={() => handleConversationSelect(conversation.conversationId)}
                  sx={{ py: 1.5 }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={conversation.unreadCount}
                      color="error"
                      overlap="circular"
                    >
                      <Avatar src={conversation.otherUserThumbnailUrl || undefined}>
                        {conversation.otherUserName?.charAt(0) || 'U'}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conversation.otherUserName}
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {messageService.truncateContent(conversation.lastMessageContent, 20)}
                      </Typography>
                    }
                    primaryTypographyProps={{
                      fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                대화방이 없습니다
              </Typography>
            </Box>
          )}
        </List>
      </Paper>

      {/* 대화 내용 패널 */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedConversationId ? (
          <>
            {/* 대화 헤더 */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar src={selectedConversation?.otherUserThumbnailUrl || undefined}>
                  {selectedConversation?.otherUserName?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {selectedConversation?.otherUserName || '알 수 없음'}
                </Typography>
              </Box>
            </Box>

            {/* 메시지 목록 */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {isLoadingMessages ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <Box
                    key={message.messageId}
                    sx={{
                      display: 'flex',
                      justifyContent: message.isMine ? 'flex-end' : 'flex-start',
                      mb: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: message.isMine
                          ? theme.palette.primary.main
                          : theme.palette.grey[100],
                        color: message.isMine
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.primary,
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.7,
                          textAlign: message.isMine ? 'right' : 'left',
                        }}
                      >
                        {messageService.formatMessageTime(message.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    메시지가 없습니다. 첫 메시지를 보내보세요!
                  </Typography>
                </Box>
              )}
            </Box>

            {/* 메시지 입력 */}
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="메시지를 입력하세요..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSending}
                  multiline
                  maxRows={3}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                >
                  {isSending ? <CircularProgress size={24} /> : <SendIcon />}
                </IconButton>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              대화를 선택하거나 새 대화를 시작하세요
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 새 대화 다이얼로그 */}
      <NewConversationDialog
        open={newConversationDialogOpen}
        onClose={() => setNewConversationDialogOpen(false)}
        onConversationCreated={handleNewConversationCreated}
      />
    </Box>
  );
};

export default Messages;
