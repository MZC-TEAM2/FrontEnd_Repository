import React from 'react';
import BoardListPage from '../common/BoardListPage';
import { Work as WorkIcon } from '@mui/icons-material';
import { CAREER_HASHTAGS } from '../../constants/boardHashtags';

/**
 * 취업정보 게시판 페이지
 * - BoardListPage 공통 컴포넌트 사용
 * - 모든 사용자 접근 가능
 * - 해시태그 기반 카테고리별 필터링
 */
const CareerBoardPage = () => {

  return (
    <BoardListPage
      boardType="CAREER"
      title="취업정보 게시판"
      icon={<WorkIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      basePath="/career"
      createPath="/career/create"
      createButtonText="채용 공고 등록"
      hashtags={CAREER_HASHTAGS}
      showHashtagsInTable={true}
    />
  );
};

export default CareerBoardPage;
