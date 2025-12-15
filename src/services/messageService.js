import axiosInstance from '../api/axiosInstance';

/**
 * 메시지 관련 API 서비스
 */
const messageService = {
  // ==================== 대화방 API ====================

  /**
   * 대화방 목록 조회
   * @returns {Promise<Array>} 대화방 목록
   */
  getConversations: async () => {
    const response = await axiosInstance.get('/api/v1/conversations');
    return response.data;
  },

  /**
   * 대화방 상세 조회
   * @param {number} conversationId - 대화방 ID
   */
  getConversation: async (conversationId) => {
    const response = await axiosInstance.get(`/api/v1/conversations/${conversationId}`);
    return response.data;
  },

  /**
   * 대화방 생성 (상대방 userId로)
   * @param {number} otherUserId - 상대방 사용자 ID
   */
  createConversation: async (otherUserId) => {
    const response = await axiosInstance.post(`/api/v1/conversations/with/${otherUserId}`);
    return response.data;
  },

  /**
   * 대화방 삭제
   * @param {number} conversationId - 대화방 ID
   */
  deleteConversation: async (conversationId) => {
    const response = await axiosInstance.delete(`/api/v1/conversations/${conversationId}`);
    return response.data;
  },

  /**
   * 대화방 읽음 처리
   * @param {number} conversationId - 대화방 ID
   */
  markConversationAsRead: async (conversationId) => {
    const response = await axiosInstance.post(`/api/v1/conversations/${conversationId}/read`);
    return response.data;
  },

  /**
   * 전체 안읽음 메시지 수 조회
   * @returns {Promise<number>} 안읽음 수
   */
  getUnreadCount: async () => {
    const response = await axiosInstance.get('/api/v1/conversations/unread-count');
    return response.data;
  },

  // ==================== 메시지 API ====================

  /**
   * 대화방의 메시지 목록 조회 (커서 기반 페이지네이션)
   * @param {number} conversationId - 대화방 ID
   * @param {number} cursor - 마지막 메시지 ID (첫 페이지는 생략)
   * @param {number} size - 조회 개수 (기본값: 20)
   * @returns {Promise<{messages: Array, nextCursor: number|null, hasMore: boolean}>}
   */
  getMessages: async (conversationId, cursor = null, size = 20) => {
    const params = { size };
    if (cursor) {
      params.cursor = cursor;
    }
    const response = await axiosInstance.get(`/api/v1/messages/conversations/${conversationId}`, { params });
    return response.data;
  },

  /**
   * 메시지 전송
   * @param {number} conversationId - 대화방 ID
   * @param {string} content - 메시지 내용
   */
  sendMessage: async (conversationId, content) => {
    const response = await axiosInstance.post('/api/v1/messages', {
      conversationId,
      content,
    });
    return response.data;
  },

  /**
   * 다중 메시지 발송 (여러 명에게 동일 메시지)
   * @param {Array<number>} receiverIds - 수신자 ID 배열
   * @param {string} content - 메시지 내용
   */
  sendBulkMessage: async (receiverIds, content) => {
    const response = await axiosInstance.post('/api/v1/messages/bulk', {
      receiverIds,
      content,
    });
    return response.data;
  },

  /**
   * 메시지 삭제
   * @param {number} messageId - 메시지 ID
   */
  deleteMessage: async (messageId) => {
    const response = await axiosInstance.delete(`/api/v1/messages/${messageId}`);
    return response.data;
  },

  /**
   * 메시지 읽음 처리
   * @param {number} conversationId - 대화방 ID
   */
  markMessagesAsRead: async (conversationId) => {
    const response = await axiosInstance.post(`/api/v1/messages/conversations/${conversationId}/read`);
    return response.data;
  },

  // ==================== 유틸리티 ====================

  /**
   * 메시지 시간 포맷팅
   * @param {string} createdAt - 생성 시간
   */
  formatMessageTime: (createdAt) => {
    const now = new Date();
    const messageTime = new Date(createdAt);
    const diffMs = now - messageTime;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return '방금 전';
    } else if (diffMins < 60) {
      return `${diffMins}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return messageTime.toLocaleDateString('ko-KR');
    }
  },

  /**
   * 메시지 내용 미리보기 (truncate)
   * @param {string} content - 메시지 내용
   * @param {number} maxLength - 최대 길이
   */
  truncateContent: (content, maxLength = 30) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  },
};

export default messageService;
