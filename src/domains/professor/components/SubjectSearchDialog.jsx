/**
 * 과목 검색 다이얼로그 컴포넌트
 *
 * 교수가 강의 등록 시 과목을 검색하고 선택할 수 있는 다이얼로그
 */

import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Pagination,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    School as SchoolIcon,
    Search as SearchIcon,
} from '@mui/icons-material';

import {searchSubjects} from '../../../api/professorApi';

/**
 * SubjectSearchDialog 컴포넌트
 * @param {boolean} open - 다이얼로그 열림 상태
 * @param {Function} onClose - 닫기 핸들러
 * @param {Function} onSelect - 과목 선택 핸들러
 */
const SubjectSearchDialog = ({open, onClose, onSelect}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // 다이얼로그 열릴 때 초기화
    useEffect(() => {
        if (open) {
            setSearchQuery('');
            setSubjects([]);
            setSelectedSubject(null);
            setError(null);
            setHasSearched(false);
            setPage(0);
            setTotalPages(0);
            setTotalElements(0);
        }
    }, [open]);

    // 과목 검색
    const handleSearch = async (pageNum = 0) => {
        if (searchQuery.length < 2) {
            setError('검색어는 최소 2글자 이상 입력해주세요');
            return;
        }

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const response = await searchSubjects(searchQuery, pageNum, 20);
            if (response && response.success) {
                const data = response.data;
                setSubjects(data.content || []);
                setPage(data.number || 0);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);

                if ((data.content || []).length === 0) {
                    setError('검색 결과가 없습니다');
                }
            } else {
                setError('과목 검색에 실패했습니다');
            }
        } catch (err) {
            console.error('과목 검색 실패:', err);
            setError('과목 검색에 실패했습니다');
        } finally {
            setLoading(false);
        }
    };

    // 페이지 변경
    const handlePageChange = (event, value) => {
        setPage(value - 1); // MUI Pagination은 1부터 시작, API는 0부터 시작
        handleSearch(value - 1);
    };

    // Enter 키로 검색
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 과목 선택
    const handleSelectSubject = (subject) => {
        setSelectedSubject(subject);
    };

    // 선택 확인
    const handleConfirm = () => {
        if (selectedSubject) {
            onSelect(selectedSubject);
            onClose();
        }
    };

    // 과목 타입 색상
    const getCourseTypeColor = (code) => {
        const colors = {
            MAJOR_REQ: '#1976d2',
            MAJOR_ELEC: '#42a5f5',
            GEN_REQ: '#66bb6a',
            GEN_ELEC: '#ab47bc',
        };
        return colors[code] || '#757575';
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '80vh',
                }
            }}
        >
            <DialogTitle
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    py: 3,
                    px: 3,
                    position: 'relative',
                }}
            >
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <SchoolIcon sx={{fontSize: 28, color: 'white'}}/>
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{fontWeight: 700, mb: 0.5}}>
                                과목 검색
                            </Typography>
                            <Typography variant="body2" sx={{opacity: 0.95}}>
                                과목명 또는 과목코드로 검색하세요
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: 'white',
                            '&:hover': {backgroundColor: 'rgba(255, 255, 255, 0.15)'}
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{p: 3}}>
                {/* 검색 입력 */}
                <Box sx={{mb: 3}}>
                    <TextField
                        fullWidth
                        placeholder="예: 데이터베이스, CS301"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action"/>
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSubjects([]);
                                            setError(null);
                                            setHasSearched(false);
                                        }}
                                    >
                                        <CloseIcon fontSize="small"/>
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                            }
                        }}
                    />
                    <Box sx={{display: 'flex', gap: 1, mt: 1.5}}>
                        <Button
                            variant="contained"
                            startIcon={<SearchIcon/>}
                            onClick={handleSearch}
                            disabled={loading || searchQuery.length < 2}
                            sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                }
                            }}
                        >
                            검색
                        </Button>
                        <Typography variant="caption" color="text.secondary"
                                    sx={{display: 'flex', alignItems: 'center', ml: 1}}>
                            검색어는 최소 2글자 이상 입력하세요
                        </Typography>
                    </Box>
                </Box>

                {/* 로딩 */}
                {loading && (
                    <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                        <CircularProgress/>
                    </Box>
                )}

                {/* 에러 메시지 */}
                {error && (
                    <Alert severity="error" sx={{mb: 2, borderRadius: 2}}>
                        {error}
                    </Alert>
                )}

                {/* 검색 결과 */}
                {!loading && subjects.length > 0 && (
                    <>
                        <Typography variant="subtitle2" color="text.secondary" sx={{mb: 2}}>
                            검색 결과 총 {totalElements}개 (현재 페이지: {subjects.length}개)
                        </Typography>
                        <Paper
                            elevation={0}
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                maxHeight: '400px',
                                overflow: 'auto',
                            }}
                        >
                            <List sx={{p: 0}}>
                                {subjects.map((subject, index) => (
                                    <React.Fragment key={subject.id}>
                                        {index > 0 && <Divider/>}
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                selected={selectedSubject?.id === subject.id}
                                                onClick={() => handleSelectSubject(subject)}
                                                sx={{
                                                    py: 2,
                                                    '&.Mui-selected': {
                                                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(102, 126, 234, 0.12)',
                                                        }
                                                    }
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            mb: 0.5
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                                                {subject.subjectName}
                                                            </Typography>
                                                            <Chip
                                                                label={subject.subjectCode}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                                    color: '#667eea',
                                                                }}
                                                            />
                                                            {selectedSubject?.id === subject.id && (
                                                                <CheckCircleIcon
                                                                    color="primary"
                                                                    sx={{ml: 'auto', fontSize: 24}}
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box sx={{display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap'}}>
                                                            <Chip
                                                                label={subject.courseType}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: getCourseTypeColor(subject.courseType),
                                                                    color: 'white',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.75rem',
                                                                }}
                                                            />
                                                            <Chip
                                                                label={`${subject.credits}학점`}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                            <Chip
                                                                label={subject.department}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </Box>
                                                    }
                                                    // MUI ListItemText는 기본적으로 primary=span, secondary=p로 감싸므로
                                                    // secondary에 Box/Chip(div)가 들어가면 DOM nesting 경고가 발생할 수 있음.
                                                    primaryTypographyProps={{component: 'div'}}
                                                    secondaryTypographyProps={{component: 'div'}}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                                <Pagination
                                    count={totalPages}
                                    page={page + 1}
                                    onChange={handlePageChange}
                                    color="primary"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        )}
                    </>
                )}

                {/* 검색 전 안내 */}
                {!loading && !hasSearched && (
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 6,
                            color: 'text.secondary',
                        }}
                    >
                        <SchoolIcon sx={{fontSize: 64, opacity: 0.3, mb: 2}}/>
                        <Typography variant="body1">
                            과목명 또는 과목코드를 입력하고 검색하세요
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{p: 3, borderTop: '1px solid', borderColor: 'divider'}}>
                <Button
                    onClick={onClose}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                    }}
                >
                    취소
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={!selectedSubject}
                    startIcon={<CheckCircleIcon/>}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        }
                    }}
                >
                    선택
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SubjectSearchDialog;

