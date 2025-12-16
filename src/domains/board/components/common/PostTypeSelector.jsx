import React from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

// 게시판별 허용 게시글 유형 매핑
const BOARD_TYPE_POST_TYPES = {
  NOTICE: [
    { value: 'NOTICE', label: '공지' },
    { value: 'URGENT', label: '긴급' },
  ],
  FREE: [
    { value: 'NORMAL', label: '일반' },
    { value: 'URGENT', label: '긴급' },
  ],
  QUESTION: [
    { value: 'NORMAL', label: '일반' },
  ],
  DISCUSSION: [
    { value: 'NORMAL', label: '일반' },
  ],
  DEPARTMENT: [
    { value: 'NORMAL', label: '일반' },
    { value: 'NOTICE', label: '공지' },
    { value: 'URGENT', label: '긴급' },
  ],
  PROFESSOR: [
    { value: 'NORMAL', label: '일반' },
    { value: 'NOTICE', label: '공지' },
  ],
  STUDENT: [
    { value: 'NORMAL', label: '일반' },
  ],
  CONTEST: [
    { value: 'NORMAL', label: '일반' },
  ],
  CAREER: [
    { value: 'NORMAL', label: '일반' },
  ],
};

/**
 * 게시글 타입 선택 컴포넌트
 * 게시판별로 허용된 게시글 타입만 선택할 수 있도록 동적으로 옵션 표시
 * 
 * @param {string} boardType - 게시판 타입 (NOTICE, FREE, QUESTION 등)
 * @param {string} value - 현재 선택된 게시글 타입
 * @param {Function} onChange - 타입 변경 시 호출되는 콜백 함수
 */
const PostTypeSelector = ({ boardType, value, onChange }) => {
  // 게시판 타입에 따른 허용 게시글 유형 가져오기
  const allowedPostTypes = BOARD_TYPE_POST_TYPES[boardType] || [
    { value: 'NORMAL', label: '일반' },
  ];

  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel>게시글 유형</InputLabel>
      <Select
        name="postType"
        value={value}
        onChange={onChange}
        label="게시글 유형"
      >
        {allowedPostTypes.map((type) => (
          <MenuItem key={type.value} value={type.value}>
            {type.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

PostTypeSelector.propTypes = {
  boardType: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PostTypeSelector;
