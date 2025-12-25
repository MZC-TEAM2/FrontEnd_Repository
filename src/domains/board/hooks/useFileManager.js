import {useState} from 'react';
import attachmentApi from '../../../api/attachmentApi';

/**
 * 파일 관리 Hook
 * 게시글 및 댓글 작성/수정 시 파일 첨부 관리 및 다운로드
 *
 * @param {Object} options - 설정 옵션
 * @param {number} options.maxFiles - 최대 파일 개수 (기본값: 5)
 * @param {number} options.maxFileSize - 최대 파일 크기 in bytes (기본값: 10MB)
 */
export const useFileManager = (options = {}) => {
    const {maxFiles = 5, maxFileSize = 10 * 1024 * 1024} = options;

    const [files, setFiles] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]);
    const [deletedFileIds, setDeletedFileIds] = useState([]);

    // 새 파일 추가 (검증 포함)
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        if (selectedFiles.length === 0) return;

        // 최대 파일 개수 제한
        const totalFiles = files.length + existingFiles.length + selectedFiles.length;
        if (totalFiles > maxFiles) {
            alert(`최대 ${maxFiles}개까지만 첨부할 수 있습니다.`);
            return;
        }

        // 파일 크기 제한
        const maxSizeMB = Math.floor(maxFileSize / (1024 * 1024));
        const invalidFiles = selectedFiles.filter(file => file.size > maxFileSize);
        if (invalidFiles.length > 0) {
            alert(`${maxSizeMB}MB 이하의 파일만 첨부할 수 있습니다.`);
            return;
        }

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

    // 파일 업로드
    const uploadFiles = async (uploadContext = 'POST_CONTENT') => {
        if (files.length === 0) return [];
        try {
            const uploadResult = await attachmentApi.uploadMultipleFiles(files, uploadContext);
            return uploadResult.data.map(file => file.id);
        } catch (error) {
            console.error('파일 업로드 실패:', error);
            throw error;
        }
    };

    // 파일 다운로드
    const downloadFile = async (attachment) => {
        try {
            const blob = await attachmentApi.downloadFile(attachment.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = attachment.originalName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('파일 다운로드 실패:', error);
            alert('파일 다운로드에 실패했습니다.');
        }
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
        uploadFiles,
        downloadFile,
    };
};
