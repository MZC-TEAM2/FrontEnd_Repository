import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 게시글 작성/수정 폼 제출 로직 공통 훅
 * 
 * @param {Object} config - 설정 객체
 * @param {string} config.id - 게시글 ID (수정 모드일 때)
 * @param {boolean} config.isEditMode - 수정 모드 여부
 * @param {string} config.basePath - 기본 경로 (예: '/free', '/questions')
 * @param {number} config.categoryId - 카테고리 ID
 * @param {string} config.boardName - 게시판 이름 (에러 메시지용)
 * @param {Function} config.createPostFn - 게시글 생성 함수
 * @param {Function} config.updatePostFn - 게시글 수정 함수
 * @param {Function} config.loadForEditFn - 수정용 데이터 로드 함수
 * @param {Function} config.setFormData - 폼 데이터 설정 함수
 * @param {Function} config.setExistingFiles - 기존 파일 설정 함수
 * @param {Function} config.validateForm - 폼 검증 함수
 * @param {Function} config.setError - 에러 설정 함수
 * @param {Function} config.uploadFiles - 파일 업로드 함수
 * @param {Array} config.deletedFileIds - 삭제된 파일 ID 목록
 * @param {Object} config.formData - 폼 데이터
 */
export const usePostFormSubmit = (config) => {
  const {
    id,
    isEditMode,
    basePath,
    categoryId,
    boardName = '게시판',
    createPostFn,
    updatePostFn,
    loadForEditFn,
    setFormData,
    setExistingFiles,
    validateForm,
    setError,
    uploadFiles,
    deletedFileIds,
    formData,
  } = config;

  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [hashtags, setHashtags] = useState([]);

  // 수정 모드일 때 기존 게시글 데이터 로드
  useEffect(() => {
    if (isEditMode && loadForEditFn) {
      loadForEditFn(id, setFormData, setExistingFiles).then(post => {
        if (post?.hashtags) {
          setHashtags(post.hashtags.map(tag => tag.tagName || tag.name));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  // 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const attachmentIds = await uploadFiles();
      
      const postData = {
        ...formData,
        hashtags: hashtags || []
      };
      
      if (isEditMode) {
        await updatePostFn(id, postData, attachmentIds, deletedFileIds);
        navigate(`${basePath}/${id}`, { replace: true });
      } else {
        const response = await createPostFn(postData, attachmentIds);
        navigate(`${basePath}/${response.id}`);
      }
    } catch (err) {
      console.error(`${boardName} ${isEditMode ? '수정' : '생성'} 실패:`, err);
      setError(err.response?.data?.message || `게시글 ${isEditMode ? '수정' : '작성'}에 실패했습니다.`);
    } finally {
      setSubmitting(false);
    }
  };

  // 취소 처리
  const handleCancel = () => {
    if (isEditMode) {
      navigate(`${basePath}/${id}`);
    } else {
      navigate(basePath);
    }
  };

  return {
    submitting,
    hashtags,
    setHashtags,
    handleSubmit,
    handleCancel,
  };
};
