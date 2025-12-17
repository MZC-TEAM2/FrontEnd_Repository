import React from 'react';
import BoardListPage from '../common/BoardListPage';
import { School as SchoolIcon } from '@mui/icons-material';
import { DEPARTMENT_HASHTAGS } from '../../constants/boardHashtags';

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
      icon={<SchoolIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      basePath="/departments"
      createPath="/departments/create"
      createButtonText="글 작성"
      hashtags={DEPARTMENT_HASHTAGS}
      showHashtagsInTable={true}
    />
  );
};

export default DepartmentBoardPage;
