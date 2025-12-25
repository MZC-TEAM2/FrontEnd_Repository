import React from 'react';
import BoardListPage from '../common/BoardListPage';
import {School as SchoolIcon} from '@mui/icons-material';

/**
 * 교수 게시판 페이지
 * - 교수만 접근 가능 (RBAC by Backend)
 * - 교수 전용 공지, 자료 공유 등
 */
const ProfessorBoardPage = () => {
    return (
        <BoardListPage
            boardType="PROFESSOR"
            title="교수 게시판"
            icon={<SchoolIcon sx={{fontSize: 32, color: 'primary.main'}}/>}
            basePath="/boards/professor"
            createPath="/boards/professor/create"
            createButtonText="교수 글 작성"
            showLikeCount={false}
        />
    );
};

export default ProfessorBoardPage;
