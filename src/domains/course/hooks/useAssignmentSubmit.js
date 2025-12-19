import { useState, useEffect } from 'react';
import { useAssignment } from './useAssignment';
import attachmentApi from '../../../api/attachmentApi';

/**
 * 과제 제출 로직을 관리하는 커스텀 훅
 * 
 * @param {number} assignmentId - 과제 ID
 * @param {object} existingSubmission - 기존 제출 데이터 (수정 시)
 * @param {string} submissionMethod - 제출 방법 (FILE_UPLOAD/TEXT_INPUT/BOTH)
 * @param {function} onSuccess - 제출 성공 시 콜백
 */
export const useAssignmentSubmit = ({ 
  assignmentId, 
  existingSubmission, 
  submissionMethod, 
  onSuccess 
}) => {
  const [submissionText, setSubmissionText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [error, setError] = useState(null);

  const { submitAssignment, loading } = useAssignment();

  // 기존 제출 데이터로 초기화
  useEffect(() => {
    if (existingSubmission) {
      setSubmissionText(existingSubmission.content || '');
      
      if (existingSubmission.attachments && existingSubmission.attachments.length > 0) {
        const formattedFiles = existingSubmission.attachments.map(att => ({
          id: att.id,
          name: att.originalName,
          size: att.fileSize,
        }));
        setAttachedFiles(formattedFiles);
      }
    }
  }, [existingSubmission]);

  // 파일 선택 처리
  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploadingFiles(true);
    setError(null);

    try {
      const response = await attachmentApi.uploadFile(selectedFile, 'DOCUMENT');

      if (response.status === 'SUCCESS') {
        setAttachedFiles([{
          id: response.data.id,
          name: response.data.originalName,
          size: response.data.fileSize,
        }]);
      }
    } catch (err) {
      console.error('파일 업로드 에러:', err);
      setError(err.response?.data?.message || '파일 업로드에 실패했습니다.');
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  // 첨부파일 삭제
  const handleFileRemove = (fileId) => {
    setAttachedFiles(attachedFiles.filter(f => f.id !== fileId));
  };

  // 과제 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 제출 방법에 따른 유효성 검사
    if (submissionMethod === 'TEXT_INPUT' || submissionMethod === 'BOTH') {
      if (!submissionText.trim()) {
        setError('제출 내용을 입력하세요.');
        return;
      }
    }

    if (submissionMethod === 'FILE_UPLOAD' || submissionMethod === 'BOTH') {
      if (attachedFiles.length === 0) {
        setError('파일을 업로드해주세요.');
        return;
      }
    }

    try {
      await submitAssignment(assignmentId, {
        content: submissionText,
        attachmentIds: attachedFiles.map(f => f.id),
      });
      alert('과제가 제출되었습니다.');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || '과제 제출에 실패했습니다.');
    }
  };

  return {
    // State
    submissionText,
    setSubmissionText,
    attachedFiles,
    uploadingFiles,
    error,
    setError,
    loading,
    
    // Handlers
    handleFileSelect,
    handleFileRemove,
    handleSubmit,
  };
};
