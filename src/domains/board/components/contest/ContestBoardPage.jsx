import React from 'react';
import BoardListPage from '../common/BoardListPage';
import {EmojiEvents as ContestIcon} from '@mui/icons-material';
import {CONTEST_HASHTAGS} from '../../constants/boardHashtags';

/**
 * 공모전 게시판 페이지
 * - BoardListPage 공통 컴포넌트 사용
 * - 모든 사용자 접근 가능
 * - 해시태그 기반 분야별 필터링
 */
const ContestBoardPage = () => {

    return (
        <BoardListPage
            boardType="CONTEST"
            title="공모전 게시판"
            icon={<ContestIcon sx={{fontSize: 32, color: 'primary.main'}}/>}
            basePath="/contest"
            createPath="/contest/create"
            createButtonText="공모전 정보 작성"
            hashtags={CONTEST_HASHTAGS}
            showHashtagsInTable={true}
        />
    );
};

export default ContestBoardPage;
