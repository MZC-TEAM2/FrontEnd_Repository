import axiosInstance from './axiosInstance';

const attachmentApi = {
  // 파일 업로드
  uploadFile: async (file, attachmentType = 'COMMENT') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('attachmentType', attachmentType);

    const response = await axiosInstance.post('/api/v1/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 다중 파일 업로드
  uploadMultipleFiles: async (files, attachmentType = 'COMMENT') => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('attachmentType', attachmentType);

    const response = await axiosInstance.post('/api/v1/attachments/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 파일 다운로드
  downloadFile: async (attachmentId) => {
    const response = await axiosInstance.get(`/api/v1/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // 첨부파일 삭제
  deleteFile: async (attachmentId) => {
    const response = await axiosInstance.delete(`/api/v1/attachments/${attachmentId}`);
    return response.data;
  },

  // 첨부파일 정보 조회
  getFileInfo: async (attachmentId) => {
    const response = await axiosInstance.get(`/api/v1/attachments/${attachmentId}`);
    return response.data;
  },
};

export default attachmentApi;
