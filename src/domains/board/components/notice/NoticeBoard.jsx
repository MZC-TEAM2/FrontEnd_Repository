import React from 'react';
import BoardListPage from '../common/BoardListPage';
import { Campaign as CampaignIcon } from '@mui/icons-material';

/**
 * 공지사항 게시판 페이지
 * - BoardListPage 공통 컴포넌트 사용
 * - 모든 사용자 접근 가능
 */
const NoticeBoard = () => {
  return (
    <BoardListPage
      boardType="NOTICE"
      title="공지사항"
      icon={<CampaignIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      basePath="/notices"
      createPath="/notices/create"
      createButtonText="공지 작성"
    />
  );
};

export default NoticeBoard;
