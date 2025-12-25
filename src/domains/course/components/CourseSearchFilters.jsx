import React from 'react';
import {Box, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField,} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/**
 * 검색 및 필터 컴포넌트
 */
const CourseSearchFilters = ({
                                 searchTerm,
                                 onSearchChange,
                                 onSearchKeyPress,
                                 selectedDepartment,
                                 onDepartmentChange,
                                 selectedCourseType,
                                 onCourseTypeChange,
                                 selectedCredits,
                                 onCreditsChange,
                             }) => {
    return (
        <Box sx={{mb: 4, flexShrink: 0}}>
            {/* 검색창 */}
            <Box sx={{mb: 3}}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="과목명, 과목코드, 교수명으로 검색"
                    value={searchTerm}
                    onChange={onSearchChange}
                    onKeyPress={onSearchKeyPress}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action"/>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f5f5f5',
                            '&:hover': {
                                backgroundColor: '#eeeeee',
                            },
                            '&.Mui-focused': {
                                backgroundColor: '#ffffff',
                            },
                        },
                    }}
                />
            </Box>

            {/* 필터 그룹 */}
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: {xs: 'wrap', md: 'nowrap'},
                    alignItems: 'flex-start',
                }}
            >
                <FormControl
                    sx={{
                        minWidth: {xs: '100%', sm: 150},
                        flex: {xs: '1 1 100%', md: '1 1 auto'},
                    }}
                >
                    <InputLabel sx={{fontWeight: 500}}>학과</InputLabel>
                    <Select
                        value={selectedDepartment}
                        onChange={onDepartmentChange}
                        label="학과"
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
                                },
                            },
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'left',
                            },
                            transformOrigin: {
                                vertical: 'top',
                                horizontal: 'left',
                            },
                        }}
                        sx={{
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e0e0e0',
                            },
                        }}
                    >
                        <MenuItem value="all">전체</MenuItem>
                        {/* TODO: API에서 학과 목록 받아와서 동적으로 생성 */}
                        <MenuItem value="1">컴퓨터공학과</MenuItem>
                    </Select>
                </FormControl>

                <FormControl
                    sx={{
                        minWidth: {xs: '100%', sm: 150},
                        flex: {xs: '1 1 100%', md: '1 1 auto'},
                    }}
                >
                    <InputLabel sx={{fontWeight: 500}}>이수구분</InputLabel>
                    <Select
                        value={selectedCourseType}
                        onChange={onCourseTypeChange}
                        label="이수구분"
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
                                },
                            },
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'left',
                            },
                            transformOrigin: {
                                vertical: 'top',
                                horizontal: 'left',
                            },
                        }}
                        sx={{
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e0e0e0',
                            },
                        }}
                    >
                        <MenuItem value="all">전체</MenuItem>
                        <MenuItem value="전공필수">전공필수</MenuItem>
                        <MenuItem value="전공선택">전공선택</MenuItem>
                        <MenuItem value="교양필수">교양필수</MenuItem>
                        <MenuItem value="교양선택">교양선택</MenuItem>
                    </Select>
                </FormControl>

                <FormControl
                    sx={{
                        minWidth: {xs: '100%', sm: 120},
                        flex: {xs: '1 1 100%', md: '0 0 auto'},
                    }}
                >
                    <InputLabel sx={{fontWeight: 500}}>학점</InputLabel>
                    <Select
                        value={selectedCredits}
                        onChange={onCreditsChange}
                        label="학점"
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
                                },
                            },
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'left',
                            },
                            transformOrigin: {
                                vertical: 'top',
                                horizontal: 'left',
                            },
                        }}
                        sx={{
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e0e0e0',
                            },
                        }}
                    >
                        <MenuItem value="all">전체</MenuItem>
                        <MenuItem value="1">1학점</MenuItem>
                        <MenuItem value="2">2학점</MenuItem>
                        <MenuItem value="3">3학점</MenuItem>
                        <MenuItem value="4">4학점</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
};

export default CourseSearchFilters;
