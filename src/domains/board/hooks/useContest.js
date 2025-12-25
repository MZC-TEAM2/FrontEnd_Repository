import {createPost, getPost} from '../../../api/postApi';
import {usePostDetail} from './usePostDetail';

/**
 * 공모전 게시판 상세/폼 전용 훅
 * 목록 조회는 useBoard('CONTEST')를 사용
 *
 * 제공 기능:
 * - fetchContestDetail: 상세 조회
 * - handleBackToList: 목록으로 돌아가기
 * - createContestPost: 게시글 생성
 * - updateContestPost: 게시글 수정
 * - loadContestForEdit: 수정용 데이터 로드
 */
export const useContest = () => {
    const {
        loading,
        error,
        setError,
        setLoading,
        fetchDetail,
        handleBackToList,
        createPost: createPostFn,
        updatePostData,
        loadForEdit,
    } = usePostDetail({
        categoryId: 8,
        listPath: '/contest',
        detailApi: (id) => getPost('CONTEST', id),
        createApi: (data) => createPost('CONTEST', data),
        boardName: '공모전 게시판',
    });

    return {
        loading,
        error,
        setError,
        setLoading,
        fetchContestDetail: fetchDetail,
        handleBackToList,
        createContestPost: createPostFn,
        updateContestPost: updatePostData,
        loadContestForEdit: loadForEdit,
    };
};
