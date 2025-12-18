import React from 'react';
import { Paper, Typography } from '@mui/material';
import FactCheckIcon from '@mui/icons-material/FactCheck';

/**
 * 시험 관리(교수용) - placeholder
 * 추후: 시험 생성/수정/삭제, 응시 시간, 배점, 문제/문항 관리 등으로 확장
 */
export default function ExamManagement() {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <FactCheckIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        시험 관리
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        추후 구현 예정
      </Typography>
    </Paper>
  );
}


