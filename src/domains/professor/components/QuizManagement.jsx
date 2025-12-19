import React from 'react';
import { Paper, Typography } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';

/**
 * 퀴즈 관리(교수용) - placeholder
 * 추후: 퀴즈 생성/수정/삭제, 응시 시간, 문제/문항 관리 등으로 확장
 */
export default function QuizManagement() {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        퀴즈 관리
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        추후 구현 예정
      </Typography>
    </Paper>
  );
}


