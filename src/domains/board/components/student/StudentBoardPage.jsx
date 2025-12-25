import React from 'react';
import BoardListPage from '../common/BoardListPage';
import {Groups as GroupsIcon} from '@mui/icons-material';
import {STUDENT_HASHTAGS} from '../../constants/boardHashtags';

/**
 * 학생 게시판 페이지
 * - 학생만 접근 가능 (RBAC by Backend)
 * - 해시태그 기반 주제별 필터링
 */
const StudentBoardPage = () => {
    return (
        <BoardListPage
            boardType="STUDENT"
            title="학생 게시판"
            icon={<GroupsIcon sx={{fontSize: 32, color: 'primary.main'}}/>}
            basePath="/boards/student"
            createPath="/boards/student/create"
            createButtonText="학생 글 작성"
            hashtags={STUDENT_HASHTAGS}
            showHashtagsInTable={true}
        />
    );
};

export default StudentBoardPage;
