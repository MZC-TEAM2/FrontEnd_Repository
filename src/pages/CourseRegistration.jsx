/**
 * CourseRegistration 페이지
 *
 * MZC 대학교 수강신청 페이지입니다.
 * 학생들이 매 학기 수강신청을 진행할 수 있습니다.
 *
 * 주요 기능:
 * - 개설 과목 목록 조회
 * - 과목 검색 및 필터링
 * - 장바구니 기능
 * - 시간표 미리보기
 * - 수강신청 확정
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
} from '@mui/material';

// 아이콘
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ScheduleIcon from '@mui/icons-material/Schedule';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterListIcon from '@mui/icons-material/FilterList';

/**
 * 탭 패널 컴포넌트
 */
function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * 시간표 컴포넌트
 */
const TimeTable = ({ courses, isPreview = false }) => {
  const days = ['월', '화', '수', '목', '금'];
  const hours = Array.from({ length: 10 }, (_, i) => i + 9); // 9시부터 18시까지

  // 시간표 색상 배열
  const colors = [
    '#6FA3EB',
    '#A5C9EA',
    '#FFB6C1',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
    '#F8B739',
  ];

  const getScheduleStyle = (course, index) => ({
    backgroundColor: colors[index % colors.length] + '40',
    border: `2px solid ${colors[index % colors.length]}`,
    borderRadius: '4px',
    padding: '4px',
    fontSize: '0.75rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  });

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {isPreview ? '시간표 미리보기' : '현재 시간표'}
      </Typography>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 400 }}>
          <TableHead>
            <TableRow>
              <TableCell width="60">시간</TableCell>
              {days.map((day) => (
                <TableCell key={day} align="center">
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {hours.map((hour) => (
              <TableRow key={hour}>
                <TableCell>
                  <Typography variant="caption">{hour}:00</Typography>
                </TableCell>
                {days.map((day, dayIndex) => (
                  <TableCell key={`${day}-${hour}`} align="center" sx={{ height: 40, p: 0.5 }}>
                    {courses.map((course, courseIndex) =>
                      course.schedule?.map((sched) =>
                        sched.dayOfWeek === dayIndex + 1 &&
                        parseInt(sched.startTime) === hour ? (
                          <Box
                            key={`${course.id}-${sched.dayOfWeek}-${sched.startTime}`}
                            sx={getScheduleStyle(course, courseIndex)}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {course.subjectCode}
                            </Typography>
                          </Box>
                        ) : null
                      )
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

/**
 * CourseRegistration 메인 컴포넌트
 */
const CourseRegistration = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCourseType, setSelectedCourseType] = useState('all');
  const [selectedCredits, setSelectedCredits] = useState('all');
  const [cart, setCart] = useState([]);
  const [registered, setRegistered] = useState([]);

  // 더미 데이터 - 개설 과목
  const availableCourses = [
    {
      id: 1,
      subjectCode: 'CS301',
      subjectName: '데이터베이스',
      professor: '김교수',
      department: '컴퓨터공학과',
      courseType: '전공필수',
      credits: 3,
      currentStudents: 35,
      maxStudents: 40,
      schedule: [
        { dayOfWeek: 1, startTime: '9', endTime: '10:30' },
        { dayOfWeek: 3, startTime: '9', endTime: '10:30' },
      ],
      classroom: '공학관 401호',
    },
    {
      id: 2,
      subjectCode: 'CS302',
      subjectName: '알고리즘',
      professor: '이교수',
      department: '컴퓨터공학과',
      courseType: '전공필수',
      credits: 3,
      currentStudents: 38,
      maxStudents: 40,
      schedule: [
        { dayOfWeek: 2, startTime: '10', endTime: '11:30' },
        { dayOfWeek: 4, startTime: '10', endTime: '11:30' },
      ],
      classroom: '공학관 302호',
    },
    {
      id: 3,
      subjectCode: 'CS401',
      subjectName: '운영체제',
      professor: '박교수',
      department: '컴퓨터공학과',
      courseType: '전공선택',
      credits: 3,
      currentStudents: 25,
      maxStudents: 35,
      schedule: [
        { dayOfWeek: 1, startTime: '13', endTime: '14:30' },
        { dayOfWeek: 3, startTime: '13', endTime: '14:30' },
      ],
      classroom: '공학관 501호',
    },
    {
      id: 4,
      subjectCode: 'CS402',
      subjectName: '소프트웨어공학',
      professor: '최교수',
      department: '컴퓨터공학과',
      courseType: '전공선택',
      credits: 3,
      currentStudents: 30,
      maxStudents: 35,
      schedule: [
        { dayOfWeek: 2, startTime: '14', endTime: '15:30' },
        { dayOfWeek: 4, startTime: '14', endTime: '15:30' },
      ],
      classroom: '공학관 502호',
    },
    {
      id: 5,
      subjectCode: 'CS501',
      subjectName: '인공지능',
      professor: '정교수',
      department: '컴퓨터공학과',
      courseType: '전공선택',
      credits: 3,
      currentStudents: 40,
      maxStudents: 40,
      schedule: [
        { dayOfWeek: 5, startTime: '10', endTime: '13' },
      ],
      classroom: '공학관 601호',
    },
    {
      id: 6,
      subjectCode: 'GE201',
      subjectName: '기술과 창업',
      professor: '강교수',
      department: '교양학부',
      courseType: '교양선택',
      credits: 3,
      currentStudents: 50,
      maxStudents: 60,
      schedule: [
        { dayOfWeek: 1, startTime: '16', endTime: '18' },
      ],
      classroom: '인문관 201호',
    },
    {
      id: 7,
      subjectCode: 'CS403',
      subjectName: '컴퓨터네트워크',
      professor: '윤교수',
      department: '컴퓨터공학과',
      courseType: '전공선택',
      credits: 3,
      currentStudents: 28,
      maxStudents: 35,
      schedule: [
        { dayOfWeek: 3, startTime: '14', endTime: '15:30' },
        { dayOfWeek: 5, startTime: '14', endTime: '15:30' },
      ],
      classroom: '공학관 403호',
    },
    {
      id: 8,
      subjectCode: 'CS404',
      subjectName: '캡스톤디자인',
      professor: '신교수',
      department: '컴퓨터공학과',
      courseType: '전공필수',
      credits: 3,
      currentStudents: 20,
      maxStudents: 30,
      schedule: [
        { dayOfWeek: 4, startTime: '16', endTime: '18' },
      ],
      classroom: '공학관 Lab1',
    },
  ];

  // 필터링된 과목
  const filteredCourses = availableCourses.filter((course) => {
    const matchSearch = course.subjectName.includes(searchTerm) ||
                        course.subjectCode.includes(searchTerm) ||
                        course.professor.includes(searchTerm);
    const matchDept = selectedDepartment === 'all' || course.department === selectedDepartment;
    const matchType = selectedCourseType === 'all' || course.courseType === selectedCourseType;
    const matchCredits = selectedCredits === 'all' || course.credits === parseInt(selectedCredits);

    return matchSearch && matchDept && matchType && matchCredits;
  });

  // 장바구니에 추가
  const addToCart = (course) => {
    if (!cart.find((c) => c.id === course.id)) {
      setCart([...cart, course]);
    }
  };

  // 장바구니에서 제거
  const removeFromCart = (courseId) => {
    setCart(cart.filter((c) => c.id !== courseId));
  };

  // 수강신청 확정
  const confirmRegistration = () => {
    setRegistered([...registered, ...cart]);
    setCart([]);
    alert('수강신청이 완료되었습니다!');
  };

  // 총 학점 계산
  const totalCredits = cart.reduce((sum, course) => sum + course.credits, 0);
  const registeredCredits = registered.reduce((sum, course) => sum + course.credits, 0);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        수강신청
      </Typography>

      <Grid container spacing={3}>
        {/* 왼쪽: 과목 목록 및 검색 */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ mb: 3 }}>
              <Tab label="개설 과목" />
              <Tab label="장바구니" icon={<Chip label={cart.length} size="small" color="error" />} />
              <Tab label="신청 완료" icon={<Chip label={registered.length} size="small" color="success" />} />
            </Tabs>

            {/* 개설 과목 탭 */}
            <TabPanel value={tabValue} index={0}>
              {/* 검색 및 필터 */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="과목명, 과목코드, 교수명으로 검색"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>학과</InputLabel>
                      <Select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        label="학과"
                      >
                        <MenuItem value="all">전체</MenuItem>
                        <MenuItem value="컴퓨터공학과">컴퓨터공학과</MenuItem>
                        <MenuItem value="교양학부">교양학부</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>이수구분</InputLabel>
                      <Select
                        value={selectedCourseType}
                        onChange={(e) => setSelectedCourseType(e.target.value)}
                        label="이수구분"
                      >
                        <MenuItem value="all">전체</MenuItem>
                        <MenuItem value="전공필수">전공필수</MenuItem>
                        <MenuItem value="전공선택">전공선택</MenuItem>
                        <MenuItem value="교양선택">교양선택</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>학점</InputLabel>
                      <Select
                        value={selectedCredits}
                        onChange={(e) => setSelectedCredits(e.target.value)}
                        label="학점"
                      >
                        <MenuItem value="all">전체</MenuItem>
                        <MenuItem value="1">1학점</MenuItem>
                        <MenuItem value="2">2학점</MenuItem>
                        <MenuItem value="3">3학점</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {/* 과목 목록 테이블 */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>과목코드</TableCell>
                      <TableCell>과목명</TableCell>
                      <TableCell>교수</TableCell>
                      <TableCell>학점</TableCell>
                      <TableCell>이수구분</TableCell>
                      <TableCell>시간/강의실</TableCell>
                      <TableCell align="center">정원</TableCell>
                      <TableCell align="center">신청</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCourses.map((course) => {
                      const isFull = course.currentStudents >= course.maxStudents;
                      const isInCart = cart.find((c) => c.id === course.id);
                      const isRegistered = registered.find((c) => c.id === course.id);

                      return (
                        <TableRow key={course.id}>
                          <TableCell>{course.subjectCode}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {course.subjectName}
                            </Typography>
                          </TableCell>
                          <TableCell>{course.professor}</TableCell>
                          <TableCell>{course.credits}</TableCell>
                          <TableCell>
                            <Chip
                              label={course.courseType}
                              size="small"
                              color={
                                course.courseType.includes('필수') ? 'error' : 'primary'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {course.schedule.map((s) => {
                                const dayMap = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금' };
                                return `${dayMap[s.dayOfWeek]} ${s.startTime}-${s.endTime}`;
                              }).join(', ')}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {course.classroom}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${course.currentStudents}/${course.maxStudents}`}
                              size="small"
                              color={isFull ? 'error' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {isRegistered ? (
                              <Chip label="신청완료" size="small" color="success" />
                            ) : isInCart ? (
                              <IconButton
                                color="error"
                                onClick={() => removeFromCart(course.id)}
                              >
                                <RemoveCircleOutlineIcon />
                              </IconButton>
                            ) : (
                              <IconButton
                                color="primary"
                                onClick={() => addToCart(course)}
                                disabled={isFull}
                              >
                                <AddCircleOutlineIcon />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* 장바구니 탭 */}
            <TabPanel value={tabValue} index={1}>
              {cart.length === 0 ? (
                <Alert severity="info">장바구니가 비어있습니다.</Alert>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>과목코드</TableCell>
                          <TableCell>과목명</TableCell>
                          <TableCell>교수</TableCell>
                          <TableCell>학점</TableCell>
                          <TableCell>시간</TableCell>
                          <TableCell align="center">제거</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cart.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell>{course.subjectCode}</TableCell>
                            <TableCell>{course.subjectName}</TableCell>
                            <TableCell>{course.professor}</TableCell>
                            <TableCell>{course.credits}</TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {course.schedule.map((s) => {
                                  const dayMap = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금' };
                                  return `${dayMap[s.dayOfWeek]} ${s.startTime}-${s.endTime}`;
                                }).join(', ')}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                onClick={() => removeFromCart(course.id)}
                              >
                                <RemoveCircleOutlineIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                      총 {totalCredits}학점
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={confirmRegistration}
                      disabled={totalCredits === 0 || totalCredits + registeredCredits > 21}
                    >
                      수강신청 확정
                    </Button>
                  </Box>

                  {totalCredits + registeredCredits > 21 && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      최대 수강 가능 학점(21학점)을 초과했습니다.
                    </Alert>
                  )}
                </>
              )}
            </TabPanel>

            {/* 신청 완료 탭 */}
            <TabPanel value={tabValue} index={2}>
              {registered.length === 0 ? (
                <Alert severity="info">아직 신청 완료된 과목이 없습니다.</Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>과목코드</TableCell>
                        <TableCell>과목명</TableCell>
                        <TableCell>교수</TableCell>
                        <TableCell>학점</TableCell>
                        <TableCell>시간/강의실</TableCell>
                        <TableCell align="center">상태</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {registered.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>{course.subjectCode}</TableCell>
                          <TableCell>{course.subjectName}</TableCell>
                          <TableCell>{course.professor}</TableCell>
                          <TableCell>{course.credits}</TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {course.schedule.map((s) => {
                                const dayMap = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금' };
                                return `${dayMap[s.dayOfWeek]} ${s.startTime}-${s.endTime}`;
                              }).join(', ')}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {course.classroom}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="신청완료"
                              color="success"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          </Paper>
        </Grid>

        {/* 오른쪽: 시간표 및 요약 */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
            {/* 시간표 미리보기 */}
            <Box sx={{ flex: 1.5 }}>
              <TimeTable courses={[...registered, ...cart]} isPreview={true} />
            </Box>

            {/* 학점 요약 */}
            <Box sx={{ flex: 1 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    수강신청 현황
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      신청 완료
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {registeredCredits}학점
                    </Typography>
                    <Typography variant="body2">
                      {registered.length}과목
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      장바구니
                    </Typography>
                    <Typography variant="h5" color="warning.main">
                      {totalCredits}학점
                    </Typography>
                    <Typography variant="body2">
                      {cart.length}과목
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      총 신청 학점
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {registeredCredits + totalCredits}/21
                    </Typography>
                  </Box>

                  {registeredCredits + totalCredits > 18 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      18학점 초과
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseRegistration;