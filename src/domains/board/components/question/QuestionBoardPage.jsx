import React from 'react';
import BoardListPage from '../common/BoardListPage';
import {HelpOutline as HelpOutlineIcon} from '@mui/icons-material';
import {QUESTION_HASHTAGS} from '../../constants/boardHashtags';

/**
 * 질문 게시판 페이지
 * - BoardListPage 공통 컴포넌트 사용
 * - 모든 사용자 접근 가능
 */
const QuestionBoardPage = () => {

    return (
        <BoardListPage
            boardType="QUESTION"
            title="질문 게시판"
            icon={<HelpOutlineIcon sx={{fontSize: 32, color: 'primary.main'}}/>}
            basePath="/questions"
            createPath="/questions/create"
            createButtonText="질문 작성"
            hashtags={QUESTION_HASHTAGS}
            showHashtagsInTable={true}
        />
    );
};

export default QuestionBoardPage;
