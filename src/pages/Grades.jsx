/**
 * Grades 페이지
 *
 * MZC 대학교 LMS 시스템의 성적 조회 페이지입니다.
 * 학생의 전체 학기별 성적과 통계를 확인할 수 있습니다.
 *
 * 주요 기능:
 * - 학기별 성적 조회
 * - 전체 평균 학점 (GPA) 표시
 * - 이수 학점 현황
 * - 성적 추이 그래프
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';

// 아이콘 임포트
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

/**
 * 탭 패널 컴포넌트
 */
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Grades 컴포넌트
 */
const Grades = () => {
  const [selectedSemester, setSelectedSemester] = useState('2024-2');
  const [tabValue, setTabValue] = useState(0);

  // 학기별 성적 데이터
  const gradesData = {
    '2024-2': {
      courses: [
        { code: 'CS301', name: '데이터베이스', credits: 3, grade: 'A+', score: 95 },
        { code: 'CS302', name: '알고리즘', credits: 3, grade: 'A', score: 92 },
        { code: 'CS401', name: '운영체제', credits: 3, grade: 'B+', score: 88 },
        { code: 'CS402', name: '소프트웨어공학', credits: 3, grade: 'A', score: 93 },
        { code: 'CS403', name: '캡스톤디자인', credits: 3, grade: 'A+', score: 96 },
        { code: 'GE201', name: '기술과 창업', credits: 3, grade: 'A', score: 91 },
      ],
      gpa: 4.25,
      totalCredits: 18,
    },
    '2024-1': {
      courses: [
        { code: 'CS201', name: '자료구조', credits: 3, grade: 'A', score: 93 },
        { code: 'CS202', name: '컴퓨터구조', credits: 3, grade: 'B+', score: 87 },
        { code: 'CS203', name: '프로그래밍언어론', credits: 3, grade: 'A', score: 92 },
        { code: 'CS204', name: '웹프로그래밍', credits: 3, grade: 'A+', score: 96 },
        { code: 'GE101', name: '영어회화', credits: 2, grade: 'B', score: 85 },
        { code: 'GE102', name: '글쓰기', credits: 2, grade: 'B+', score: 88 },
      ],
      gpa: 4.06,
      totalCredits: 16,
    },
    '2023-2': {
      courses: [
        { code: 'CS101', name: '프로그래밍기초', credits: 3, grade: 'A+', score: 97 },
        { code: 'CS102', name: '이산수학', credits: 3, grade: 'A', score: 91 },
        { code: 'CS103', name: '디지털논리회로', credits: 3, grade: 'B+', score: 86 },
        { code: 'GE001', name: '미적분학', credits: 3, grade: 'A', score: 90 },
        { code: 'GE002', name: '일반물리학', credits: 3, grade: 'B', score: 83 },
      ],
      gpa: 3.94,
      totalCredits: 15,
    },
  };

  // 전체 통계 계산
  const calculateOverallStats = () => {
    let totalGradePoints = 0;
    let totalCredits = 0;
    let majorCredits = 0;
    let generalCredits = 0;

    Object.values(gradesData).forEach(semester => {
      totalGradePoints += semester.gpa * semester.totalCredits;
      totalCredits += semester.totalCredits;

      semester.courses.forEach(course => {
        if (course.code.startsWith('CS')) {
          majorCredits += course.credits;
        } else {
          generalCredits += course.credits;
        }
      });
    });

    return {
      overallGPA: (totalGradePoints / totalCredits).toFixed(2),
      totalCredits,
      majorCredits,
      generalCredits,
    };
  };

  const stats = calculateOverallStats();

  // 학점을 점수로 변환
  const gradeToPoint = (grade) => {
    const gradeMap = {
      'A+': 4.5, 'A': 4.0, 'B+': 3.5, 'B': 3.0,
      'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0,
    };
    return gradeMap[grade] || 0;
  };

  // 학점 색상
  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'success';
    if (grade.startsWith('B')) return 'primary';
    if (grade.startsWith('C')) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="xl">
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            성적 조회
          </Typography>
          <Typography variant="body1" color="text.secondary">
            컴퓨터공학과 | 3학년 | 20220001 홍길동
          </Typography>
        </Box>
        <Box>
          <Tooltip title="성적표 인쇄">
            <IconButton>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="성적표 다운로드">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 전체 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    전체 평균 학점
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {stats.overallGPA}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / 4.5
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 48, color: 'primary.light' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    총 이수 학점
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    {stats.totalCredits}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / 130 학점
                  </Typography>
                </Box>
                <SchoolIcon sx={{ fontSize: 48, color: 'success.light' }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.totalCredits / 130) * 100}
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
                color="success"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    전공 이수
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    {stats.majorCredits}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / 84 학점
                  </Typography>
                </Box>
                <StarIcon sx={{ fontSize: 48, color: 'warning.light' }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.majorCredits / 84) * 100}
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
                color="warning"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    교양 이수
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    {stats.generalCredits}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / 46 학점
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: 'info.light' }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.generalCredits / 46) * 100}
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
                color="info"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 학기별 성적 */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            학기별 성적
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>학기 선택</InputLabel>
            <Select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              label="학기 선택"
            >
              <MenuItem value="2024-2">2024년 2학기</MenuItem>
              <MenuItem value="2024-1">2024년 1학기</MenuItem>
              <MenuItem value="2023-2">2023년 2학기</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ mb: 2 }}>
          <Tab label="성적 목록" />
          <Tab label="성적 분포" />
        </Tabs>

        {/* 성적 목록 탭 */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>과목코드</TableCell>
                  <TableCell>과목명</TableCell>
                  <TableCell align="center">이수구분</TableCell>
                  <TableCell align="center">학점</TableCell>
                  <TableCell align="center">등급</TableCell>
                  <TableCell align="center">점수</TableCell>
                  <TableCell align="center">평점</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gradesData[selectedSemester].courses.map((course) => (
                  <TableRow key={course.code}>
                    <TableCell>{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={course.code.startsWith('CS') ? '전공' : '교양'}
                        size="small"
                        color={course.code.startsWith('CS') ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">{course.credits}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={course.grade}
                        size="small"
                        color={getGradeColor(course.grade)}
                      />
                    </TableCell>
                    <TableCell align="center">{course.score}</TableCell>
                    <TableCell align="center">{gradeToPoint(course.grade)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  학기 평균 학점
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {gradesData[selectedSemester].gpa} / 4.5
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  이수 학점
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {gradesData[selectedSemester].totalCredits} 학점
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  석차
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  12 / 145 명
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* 성적 분포 탭 */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    등급 분포
                  </Typography>
                  {['A+', 'A', 'B+', 'B', 'C+'].map((grade) => {
                    const count = gradesData[selectedSemester].courses.filter(c => c.grade === grade).length;
                    const percentage = (count / gradesData[selectedSemester].courses.length) * 100;

                    return (
                      <Box key={grade} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">{grade}</Typography>
                          <Typography variant="body2">{count}과목</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{ height: 8, borderRadius: 4 }}
                          color={getGradeColor(grade)}
                        />
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    학기별 평균 학점 추이
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    {Object.entries(gradesData).reverse().map(([semester, data]) => (
                      <Box key={semester} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">
                            {semester.replace('-', '년 ')}학기
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {data.gpa}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(data.gpa / 4.5) * 100}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Grades;