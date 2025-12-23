/**
 * 강의 등록 다이얼로그 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  MenuItem,
  IconButton,
  Paper,
  Divider,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  MenuBook as MenuBookIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

import SubjectSearchDialog from './SubjectSearchDialog';

/**
 * CourseCreateDialog 컴포넌트
 * @param {boolean} open - 다이얼로그 열림 상태
 * @param {Function} onClose - 닫기 핸들러
 * @param {Function} onSubmit - 등록 핸들러
 * @param {Array} enrollmentPeriods - 강의 등록 기간 목록 (periodType: COURSE_REGISTRATION)
 * @param {boolean} disabled - 강의 등록 기간이 아닐 때 비활성화
 */
const CourseCreateDialog = ({ open, onClose, onSubmit, enrollmentPeriods = [], disabled = false }) => {
  const [formData, setFormData] = useState({
    enrollmentPeriodId: '',
    subjectId: null, // 선택된 과목 ID
    courseCode: '', // 표시용 (읽기 전용)
    courseName: '', // 표시용 (읽기 전용)
    section: '01',
    credits: 3,
    courseType: 'MAJOR_REQ',
    maxStudents: 40,
    description: '',
    schedule: [{ dayOfWeek: 1, startTime: '09:00', endTime: '10:30', classroom: '' }],
    syllabus: {
      objectives: [''],
      textbook: '',
      grading: {
        midterm: 30,
        final: 30,
        assignment: 20,
        attendance: 10,
        participation: 10,
      },
    },
    totalWeeks: 16,
  });

  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [gradingTotal, setGradingTotal] = useState(100);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [subjectSearchOpen, setSubjectSearchOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const getScheduleRowError = (schedule) => {
    if (!schedule?.startTime || !schedule?.endTime) return '시작 시간과 종료 시간을 모두 입력해주세요';
    const startMinutes = timeToMinutes(schedule.startTime);
    const endMinutes = timeToMinutes(schedule.endTime);
    if (endMinutes <= startMinutes) return '종료 시간은 시작 시간보다 늦어야 합니다';
    return null;
  };

  const setStepErrors = (step, stepErrors) => {
    setErrors((prev) => {
      const next = { ...prev };

      // 해당 step에서만 쓰는 에러 키는 먼저 제거 후, 이번 step의 에러만 덮어쓴다.
      if (step === 0) {
        delete next.enrollmentPeriodId;
        delete next.subjectId;
        delete next.section;
        delete next.maxStudents;
      }
      if (step === 1) {
        delete next.schedule;
        delete next.creditsScheduleMismatch;
        Object.keys(next).forEach((k) => {
          if (/^schedule_\d+$/.test(k)) delete next[k];
        });
      }
      if (step === 2) {
        delete next.grading;
      }

      return { ...next, ...stepErrors };
    });
  };

  const getStepValidationErrors = (step) => {
    const stepErrors = {};

    if (step === 0) {
      if (disabled || enrollmentPeriods.length === 0) {
        stepErrors.enrollmentPeriodId = '현재 강의 등록 기간이 아닙니다.';
      } else if (!formData.enrollmentPeriodId) {
        stepErrors.enrollmentPeriodId = '수강신청 기간을 선택해주세요';
      }
      if (!formData.subjectId) stepErrors.subjectId = '과목을 선택해주세요';

      if (!formData.section) {
        stepErrors.section = '분반을 입력해주세요';
      } else {
        const sectionPattern = /^\d{2}$/;
        if (!sectionPattern.test(formData.section)) {
          stepErrors.section = '분반은 2자리 숫자로 입력해주세요 (예: 01, 02)';
        }
      }

      if (!formData.maxStudents || formData.maxStudents < 1) {
        stepErrors.maxStudents = '수강 정원을 입력해주세요';
      }
    }

    if (step === 1) {
      if (formData.schedule.length === 0) {
        stepErrors.schedule = '최소 1개 이상의 수업 시간을 입력해주세요';
      } else {
        formData.schedule.forEach((schedule, index) => {
          const msg = getScheduleRowError(schedule);
          if (msg) stepErrors[`schedule_${index}`] = msg;
        });
      }

      // 학점-주당 수업시간 일치(현재 validate()와 동일 기준)
      const weekly = calculateWeeklyHours();
      const credits = formData.credits || 0;
      if (weekly > 0 && credits > 0) {
        const difference = Math.abs(weekly - credits);
        if (difference > 0.5) {
          stepErrors.creditsScheduleMismatch = `학점(${credits}학점)과 주당 수업 시간(${weekly}시간)이 일치하지 않습니다. 일반적으로 1학점은 주당 1시간 수업입니다.`;
        }
      }
    }

    if (step === 2) {
      if (gradingTotal !== 100) {
        stepErrors.grading = '평가 비율의 합계가 100%가 되어야 합니다';
      }
    }

    return stepErrors;
  };

  const canProceedFromStep = () => Object.keys(getStepValidationErrors(activeStep)).length === 0;

  // 다이얼로그 열릴 때 폼 초기화
  useEffect(() => {
    if (open) {
      setFormData({
        enrollmentPeriodId: '',
        subjectId: null,
        courseCode: '',
        courseName: '',
        section: '01',
        credits: 3,
        courseType: 'MAJOR_REQ',
        maxStudents: 40,
        description: '',
        schedule: [{ dayOfWeek: 1, startTime: '09:00', endTime: '10:30', classroom: '' }],
        syllabus: {
          objectives: [''],
          textbook: '',
          grading: {
            midterm: 30,
            final: 30,
            assignment: 20,
            attendance: 10,
            participation: 10,
          },
        },
        totalWeeks: 16,
      });
      setSelectedSubject(null);
      setErrors({});
      setActiveStep(0);
      setGradingTotal(100);
    }
  }, [open]);

  // 평가 비율 합계 계산
  useEffect(() => {
    const total =
      formData.syllabus.grading.midterm +
      formData.syllabus.grading.final +
      formData.syllabus.grading.assignment +
      formData.syllabus.grading.attendance +
      formData.syllabus.grading.participation;
    setGradingTotal(total);
  }, [formData.syllabus.grading]);

  // 주당 수업 시간 계산 및 업데이트
  useEffect(() => {
    // 시간 문자열을 분으로 변환
    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // 주당 수업 시간 계산
    let totalMinutes = 0;
    formData.schedule.forEach((schedule, index) => {
      if (schedule.startTime && schedule.endTime) {
        const startMinutes = timeToMinutes(schedule.startTime);
        const endMinutes = timeToMinutes(schedule.endTime);
        const duration = endMinutes - startMinutes;
        
        if (duration > 0) {
          totalMinutes += duration;
        }
      }
    });
    const hours = Math.round((totalMinutes / 60) * 10) / 10;
    setWeeklyHours(hours);
    
    // 실시간으로 학점-시간 불일치 에러 제거 (사용자가 수정 중일 수 있음)
    if (errors.creditsScheduleMismatch) {
      const credits = formData.credits || 0;
      if (hours > 0 && credits > 0 && Math.abs(hours - credits) <= 0.5) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.creditsScheduleMismatch;
          return newErrors;
        });
      }
    }
  }, [formData.schedule, formData.credits, errors.creditsScheduleMismatch]);

  // 수업 시간(시작/종료) 유효성: 실시간으로 schedule_* 에러를 세팅/해제한다.
  // (특히 종료 시간이 "오전으로 돌아가서" 시작 시간보다 앞서게 되는 케이스를 즉시 차단/표시)
  useEffect(() => {
    setErrors((prev) => {
      const next = { ...prev };

      // schedule 관련 에러는 모두 재계산
      Object.keys(next).forEach((k) => {
        if (/^schedule_\d+$/.test(k)) delete next[k];
      });
      if (formData.schedule.length > 0 && next.schedule) delete next.schedule;

      formData.schedule.forEach((s, i) => {
        const msg = getScheduleRowError(s);
        if (msg) next[`schedule_${i}`] = msg;
      });

      return next;
    });
  }, [formData.schedule]);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else if (field.startsWith('syllabus.')) {
      const path = field.split('.');
      if (path.length === 3) {
        const [_, parent, child] = path;
        setFormData((prev) => ({
          ...prev,
          syllabus: {
            ...prev.syllabus,
            [parent]: {
              ...prev.syllabus[parent],
              [child]: value,
            },
          },
        }));
      } else {
        const [_, parent] = path;
        setFormData((prev) => ({
          ...prev,
          syllabus: {
            ...prev.syllabus,
            [parent]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleScheduleChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addSchedule = () => {
    // 최대 2개까지만 추가 가능
    if (formData.schedule.length >= 2) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        { dayOfWeek: 1, startTime: '09:00', endTime: '10:30', classroom: '' },
      ],
    }));
  };

  const removeSchedule = (index) => {
    if (formData.schedule.length > 1) {
      setFormData((prev) => ({
        ...prev,
        schedule: prev.schedule.filter((_, i) => i !== index),
      }));
    }
  };

  const addObjective = () => {
    setFormData((prev) => ({
      ...prev,
      syllabus: {
        ...prev.syllabus,
        objectives: [...prev.syllabus.objectives, ''],
      },
    }));
  };

  const removeObjective = (index) => {
    if (formData.syllabus.objectives.length > 1) {
      setFormData((prev) => ({
        ...prev,
        syllabus: {
          ...prev.syllabus,
          objectives: prev.syllabus.objectives.filter((_, i) => i !== index),
        },
      }));
    }
  };

  const handleObjectiveChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      syllabus: {
        ...prev.syllabus,
        objectives: prev.syllabus.objectives.map((obj, i) => (i === index ? value : obj)),
      },
    }));
  };

  // 시간 문자열을 분으로 변환 (예: "09:00" -> 540)
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 주당 수업 시간 계산 (시간 단위)
  const calculateWeeklyHours = () => {
    let totalMinutes = 0;
    formData.schedule.forEach((schedule) => {
      if (schedule.startTime && schedule.endTime) {
        const startMinutes = timeToMinutes(schedule.startTime);
        const endMinutes = timeToMinutes(schedule.endTime);
        const duration = endMinutes - startMinutes;
        if (duration > 0) {
          totalMinutes += duration;
        }
      }
    });
    // 분을 시간으로 변환 (소수점 첫째자리까지)
    return Math.round((totalMinutes / 60) * 10) / 10;
  };

  // 과목 선택 핸들러
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setFormData((prev) => ({
      ...prev,
      subjectId: subject.id,
      courseCode: subject.subjectCode,
      courseName: subject.subjectName,
      credits: subject.credits,
      courseType: subject.courseType || 'MAJOR_REQ',
    }));
    // 에러 초기화
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.subjectId;
      return newErrors;
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.enrollmentPeriodId) {
      newErrors.enrollmentPeriodId = '수강신청 기간을 선택해주세요';
    }
    if (!formData.subjectId) {
      newErrors.subjectId = '과목을 선택해주세요';
    }
    if (!formData.section) {
      newErrors.section = '분반을 입력해주세요';
    } else {
      // 숫자인지 확인 (01, 02 등)
      const sectionPattern = /^\d{2}$/;
      if (!sectionPattern.test(formData.section)) {
        newErrors.section = '분반은 2자리 숫자로 입력해주세요 (예: 01, 02)';
      }
    }
    if (!formData.maxStudents || formData.maxStudents < 1) {
      newErrors.maxStudents = '수강 정원을 입력해주세요';
    }

    // 수업 시간 검증
    if (formData.schedule.length === 0) {
      newErrors.schedule = '최소 1개 이상의 수업 시간을 입력해주세요';
    } else {
      // 각 수업 시간의 필수 필드 검증
      formData.schedule.forEach((schedule, index) => {
        if (!schedule.startTime || !schedule.endTime) {
          newErrors[`schedule_${index}`] = '시작 시간과 종료 시간을 모두 입력해주세요';
        } else {
          const startMinutes = timeToMinutes(schedule.startTime);
          const endMinutes = timeToMinutes(schedule.endTime);
          if (endMinutes <= startMinutes) {
            newErrors[`schedule_${index}`] = '종료 시간은 시작 시간보다 늦어야 합니다';
          }
        }
      });

      // 학점과 수업 시간 일치 검증
      const weeklyHours = calculateWeeklyHours();
      const credits = formData.credits || 0;
      
      if (weeklyHours > 0 && credits > 0) {
        // 일반적으로 1학점 = 주당 1시간 수업
        // 허용 오차: ±0.5시간
        const difference = Math.abs(weeklyHours - credits);
        if (difference > 0.5) {
          newErrors.creditsScheduleMismatch = `학점(${credits}학점)과 주당 수업 시간(${weeklyHours}시간)이 일치하지 않습니다. 일반적으로 1학점은 주당 1시간 수업입니다.`;
        }
      }
    }

    // 평가 비율 합계 검증
    const totalGrading =
      formData.syllabus.grading.midterm +
      formData.syllabus.grading.final +
      formData.syllabus.grading.assignment +
      formData.syllabus.grading.attendance +
      formData.syllabus.grading.participation;

    if (totalGrading !== 100) {
      newErrors.grading = '평가 비율의 합계가 100%가 되어야 합니다';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    return isValid;
  };

  const handleSubmit = () => {

    
    const validationResult = validate();
    
    if (!validationResult) {
      return;
    }
    
    // API 명세에 맞게 데이터 구성 (방법 A: 기존 과목 선택)
    const requestData = {
      enrollmentPeriodId: formData.enrollmentPeriodId,
      subjectId: formData.subjectId, // 과목 ID 사용
      section: formData.section,
      maxStudents: formData.maxStudents,
      schedule: formData.schedule,
      syllabus: {
        ...formData.syllabus,
        objectives: formData.syllabus.objectives.filter((obj) => obj.trim() !== ''),
      },
      totalWeeks: formData.totalWeeks,
    };
    
    // description이 있으면 추가
    if (formData.description && formData.description.trim()) {
      requestData.description = formData.description;
    }
    
    onSubmit(requestData);
  };

  const dayOptions = [
    { value: 1, label: '월' },
    { value: 2, label: '화' },
    { value: 3, label: '수' },
    { value: 4, label: '목' },
    { value: 5, label: '금' },
  ];

  const courseTypeOptions = [
    { value: 'MAJOR_REQ', label: '전공필수', color: '#1976d2' },
    { value: 'MAJOR_ELEC', label: '전공선택', color: '#42a5f5' },
    { value: 'GEN_REQ', label: '교양필수', color: '#66bb6a' },
    { value: 'GEN_ELEC', label: '교양선택', color: '#ab47bc' },
  ];

  const steps = ['기본 정보', '수업 시간', '강의계획서'];

  const handleNext = () => {
    if (activeStep >= steps.length - 1) return;

    const stepErrors = getStepValidationErrors(activeStep);
    setStepErrors(activeStep, stepErrors);

    if (Object.keys(stepErrors).length === 0) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 4,
          px: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <SchoolIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: '-0.5px' }}>
                새 강의 개설
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 400 }}>
                강의 정보를 입력하여 새 강의를 개설하세요
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={onClose} 
            size="medium"
            sx={{ 
              color: 'white',
              width: 40,
              height: 40,
              borderRadius: '12px',
              transition: 'all 0.2s',
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                transform: 'scale(1.05)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {/* Stepper */}
        <Box sx={{ 
          px: 4, 
          pt: 4, 
          pb: 3,
          background: 'linear-gradient(to bottom, rgba(102, 126, 234, 0.05), transparent)',
        }}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{
              '& .MuiStepLabel-root .Mui-completed': {
                color: '#667eea',
              },
              '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
                color: '#667eea',
                fontWeight: 600,
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: '#667eea',
              },
              '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel': {
                color: '#667eea',
                fontWeight: 700,
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel 
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ px: 4, pt: 2, pb: 4, maxHeight: 'calc(90vh - 300px)', overflowY: 'auto' }}>
        {/* Step 0: 기본 정보 */}
        <Collapse in={activeStep === 0}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* 왼쪽: 기본 정보 카드 */}
            <Box sx={{ 
              width: { xs: '100%', md: '240px' },
              flexShrink: 0,
            }}>
              <Card 
                elevation={0}
                sx={{ 
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                  border: '2px solid',
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: 'fit-content',
                  position: 'sticky',
                  top: 0,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#667eea' }}>
                        기본 정보
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        강의의 기본 정보를 입력해주세요
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* 세로 구분선 (보이지 않음) */}
            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{ 
                display: { xs: 'none', md: 'block' },
                opacity: 0,
                width: '1px',
              }} 
            />

            {/* 오른쪽: 입력 필드들 */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* 첫 번째 줄: 강의 등록 기간 */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="강의 등록 기간"
                    value={formData.enrollmentPeriodId}
                    onChange={(e) => handleChange('enrollmentPeriodId', e.target.value)}
                    error={!!errors.enrollmentPeriodId}
                    helperText={errors.enrollmentPeriodId || (disabled ? '현재 강의 등록 기간이 아닙니다.' : '')}
                    required
                    disabled={disabled || enrollmentPeriods.length === 0}
                    sx={{
                      minWidth: 200,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      }
                    }}
                  >
                    {enrollmentPeriods.length > 0 ? (
                      enrollmentPeriods.map((period) => (
                        <MenuItem key={period.id} value={period.id}>
                          {period.term?.termName || period.termName} - {period.periodName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>등록 가능한 기간이 없습니다</MenuItem>
                    )}
                  </TextField>
                </Grid>
              </Grid>

              {/* 두 번째 줄: 과목 선택 */}
              <Card 
                variant="outlined" 
                sx={{ 
                  mb: 3,
                  p: 2.5,
                  borderRadius: 2.5,
                  border: '2px solid',
                  borderColor: errors.subjectId ? 'error.main' : selectedSubject ? '#667eea' : 'rgba(102, 126, 234, 0.2)',
                  background: selectedSubject 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                    : 'rgba(255, 255, 255, 0.5)',
                  transition: 'all 0.2s',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: selectedSubject ? 2 : 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: errors.subjectId ? 'error.main' : 'text.primary' }}>
                    과목 선택 *
                  </Typography>
                  <Button
                    variant={selectedSubject ? 'outlined' : 'contained'}
                    startIcon={<SearchIcon />}
                    onClick={() => setSubjectSearchOpen(true)}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      background: !selectedSubject && 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: !selectedSubject && 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      }
                    }}
                  >
                    {selectedSubject ? '다른 과목 선택' : '과목 검색'}
                  </Button>
                </Box>
                
                {selectedSubject ? (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {selectedSubject.subjectName}
                      </Typography>
                      <Chip 
                        label={selectedSubject.subjectCode} 
                        size="small" 
                        sx={{ 
                          fontWeight: 600,
                          backgroundColor: 'rgba(102, 126, 234, 0.15)',
                          color: '#667eea',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={selectedSubject.courseType}
                        size="small" 
                        sx={{ 
                          backgroundColor: '#667eea',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                      <Chip 
                        label={`${selectedSubject.credits}학점`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip 
                        label={selectedSubject.department}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                ) : (
                  <Alert 
                    severity={errors.subjectId ? 'error' : 'info'} 
                    sx={{ 
                      mt: 2,
                      borderRadius: 2,
                      '& .MuiAlert-message': {
                        width: '100%',
                      }
                    }}
                  >
                    {errors.subjectId || '과목 검색 버튼을 클릭하여 과목을 선택하세요'}
                  </Alert>
                )}
              </Card>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="분반"
                    value={formData.section}
                    onChange={(e) => handleChange('section', e.target.value)}
                    error={!!errors.section}
                    helperText={errors.section}
                    required
                    placeholder="01"
                    sx={{
                      width: 100,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="number"
                    label="수강 정원"
                    value={formData.maxStudents}
                    onChange={(e) => handleChange('maxStudents', parseInt(e.target.value) || 0)}
                    error={!!errors.maxStudents}
                    helperText={errors.maxStudents}
                    required
                    inputProps={{ min: 1 }}
                    sx={{
                      width: 120,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="number"
                    label="총 주차 수"
                    value={formData.totalWeeks}
                    onChange={(e) => handleChange('totalWeeks', parseInt(e.target.value) || 16)}
                    inputProps={{ min: 1, max: 20 }}
                    sx={{
                      width: 120,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      }
                    }}
                  />
                </Grid>
              </Grid>

              {/* 네 번째 줄: 강의 설명 (전체 너비) */}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="강의 설명 (선택사항)"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="강의에 대한 간단한 설명을 입력하세요"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Collapse>

        {/* 과목 검색 다이얼로그 */}
        <SubjectSearchDialog
          open={subjectSearchOpen}
          onClose={() => setSubjectSearchOpen(false)}
          onSelect={handleSubjectSelect}
        />

        {/* Step 1: 수업 시간 */}
        <Collapse in={activeStep === 1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card 
                elevation={0}
                sx={{ 
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                  mb: 4,
                  border: '2px solid',
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#667eea' }}>
                        수업 시간
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        강의 시간표를 설정해주세요
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    최대 2개까지 추가할 수 있습니다 ({formData.schedule.length}/2)
                  </Typography>
                  {weeklyHours > 0 && formData.credits > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        주당 수업 시간: <strong>{weeklyHours}시간</strong> | 학점: <strong>{formData.credits}학점</strong>
                      </Typography>
                      {Math.abs(weeklyHours - formData.credits) <= 0.5 ? (
                        <Chip
                          label="일치"
                          size="small"
                          color="success"
                          icon={<CheckCircleIcon />}
                        />
                      ) : (
                        <Chip
                          label="불일치"
                          size="small"
                          color="error"
                          icon={<InfoIcon />}
                        />
                      )}
                    </Box>
                  )}
                </Box>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addSchedule}
                  variant="contained"
                  disabled={formData.schedule.length >= 2}
                  sx={{ borderRadius: 2 }}
                >
                  시간 추가
                </Button>
              </Box>
              {errors.creditsScheduleMismatch && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  {errors.creditsScheduleMismatch}
                </Alert>
              )}
              {errors.schedule && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {errors.schedule}
                </Alert>
              )}
              {formData.schedule.map((schedule, index) => (
                <Card 
                  key={index} 
                  elevation={2}
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        select
                        label="요일"
                        value={schedule.dayOfWeek}
                        onChange={(e) => handleScheduleChange(index, 'dayOfWeek', parseInt(e.target.value))}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2.5,
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          }
                        }}
                      >
                        {dayOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        type="time"
                        label="시작 시간"
                        value={schedule.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        error={!!errors[`schedule_${index}`]}
                        helperText={errors[`schedule_${index}`]}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2.5,
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        type="time"
                        label="종료 시간"
                        value={schedule.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        error={!!errors[`schedule_${index}`]}
                        helperText={errors[`schedule_${index}`]}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2.5,
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="강의실"
                        value={schedule.classroom}
                        onChange={(e) => handleScheduleChange(index, 'classroom', e.target.value)}
                        placeholder="예: 공학관 401호"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2.5,
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          }
                        }}
                      />
                    </Grid>
                  <Grid item xs={12} sm={1}>
                    {formData.schedule.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => removeSchedule(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Grid>
          </Grid>
        </Collapse>

        {/* Step 2: 강의계획서 */}
        <Collapse in={activeStep === 2}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* 왼쪽: 강의계획서 카드 */}
            <Box sx={{ 
              width: { xs: '100%', md: '240px' },
              flexShrink: 0,
            }}>
              <Card 
                elevation={0}
                sx={{ 
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                  border: '2px solid',
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: 'fit-content',
                  position: 'sticky',
                  top: 0,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#667eea' }}>
                        강의계획서
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        강의 목표와 평가 방법을 설정해주세요
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* 세로 구분선 (보이지 않음) */}
            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{ 
                display: { xs: 'none', md: 'block' },
                opacity: 0,
                width: '1px',
              }} 
            />

            {/* 오른쪽: 입력 필드들 */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box>
              <Card 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  mb: 3,
                  border: '2px solid',
                  borderColor: 'rgba(102, 126, 234, 0.15)',
                  background: 'rgba(255, 255, 255, 0.5)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#667eea' }}>
                    학습 목표
                  </Typography>
                  <Button 
                    size="small" 
                    startIcon={<AddIcon />} 
                    onClick={addObjective}
                    variant="outlined"
                    sx={{ 
                      borderRadius: 2.5,
                      borderWidth: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                      }
                    }}
                  >
                    추가
                  </Button>
                </Box>
                {formData.syllabus.objectives.map((objective, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <TextField
                      fullWidth
                      value={objective}
                      onChange={(e) => handleObjectiveChange(index, e.target.value)}
                      placeholder={`학습 목표 ${index + 1}을 입력하세요`}
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2.5,
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                          }
                        }
                      }}
                    />
                    {formData.syllabus.objectives.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => removeObjective(index)}
                        size="small"
                        sx={{ 
                          borderRadius: 2,
                          '&:hover': { backgroundColor: 'error.lighter' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Card>
              
              <TextField
                fullWidth
                label="교재"
                value={formData.syllabus.textbook}
                onChange={(e) => handleChange('syllabus.textbook', e.target.value)}
                sx={{
                  my: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  }
                }}
              />
              
              <Card 
                variant="outlined" 
                sx={{ 
                  p: 3.5, 
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: 'rgba(102, 126, 234, 0.15)',
                  background: 'rgba(255, 255, 255, 0.5)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
                  }
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#667eea' }}>
                      평가 방법
                    </Typography>
                    <Chip
                      label={`합계: ${gradingTotal}%`}
                      color={gradingTotal === 100 ? 'success' : 'error'}
                      size="medium"
                      icon={gradingTotal === 100 ? <CheckCircleIcon /> : <InfoIcon />}
                      sx={{
                        fontWeight: 700,
                        boxShadow: gradingTotal === 100 
                          ? '0 2px 8px rgba(76, 175, 80, 0.3)' 
                          : '0 2px 8px rgba(244, 67, 54, 0.3)',
                      }}
                    />
                  </Box>
                  {errors.grading && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mt: 1, 
                        mb: 2,
                        borderRadius: 2.5,
                        boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)',
                      }}
                    >
                      {errors.grading}
                    </Alert>
                  )}
                  {gradingTotal !== 100 && !errors.grading && (
                    <Alert 
                      severity="warning" 
                      sx={{ 
                        mt: 1, 
                        mb: 2,
                        borderRadius: 2.5,
                        boxShadow: '0 2px 8px rgba(255, 152, 0, 0.15)',
                      }}
                    >
                      평가 비율의 합계가 100%가 되어야 합니다. (현재: {gradingTotal}%)
                    </Alert>
                  )}
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(gradingTotal, 100)} 
                    sx={{ 
                      mt: 2, 
                      height: 10, 
                      borderRadius: 2.5,
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2.5,
                        backgroundColor: gradingTotal === 100 
                          ? 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)'
                          : 'linear-gradient(90deg, #f44336 0%, #ef5350 100%)',
                        background: gradingTotal === 100 
                          ? 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)'
                          : 'linear-gradient(90deg, #f44336 0%, #ef5350 100%)',
                        boxShadow: gradingTotal === 100
                          ? '0 2px 8px rgba(76, 175, 80, 0.4)'
                          : '0 2px 8px rgba(244, 67, 54, 0.4)',
                      }
                    }} 
                  />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="중간고사 (%)"
                      value={formData.syllabus.grading.midterm}
                      onChange={(e) => handleChange('syllabus.grading.midterm', parseInt(e.target.value) || 0)}
                      inputProps={{ min: 0, max: 100 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="기말고사 (%)"
                      value={formData.syllabus.grading.final}
                      onChange={(e) => handleChange('syllabus.grading.final', parseInt(e.target.value) || 0)}
                      inputProps={{ min: 0, max: 100 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="과제 (%)"
                      value={formData.syllabus.grading.assignment}
                      onChange={(e) => handleChange('syllabus.grading.assignment', parseInt(e.target.value) || 0)}
                      inputProps={{ min: 0, max: 100 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="출석 (%)"
                      value={formData.syllabus.grading.attendance}
                      onChange={(e) => handleChange('syllabus.grading.attendance', parseInt(e.target.value) || 0)}
                      inputProps={{ min: 0, max: 100 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="참여도 (%)"
                      value={formData.syllabus.grading.participation}
                      onChange={(e) => handleChange('syllabus.grading.participation', parseInt(e.target.value) || 0)}
                      inputProps={{ min: 0, max: 100 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Box>
            </Box>
          </Box>
        </Collapse>
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        p: 4, 
        borderTop: '1px solid', 
        borderColor: 'divider',
        background: 'linear-gradient(to top, rgba(102, 126, 234, 0.03), transparent)',
        gap: 2 
      }}>
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: 2.5,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-1px)',
            }
          }}
        >
          취소
        </Button>
        {activeStep > 0 && (
          <Button 
            onClick={handleBack}
            variant="outlined"
            sx={{ 
              borderRadius: 2.5,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              borderWidth: 2,
              transition: 'all 0.2s',
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
              }
            }}
          >
            이전
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button 
            onClick={handleNext}
            variant="contained"
            disabled={!canProceedFromStep()}
            sx={{ 
              borderRadius: 2.5,
              ml: 'auto',
              px: 4,
              py: 1.5,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.95rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            다음
          </Button>
        ) : (
          <Button 
            onClick={() => {
              handleSubmit();
            }} 
            variant="contained"
            disabled={disabled || enrollmentPeriods.length === 0 || !canProceedFromStep()}
            startIcon={<CheckCircleIcon />}
            sx={{ 
              borderRadius: 2.5,
              ml: 'auto',
              px: 4,
              py: 1.5,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.95rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                boxShadow: 'none',
              }
            }}
          >
            강의 등록
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CourseCreateDialog;

