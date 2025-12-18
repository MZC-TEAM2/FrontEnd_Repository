import React from 'react';
import BoardListPage from '../common/BoardListPage';
import { Description as DescriptionIcon } from '@mui/icons-material';

/**
 * 시험 게시판 페이지
 * - 모든 사용자 접근 가능
 * - 시험 정보 공유
 */
const ExamBoardPage = () => {
  return (
    <BoardListPage
      boardType="EXAM"
      title="시험"
      icon={<DescriptionIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      basePath="/boards/exam"
      createPath="/boards/exam/create"
      createButtonText="시험 정보 등록"
      showViewCount={false}
      showLikeCount={false}
    />
  );
};

export default ExamBoardPage;
