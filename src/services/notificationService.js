import axiosInstance from '../api/axiosInstance';

/**
 * 알림 관련 API 서비스
 */
const notificationService = {
    /**
     * 알림 목록 조회 (커서 기반 페이징)
     * @param {number} cursor - 커서 값
     * @param {number} size - 페이지 크기
     * @param {boolean} unreadOnly - 읽지 않은 알림만 조회
     */
    getNotifications: async (cursor = null, size = 20, unreadOnly = false) => {
        const params = {
            size,
            unreadOnly,
        };

        if (cursor) {
            params.cursor = cursor;
        }

        const response = await axiosInstance.get('/api/notifications', {params});
        return response.data;
    },

    /**
     * 읽지 않은 알림 개수 조회
     */
    getUnreadCount: async () => {
        const response = await axiosInstance.get('/api/notifications/unread-count');
        return response.data;
    },

    /**
     * 알림 상세 조회
     * @param {number} notificationId - 알림 ID
     */
    getNotification: async (notificationId) => {
        const response = await axiosInstance.get(`/api/notifications/${notificationId}`);
        return response.data;
    },

    /**
     * 알림 읽음 처리
     * @param {number} notificationId - 알림 ID
     */
    markAsRead: async (notificationId) => {
        const response = await axiosInstance.patch(`/api/notifications/${notificationId}/read`);
        return response.data;
    },

    /**
     * 모든 알림 읽음 처리
     */
    markAllAsRead: async () => {
        const response = await axiosInstance.patch('/api/notifications/read-all');
        return response.data;
    },

    /**
     * 알림 삭제
     * @param {number} notificationId - 알림 ID
     */
    deleteNotification: async (notificationId) => {
        const response = await axiosInstance.delete(`/api/notifications/${notificationId}`);
        return response.data;
    },

    /**
     * 읽은 알림 일괄 삭제
     */
    deleteReadNotifications: async () => {
        const response = await axiosInstance.delete('/api/notifications/read');
        return response.data;
    },

    /**
     * 모든 알림 삭제
     */
    deleteAllNotifications: async () => {
        const response = await axiosInstance.delete('/api/notifications/all');
        return response.data;
    },

    /**
     * 알림 타입별 한글 표시
     * @param {string} type - 알림 타입
     */
    getNotificationTypeLabel: (type) => {
        const typeLabels = {
            ASSIGNMENT: '과제',
            EXAM: '시험',
            ANNOUNCEMENT: '공지',
            GRADE: '성적',
            LECTURE: '강의',
            ATTENDANCE: '출석',
            SYSTEM: '시스템',
            COMMENT_CREATED: '댓글',
            REPLY_CREATED: '답글',
            DAILY_COURSE_REMINDER: '오늘의 수업',
        };
        return typeLabels[type] || '알림';
    },

    /**
     * 알림 시간 포맷팅
     * @param {string} createdAt - 생성 시간
     */
    formatNotificationTime: (createdAt) => {
        const now = new Date();
        const notificationTime = new Date(createdAt);
        const diffMs = now - notificationTime;
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
            return notificationTime.toLocaleDateString('ko-KR');
        }
    },
};

export default notificationService;
