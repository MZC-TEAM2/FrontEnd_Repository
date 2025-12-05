import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  School,
  CheckCircle,
  Timer,
} from '@mui/icons-material';

const SignUp = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    emailCode: '',
    password: '',
    passwordConfirm: '',
    name: '',
    userType: '',
    collegeId: '',
    departmentId: '',
    grade: '',
    phoneNumber: '',
  });

  // Email verification states
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Errors
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const steps = ['이메일 인증', '기본 정보', '학적 정보'];

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0 && isTimerActive) {
      setIsTimerActive(false);
      setEmailSent(false);
      setApiError('인증 시간이 만료되었습니다. 다시 시도해주세요.');
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setApiError('');
  };

  const validateEmail = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (emailSent && !formData.emailCode) {
      newErrors.emailCode = '인증 코드를 입력해주세요';
    } else if (emailSent && formData.emailCode.length !== 5) {
      newErrors.emailCode = '인증 코드는 5자리여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBasicInfo = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(formData.password)) {
      newErrors.password = '비밀번호는 8자 이상, 영문자, 숫자, 특수문자를 포함해야 합니다';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요';
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = '이름은 2~50자여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAcademicInfo = () => {
    const newErrors = {};

    if (!formData.userType) {
      newErrors.userType = '사용자 유형을 선택해주세요';
    }

    if (!formData.collegeId) {
      newErrors.collegeId = '대학을 선택해주세요';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = '학과를 선택해주세요';
    }

    if (formData.userType === 'STUDENT' && !formData.grade) {
      newErrors.grade = '학년을 선택해주세요';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = '전화번호를 입력해주세요';
    } else if (!/^010\d{8}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = '올바른 전화번호 형식이 아닙니다 (01012345678)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendEmail = () => {
    if (!formData.email) {
      setErrors({ email: '이메일을 입력해주세요' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ email: '올바른 이메일 형식이 아닙니다' });
      return;
    }

    // API 통신 대신 임시 처리
    console.log('이메일 인증 코드 발송:', formData.email);
    setEmailSent(true);
    setTimer(300); // 5분 = 300초
    setIsTimerActive(true);
    setApiError('');
  };

  const handleVerifyEmail = () => {
    if (validateEmail() && formData.emailCode) {
      // API 통신 대신 임시 처리
      console.log('이메일 인증 코드 확인:', formData.emailCode);
      setEmailVerified(true);
      setIsTimerActive(false);
      handleNext();
    }
  };

  const handleNext = () => {
    let isValid = false;

    switch (activeStep) {
      case 0:
        isValid = emailVerified;
        break;
      case 1:
        isValid = validateBasicInfo();
        break;
      case 2:
        isValid = validateAcademicInfo();
        if (isValid) {
          handleSubmit();
          return;
        }
        break;
      default:
        break;
    }

    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    // API 통신 대신 임시 처리
    console.log('회원가입 데이터:', formData);
    alert('회원가입이 완료되었습니다!');
    navigate('/login');
  };

  // Colleges and departments data (matching backend database)
  const colleges = [
    { id: 1, name: '공과대학', code: 'ENG' },
    { id: 2, name: '경영대학', code: 'BUS' },
    { id: 3, name: '인문대학', code: 'HUM' },
  ];

  const departments = [
    { id: 1, name: '컴퓨터공학과', code: 'CS', collegeId: 1 },
    { id: 2, name: '전자공학과', code: 'EE', collegeId: 1 },
    { id: 3, name: '경영학과', code: 'BA', collegeId: 2 },
    { id: 4, name: '회계학과', code: 'ACC', collegeId: 2 },
    { id: 5, name: '국문학과', code: 'KOR', collegeId: 3 },
    { id: 6, name: '영문학과', code: 'ENG', collegeId: 3 },
  ];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              이메일 인증
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              학교 이메일을 입력하고 인증 코드를 받으세요
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="email"
                    label="이메일"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={emailSent}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: emailVerified && (
                        <InputAdornment position="end">
                          <CheckCircle color="success" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {!emailSent && (
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSendEmail}
                      sx={{ py: 1.5 }}
                    >
                      인증 코드 받기
                    </Button>
                  </Grid>
                )}

                {emailSent && !emailVerified && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="emailCode"
                        label="인증 코드"
                        value={formData.emailCode}
                        onChange={handleChange}
                        error={!!errors.emailCode}
                        helperText={errors.emailCode || `남은 시간: ${formatTime(timer)}`}
                        InputProps={{
                          endAdornment: timer > 0 && (
                            <InputAdornment position="end">
                              <Timer color={timer < 60 ? 'error' : 'action'} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleSendEmail}
                        disabled={isTimerActive}
                      >
                        재발송
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleVerifyEmail}
                      >
                        인증 확인
                      </Button>
                    </Grid>
                  </>
                )}

                {emailVerified && (
                  <Grid item xs={12}>
                    <Alert severity="success">
                      이메일 인증이 완료되었습니다!
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              기본 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              계정에 사용할 기본 정보를 입력해주세요
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="name"
                    label="이름"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{
                      '& .MuiInputBase-root': {
                        paddingRight: '14px', // 패딩 조정으로 너비 일치
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ width: 40 }} /> {/* 빈 공간으로 너비 맞추기 */}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="password"
                    label="비밀번호"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="passwordConfirm"
                    label="비밀번호 확인"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    error={!!errors.passwordConfirm}
                    helperText={errors.passwordConfirm}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                            edge="end"
                          >
                            {showPasswordConfirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

              </Grid>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              학적 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              소속 대학 및 학과 정보를 입력해주세요
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.userType}>
                    <InputLabel>사용자 유형</InputLabel>
                    <Select
                      name="userType"
                      value={formData.userType}
                      onChange={handleChange}
                      label="사용자 유형"
                    >
                      <MenuItem value="STUDENT">학생</MenuItem>
                      <MenuItem value="PROFESSOR">교수</MenuItem>
                    </Select>
                    {errors.userType && <FormHelperText>{errors.userType}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.collegeId}>
                    <InputLabel>대학</InputLabel>
                    <Select
                      name="collegeId"
                      value={formData.collegeId}
                      onChange={handleChange}
                      label="대학"
                    >
                      {colleges.map((college) => (
                        <MenuItem key={college.id} value={college.id}>
                          {college.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.collegeId && <FormHelperText>{errors.collegeId}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.departmentId}>
                    <InputLabel>학과</InputLabel>
                    <Select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      label="학과"
                      disabled={!formData.collegeId}
                    >
                      {departments
                        .filter(dept => dept.collegeId === Number(formData.collegeId))
                        .map((dept) => (
                          <MenuItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </MenuItem>
                        ))}
                    </Select>
                    {errors.departmentId && <FormHelperText>{errors.departmentId}</FormHelperText>}
                  </FormControl>
                </Grid>

                {formData.userType === 'STUDENT' && (
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.grade}>
                      <InputLabel>학년</InputLabel>
                      <Select
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        label="학년"
                      >
                        <MenuItem value={1}>1학년</MenuItem>
                        <MenuItem value={2}>2학년</MenuItem>
                        <MenuItem value={3}>3학년</MenuItem>
                        <MenuItem value={4}>4학년</MenuItem>
                      </Select>
                      {errors.grade && <FormHelperText>{errors.grade}</FormHelperText>}
                    </FormControl>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="phoneNumber"
                    label="전화번호"
                    placeholder="01012345678"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber || "하이픈(-) 없이 숫자만 입력"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F5F9FF 0%, #E3F2FD 100%)',
        padding: 2,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <School sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" fontWeight="600" color="primary.main">
              회원가입
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Error Alert */}
          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          {/* Step Content */}
          {getStepContent(activeStep)}

          {/* Navigation Buttons */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              이전
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === 0 && !emailVerified}
            >
              {activeStep === steps.length - 1 ? '가입 완료' : '다음'}
            </Button>
          </Box>

          {/* Login Link */}
          <Divider sx={{ my: 3 }}>또는</Divider>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  color: '#6FA3EB',
                  fontWeight: 600,
                }}
              >
                로그인
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignUp;