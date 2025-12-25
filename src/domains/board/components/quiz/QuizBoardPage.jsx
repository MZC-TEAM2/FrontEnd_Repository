import React from 'react';
import BoardListPage from '../common/BoardListPage';
import {Quiz as QuizIcon} from '@mui/icons-material';

/**
 * 퀴즈 게시판 페이지
 * - 모든 사용자 접근 가능
 * - 퀴즈 정보 공유
 */
const QuizBoardPage = () => {
    return (
        <BoardListPage
            boardType="QUIZ"
            title="퀴즈"
            icon={<QuizIcon sx={{fontSize: 32, color: 'primary.main'}}/>}
            basePath="/boards/quiz"
            createPath="/boards/quiz/create"
            createButtonText="퀴즈 등록"
            showViewCount={false}
            showLikeCount={false}
        />
    );
};

export default QuizBoardPage;
