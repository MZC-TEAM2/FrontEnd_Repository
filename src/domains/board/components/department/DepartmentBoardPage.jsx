import React from 'react';
import BoardListPage from '../common/BoardListPage';
import { School as SchoolIcon } from '@mui/icons-material';

/**
 * 학과 게시판 페이지
 * - 모든 사용자 접근 가능
 * - 학과별 공지 및 소통
 * - 학과 ID 기반 자동 필터링 (해시태그 미사용)
 */
const DepartmentBoardPage = () => {

  return (
    <BoardListPage
      boardType="DEPARTMENT"
      title="학과 게시판"
      icon={<SchoolIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      basePath="/departments"
      createPath="/departments/create"
      createButtonText="글 작성"
      showLikeCount={false}
    />
  );
};

export default DepartmentBoardPage;
