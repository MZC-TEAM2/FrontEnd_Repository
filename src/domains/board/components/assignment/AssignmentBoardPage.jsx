import React from 'react';
import BoardListPage from '../common/BoardListPage';
import { Assignment as AssignmentIcon } from '@mui/icons-material';

/**
 * 과제 게시판 페이지
 * - 모든 사용자 접근 가능
 * - 과제 제출 및 정보 공유
 */
const AssignmentBoardPage = () => {
  return (
    <BoardListPage
      boardType="ASSIGNMENT"
      title="과제"
      icon={<AssignmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      basePath="/boards/assignment"
      createPath="/boards/assignment/create"
      createButtonText="과제 등록"
    />
  );
};

export default AssignmentBoardPage;
