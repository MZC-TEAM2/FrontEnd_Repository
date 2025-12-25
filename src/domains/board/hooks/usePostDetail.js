import {useState} from 'react';
import {useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {updatePost} from '../../../api/postApi';

/**
 * 게시판 상세/폼 공통 훅
 *
 * @param {Object} config - 게시판 설정
 * @param {number} config.categoryId - 카테고리 ID (1: 공지, 2: 자유, 3: 질문, 4: 토론, 5: 학과)
 * @param {string} config.listPath - 목록 페이지 경로 (예: '/free', '/questions')
 * @param {Function} config.detailApi - 상세 조회 API 함수
 * @param {Function} config.createApi - 게시글 생성 API 함수
 * @param {string} config.boardName - 게시판 이름 (에러 메시지용, 예: '자유 게시판', '공지사항')
 *
 * @returns {Object} 게시판 관련 함수들과 상태
 */
export const usePostDetail = (config) => {
    const {categoryId, listPath, detailApi, createApi, boardName = '게시판'} = config;

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 게시글 상세 조회
    const fetchDetail = async (postId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await detailApi(postId);
            return data;
        } catch (err) {
            console.error(`${boardName} 조회 실패:`, err);
            setError('게시글을 불러오는데 실패했습니다.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // 목록으로 돌아가기 (검색 상태 유지)
    const handleBackToList = () => {
        const previousSearch = location.state?.search || searchParams.get('search') || '';
        const previousPage = location.state?.page || parseInt(searchParams.get('page') || '0', 10);

        const params = {};
        if (previousSearch) params.search = previousSearch;
        if (previousPage > 0) params.page = previousPage.toString();

        const queryString = new URLSearchParams(params).toString();
        navigate(`${listPath}${queryString ? `?${queryString}` : ''}`);
    };

    // 게시글 생성 (폼용)
    const createPost = async (formData, attachmentIds) => {
        const requestData = {
            categoryId,
            title: formData.title,
            content: formData.content,
            postType: formData.postType,
            isAnonymous: formData.isAnonymous,
            attachmentIds,
            hashtags: formData.hashtags || [], // 해시태그 추가
        };
        const response = await createApi(requestData);
        return response;
    };

    // 게시글 수정 (폼용)
    const updatePostData = async (postId, formData, attachmentIds, deletedFileIds) => {
        const requestData = {
            categoryId,
            title: formData.title,
            content: formData.content,
            postType: formData.postType,
            isAnonymous: formData.isAnonymous,
            attachmentIds,
            deleteAttachmentIds: deletedFileIds,
            hashtags: formData.hashtags || [], // 해시태그 추가 (빈 배열이면 모두 삭제)
        };
        await updatePost(postId, requestData);
    };

    // 폼 데이터 로드 (수정용)
    const loadForEdit = async (postId, setFormData, setExistingFiles) => {
        setLoading(true);
        setError(null);
        try {
            const data = await detailApi(postId);
            setFormData({
                title: data.title || '',
                content: data.content || '',
                postType: data.postType || 'NORMAL',
                isAnonymous: data.isAnonymous || false,
            });
            setExistingFiles(data.attachments || []);
            return data; // 전체 데이터 반환 (해시태그 포함)
        } catch (err) {
            console.error(`${boardName} 조회 실패:`, err);
            setError('게시글을 불러오는데 실패했습니다.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        setError,
        setLoading,
        fetchDetail,
        handleBackToList,
        createPost,
        updatePostData,
        loadForEdit,
    };
};
