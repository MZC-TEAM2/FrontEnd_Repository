import {createPost, getPost} from '../../../api/postApi';
import {usePostDetail} from './usePostDetail';

/**
 * 학과 게시판 상세/폼 전용 훅
 * 목록 조회는 useBoard('DEPARTMENT')를 사용
 *
 * 제공 기능:
 * - fetchDepartmentDetail: 상세 조회
 * - handleBackToList: 목록으로 돌아가기
 * - createDepartmentPost: 게시글 생성
 * - updateDepartmentPost: 게시글 수정
 * - loadDepartmentForEdit: 수정용 데이터 로드
 */
export const useDepartment = () => {
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
        categoryId: 5,
        listPath: '/departments',
        detailApi: (id) => getPost('DEPARTMENT', id),
        createApi: (data) => createPost('DEPARTMENT', data),
        boardName: '학과 게시판',
    });

    return {
        loading,
        error,
        setError,
        setLoading,
        fetchDepartmentDetail: fetchDetail,
        handleBackToList,
        createDepartmentPost: createPostFn,
        updateDepartmentPost: updatePostData,
        loadDepartmentForEdit: loadForEdit,
    };
};
