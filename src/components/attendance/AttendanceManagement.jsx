/**
 * AttendanceManagement - 교수용 출석 관리 컴포넌트
 *
 * ProfessorCourseDetail 페이지에서 사용되는 출석 관리 탭입니다.
 * 강의의 전체 출석 현황과 학생별 출석 목록을 표시합니다.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import attendanceService from '../../services/attendanceService';

const AttendanceManagement = ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseAttendance, setCourseAttendance] = useState(null);
  const [studentsAttendance, setStudentsAttendance] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('all');
  const [weekStudents, setWeekStudents] = useState([]);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // 전체 출석 현황 및 학생 목록 조회
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;

      setLoading(true);
      setError(null);

      try {
        const [courseRes, studentsRes] = await Promise.all([
          attendanceService.getProfessorCourseAttendance(courseId),
          attendanceService.getStudentsAttendance(courseId),
        ]);

        if (courseRes.success) {
          setCourseAttendance(courseRes.data);
        }

        if (studentsRes.success) {
          setStudentsAttendance(studentsRes.data || []);
        }
      } catch (err) {
        console.error('출석 현황 조회 실패:', err);
        setError('출석 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  // 주차별 학생 출석 조회
  useEffect(() => {
    const fetchWeekStudents = async () => {
      if (selectedWeek === 'all' || !courseId) {
        setWeekStudents([]);
        return;
      }

      setLoadingWeek(true);
      try {
        const response = await attendanceService.getWeekStudentsAttendance(courseId, selectedWeek);
        if (response.success) {
          setWeekStudents(response.data || []);
        }
      } catch (err) {
        console.error('주차별 출석 조회 실패:', err);
      } finally {
        setLoadingWeek(false);
      }
    };

    fetchWeekStudents();
  }, [courseId, selectedWeek]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!courseAttendance) {
    return (
      <Alert severity="info">
        출석 정보가 없습니다.
      </Alert>
    );
  }

  const {
    courseName,
    totalStudents,
    totalWeeks,
    averageAttendanceRate,
    weekSummaries = []
  } = courseAttendance;

  const avgColor = attendanceService.getAttendanceColor(averageAttendanceRate);

  return (
    <Box>
      {/* 요약 카드 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    총 수강생
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {totalStudents}명
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EventAvailableIcon sx={{ fontSize: 40, color: 'info.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    총 주차
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {totalWeeks}주차
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: `${avgColor}.main` }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    평균 출석률
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: `${avgColor}.main` }}>
                    {attendanceService.formatAttendanceRate(averageAttendanceRate)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 탭 전환 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <Tab label="주차별 현황" />
          <Tab label="학생별 현황" />
        </Tabs>
      </Paper>

      {/* 주차별 현황 탭 */}
      {currentTab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            주차별 출석 현황
          </Typography>

          {weekSummaries.length === 0 ? (
            <Alert severity="info">등록된 주차가 없습니다.</Alert>
          ) : (
            <Grid container spacing={2}>
              {weekSummaries.map((week) => {
                const completionRate = week.completionRate || 0;
                const weekColor = attendanceService.getAttendanceColor(completionRate);

                return (
                  <Grid item xs={12} sm={6} md={4} key={week.weekId}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          {week.weekTitle || `${week.weekNumber}주차`}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            완료: {week.completedStudents} / {week.totalStudents}명
                          </Typography>
                          <Chip
                            label={`${completionRate.toFixed(1)}%`}
                            size="small"
                            color={weekColor}
                          />
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={completionRate}
                          color={weekColor}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Paper>
      )}

      {/* 학생별 현황 탭 */}
      {currentTab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              학생별 출석 현황
            </Typography>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>주차 선택</InputLabel>
              <Select
                value={selectedWeek}
                label="주차 선택"
                onChange={(e) => setSelectedWeek(e.target.value)}
              >
                <MenuItem value="all">전체</MenuItem>
                {weekSummaries.map((week) => (
                  <MenuItem key={week.weekId} value={week.weekId}>
                    {week.weekTitle || `${week.weekNumber}주차`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {loadingWeek ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>학번</TableCell>
                    <TableCell>이름</TableCell>
                    {selectedWeek === 'all' ? (
                      <>
                        <TableCell align="center">완료 주차</TableCell>
                        <TableCell align="center">출석률</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell align="center">시청 영상</TableCell>
                        <TableCell align="center">출석 여부</TableCell>
                        <TableCell align="center">완료 일시</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedWeek === 'all' ? (
                    // 전체 학생 출석 목록
                    studentsAttendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          수강생이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      studentsAttendance.map((student) => {
                        const studentColor = attendanceService.getAttendanceColor(student.attendanceRate);
                        return (
                          <TableRow key={student.studentId}>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell>{student.studentName}</TableCell>
                            <TableCell align="center">
                              {student.completedWeeks} / {student.totalWeeks}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={attendanceService.formatAttendanceRate(student.attendanceRate)}
                                size="small"
                                color={studentColor}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )
                  ) : (
                    // 주차별 학생 출석 목록
                    weekStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          출석 데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      weekStudents.map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell>{student.studentId}</TableCell>
                          <TableCell>{student.studentName}</TableCell>
                          <TableCell align="center">
                            {student.completedVideoCount} / {student.totalVideoCount}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={student.isCompleted ? '출석' : '미출석'}
                              size="small"
                              color={student.isCompleted ? 'success' : 'default'}
                              variant={student.isCompleted ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {attendanceService.formatCompletedAt(student.completedAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default AttendanceManagement;
