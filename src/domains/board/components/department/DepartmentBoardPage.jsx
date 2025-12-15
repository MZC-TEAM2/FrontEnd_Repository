import React from 'react';
import BoardListPage from '../common/BoardListPage';
import { AccountBalance as AccountBalanceIcon } from '@mui/icons-material';

/**
 * 학과 게시판 페이지
 * - 모든 사용자 접근 가능
 * - 학과별 공지 및 소통
 */
const DepartmentBoardPage = () => {
  return (
    <BoardListPage
      boardType="DEPARTMENT"
      title="학과 게시판"
      icon={<AccountBalanceIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      basePath="/boards/department"
      createPath="/boards/department/create"
      createButtonText="글 작성"
    />
  );
};

export default DepartmentBoardPage;
