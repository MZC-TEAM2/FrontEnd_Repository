import { useState } from 'react';

/**
 * 파일 관리 Hook
 * 게시글 작성/수정 시 파일 첨부 관리
 */
export const useFileManager = () => {
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedFileIds, setDeletedFileIds] = useState([]);

  // 새 파일 추가
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  // 새 파일 제거
  const handleFileRemove = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // 기존 파일 제거 (수정 시)
  const handleExistingFileRemove = (fileId) => {
    setExistingFiles(existingFiles.filter((file) => file.id !== fileId));
    setDeletedFileIds([...deletedFileIds, fileId]);
  };

  // 초기화
  const resetFiles = () => {
    setFiles([]);
    setExistingFiles([]);
    setDeletedFileIds([]);
  };

  return {
    files,
    existingFiles,
    deletedFileIds,
    setFiles,
    setExistingFiles,
    setDeletedFileIds,
    handleFileChange,
    handleFileRemove,
    handleExistingFileRemove,
    resetFiles,
  };
};
