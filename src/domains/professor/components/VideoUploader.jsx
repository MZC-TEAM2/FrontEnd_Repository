/**
 * VideoUploader 컴포넌트
 * TUS 프로토콜 기반 영상 업로드 컴포넌트
 */

import React, { useState, useRef } from 'react';
import * as tus from 'tus-js-client';
import {
  Box,
  Button,
  TextField,
  Typography,
  LinearProgress,
  Paper,
  IconButton,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Cancel as CancelIcon,
  CheckCircle as SuccessIcon,
  VideoFile as VideoFileIcon,
} from '@mui/icons-material';

const VIDEO_SERVER_URL = import.meta.env.VITE_VIDEO_SERVER_URL || 'http://localhost:8090';
const TUS_ENDPOINT = `${VIDEO_SERVER_URL}/api/v1/videos/upload`;
const MIN_VIDEO_SECONDS = 10;

const formatDuration = (seconds) => {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total < 0) return '';

  const whole = Math.floor(total);
  const s = whole % 60;
  const m = Math.floor(whole / 60) % 60;
  const h = Math.floor(whole / 3600);

  const pad2 = (n) => String(n).padStart(2, '0');
  if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}`;
  return `${m}:${pad2(s)}`;
};

const readVideoDuration = (videoFile) => {
  return new Promise((resolve, reject) => {
    try {
      const url = URL.createObjectURL(videoFile);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = url;

      const cleanup = () => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      };

      video.onloadedmetadata = () => {
        const d = video.duration;
        cleanup();
        resolve(d);
      };
      video.onerror = (e) => {
        cleanup();
        reject(e);
      };
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * VideoUploader 컴포넌트
 * @param {number} courseId - 강좌 ID
 * @param {number} weekId - 주차 ID
 * @param {Function} onUploadComplete - 업로드 완료 콜백
 * @param {Function} onCancel - 취소 콜백
 */
const VideoUploader = ({ courseId, weekId, onUploadComplete, onCancel }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const uploadRef = useRef(null);
  const fileInputRef = useRef(null);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const setFileAndAutofill = async (selectedFile) => {
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        setError('영상 파일만 업로드할 수 있습니다.');
        return;
      }
      setError(null);
      setSuccess(false);

      // 파일명에서 제목 자동 설정 (확장자 제외)
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
      if (!title) {
        setTitle(fileName);
      }

      // 영상 duration 자동 추출 (10초 미만은 업로드 불가)
      try {
        const d = await readVideoDuration(selectedFile);
        setDurationSeconds(Number.isFinite(d) ? d : null);

        if (Number.isFinite(d) && d > 0) {
          const formatted = formatDuration(d);
          if (formatted) setDuration(formatted);
        }

        if (Number.isFinite(d) && d < MIN_VIDEO_SECONDS) {
          setFile(null);
          setDuration('');
          setDurationSeconds(null);
          resetFileInput();
          setError(`10초 미만 영상은 업로드할 수 없습니다. (현재: ${formatDuration(d) || `${Math.floor(d)}초`})`);
          return;
        }
      } catch (e) {
        // duration 추출 실패는 업로드 자체를 막지 않음
        setDurationSeconds(null);
        console.warn('영상 duration 메타데이터 읽기 실패:', e);
      }

      setFile(selectedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    void setFileAndAutofill(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    void setFileAndAutofill(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = () => {
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }

    if (!weekId) {
      setError('주차 정보가 없습니다.');
      return;
    }

    if (typeof durationSeconds === 'number' && durationSeconds < MIN_VIDEO_SECONDS) {
      setError('10초 미만 영상은 업로드할 수 없습니다.');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    const upload = new tus.Upload(file, {
      endpoint: TUS_ENDPOINT,
      retryDelays: null, // 자동 재시도 비활성화 (POST 중복 방지)
      chunkSize: 5 * 1024 * 1024, // 5MB 청크
      metadata: {
        weekId: String(weekId),
        title: title.trim() || file.name.replace(/\.[^/.]+$/, ''),
        duration: duration.trim() || '',
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      removeFingerprintOnSuccess: true, // 성공 시 fingerprint 제거
      onError: (err) => {
        console.error('Upload error:', err);
        setError(`업로드 실패: ${err.message || '알 수 없는 오류'}. 다시 시도해주세요.`);
        setUploading(false);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
        setProgress(percentage);
      },
      onSuccess: () => {
        console.log('Upload complete');
        setSuccess(true);
        setUploading(false);

        if (onUploadComplete) {
          onUploadComplete();
        }
      },
    });

    uploadRef.current = upload;
    upload.start();
  };

  const handleCancelUpload = () => {
    if (uploadRef.current) {
      uploadRef.current.abort();
      setUploading(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTitle('');
    setDuration('');
    setDurationSeconds(null);
    setProgress(0);
    setError(null);
    setSuccess(false);
    resetFileInput();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (success) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <SuccessIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
        <Typography variant="h6" color="success.main" gutterBottom>
          업로드 완료
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          영상이 성공적으로 업로드되었습니다.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={handleReset}>
            다른 영상 업로드
          </Button>
          <Button variant="contained" onClick={onCancel}>
            닫기
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 파일 선택 영역 */}
      {!file ? (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: 'background.default',
            border: '2px dashed',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={handleFileSelect}
          />
          <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            클릭하거나 파일을 드래그하여 업로드
          </Typography>
          <Typography variant="caption" color="text.secondary">
            지원 형식: MP4, WebM, MOV 등
          </Typography>
        </Paper>
      ) : (
        <Box>
          {/* 선택된 파일 정보 */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VideoFileIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" fontWeight={500}>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(file.size)} | {file.type}
                </Typography>
              </Box>
              {!uploading && (
                <IconButton size="small" onClick={handleReset}>
                  <CancelIcon />
                </IconButton>
              )}
            </Box>
          </Paper>

          {/* 메타데이터 입력 */}
          {!uploading && (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="영상 제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="영상 제목을 입력하세요"
              />
              <TextField
                fullWidth
                label="재생 시간"
                value={duration}
                disabled
                placeholder="예: 10:30 또는 1:25:30"
              />
            </Box>
          )}

          {/* 업로드 진행률 */}
          {uploading && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  업로드 중...
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          )}

          {/* 버튼 영역 */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            {uploading ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleCancelUpload}
              >
                취소
              </Button>
            ) : (
              <>
                <Button variant="outlined" onClick={onCancel}>
                  닫기
                </Button>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={handleUpload}
                >
                  업로드
                </Button>
              </>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VideoUploader;
