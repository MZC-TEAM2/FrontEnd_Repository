import {createPost, getPost} from '../../../api/postApi';
import {usePostDetail} from './usePostDetail';

/**
 * 취업 게시판 상세/폼 전용 훅
 * 목록 조회는 useBoard('CAREER')를 사용
 *
 * 제공 기능:
 * - fetchCareerDetail: 상세 조회
 * - handleBackToList: 목록으로 돌아가기
 * - createCareerPost: 게시글 생성
 * - updateCareerPost: 게시글 수정
 * - loadCareerForEdit: 수정용 데이터 로드
 */
export const useCareer = () => {
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
        categoryId: 9,
        listPath: '/career',
        detailApi: (id) => getPost('CAREER', id),
        createApi: (data) => createPost('CAREER', data),
        boardName: '취업 게시판',
    });

    return {
        loading,
        error,
        setError,
        setLoading,
        fetchCareerDetail: fetchDetail,
        handleBackToList,
        createCareerPost: createPostFn,
        updateCareerPost: updatePostData,
        loadCareerForEdit: loadForEdit,
    };
};
