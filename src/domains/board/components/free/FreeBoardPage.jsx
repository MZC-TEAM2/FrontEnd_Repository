import React from 'react';
import BoardListPage from '../common/BoardListPage';
import { Forum as ForumIcon } from '@mui/icons-material';
import { FREE_HASHTAGS } from '../../constants/boardHashtags';

/**
 * 자유 게시판 페이지
 * - BoardListPage 공통 컴포넌트 사용
 * - 모든 사용자 접근 가능
 */
const FreeBoardPage = () => {

  return (
    <BoardListPage
      boardType="FREE"
      title="자유 게시판"
      icon={<ForumIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      basePath="/free"
      createPath="/free/create"
      createButtonText="게시글 작성"
      hashtags={FREE_HASHTAGS}
      showHashtagsInTable={true}
    />
  );
};

export default FreeBoardPage;
