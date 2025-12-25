import {createPost, getPost} from '../../../api/postApi';
import {usePostDetail} from './usePostDetail';

/**
 * 학생 게시판 상세/폼 전용 훅
 * 목록 조회는 useBoard('STUDENT')를 사용
 *
 * 제공 기능:
 * - fetchStudentDetail: 상세 조회
 * - handleBackToList: 목록으로 돌아가기
 * - createStudentPost: 게시글 생성
 * - updateStudentPost: 게시글 수정
 * - loadStudentForEdit: 수정용 데이터 로드
 */
export const useStudent = () => {
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
        categoryId: 7,
        listPath: '/boards/student',
        detailApi: (id) => getPost('STUDENT', id),
        createApi: (data) => createPost('STUDENT', data),
        boardName: '학생 게시판',
    });

    return {
        loading,
        error,
        setError,
        setLoading,
        fetchStudentDetail: fetchDetail,
        handleBackToList,
        createStudentPost: createPostFn,
        updateStudentPost: updatePostData,
        loadStudentForEdit: loadForEdit,
    };
};
