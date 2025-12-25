import React from 'react';
import BoardListPage from '../common/BoardListPage';
import {RecordVoiceOver as RecordVoiceOverIcon} from '@mui/icons-material';
import {DISCUSSION_HASHTAGS} from '../../constants/boardHashtags';

/**
 * 토론 게시판 페이지
 * - BoardListPage 공통 컴포넌트 사용
 * - 모든 사용자 접근 가능
 */
const DiscussionBoardPage = () => {

    return (
        <BoardListPage
            boardType="DISCUSSION"
            title="토론 게시판"
            icon={<RecordVoiceOverIcon sx={{fontSize: 32, color: 'primary.main'}}/>}
            basePath="/discussions"
            createPath="/discussions/create"
            createButtonText="토론 시작"
            hashtags={DISCUSSION_HASHTAGS}
            showHashtagsInTable={true}
        />
    );
};

export default DiscussionBoardPage;
