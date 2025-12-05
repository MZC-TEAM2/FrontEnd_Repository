import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from '@mui/material';
import {
  Email,
  Lock,
  School,
  ArrowBack,
  CheckCircle,
  Timer,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Email verification states
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Errors and success messages
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

  const steps = ['이메일 인증', '비밀번호 재설정'];

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCode = () => {
    const newErrors = {};

    if (!formData.verificationCode) {
      newErrors.verificationCode = '인증 코드를 입력해주세요';
    } else if (formData.verificationCode.length !== 5) {
      newErrors.verificationCode = '인증 코드는 5자리여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(formData.newPassword)) {
      newErrors.newPassword = '비밀번호는 8자 이상, 영문자, 숫자, 특수문자를 포함해야 합니다';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendEmail = () => {
    if (validateEmail()) {
      // API 통신 대신 임시 처리
      console.log('비밀번호 재설정 이메일 발송:', formData.email);
      setEmailSent(true);
      setTimer(300); // 5분 = 300초
      setIsTimerActive(true);
      setApiError('');
      setSuccessMessage('인증 코드가 이메일로 발송되었습니다.');
    }
  };

  const handleVerifyCode = () => {
    if (validateCode()) {
      // API 통신 대신 임시 처리
      console.log('인증 코드 확인:', formData.verificationCode);
      setEmailVerified(true);
      setIsTimerActive(false);
      setSuccessMessage('인증이 완료되었습니다. 새 비밀번호를 설정해주세요.');
      setActiveStep(1);
    }
  };

  const handleResetPassword = () => {
    if (validatePassword()) {
      // API 통신 대신 임시 처리
      console.log('비밀번호 재설정:', formData.newPassword);
      setSuccessMessage('비밀번호가 성공적으로 변경되었습니다.');

      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  const handleResendCode = () => {
    if (validateEmail()) {
      // API 통신 대신 임시 처리
      console.log('인증 코드 재발송:', formData.email);
      setTimer(300); // 5분 = 300초
      setIsTimerActive(true);
      setApiError('');
      setSuccessMessage('인증 코드가 재발송되었습니다.');
    }
  };

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom align="center">
              비밀번호를 재설정할 계정의 이메일을 입력해주세요
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
              가입 시 등록한 이메일로 인증 코드를 발송해드립니다
            </Typography>

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
              sx={{ mb: 3 }}
            />

            {!emailSent && (
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSendEmail}
                sx={{ py: 1.5 }}
              >
                인증 코드 받기
              </Button>
            )}

            {emailSent && !emailVerified && (
              <>
                <TextField
                  fullWidth
                  name="verificationCode"
                  label="인증 코드"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  error={!!errors.verificationCode}
                  helperText={errors.verificationCode || (timer > 0 ? `남은 시간: ${formatTime(timer)}` : '')}
                  InputProps={{
                    endAdornment: timer > 0 && (
                      <InputAdornment position="end">
                        <Timer color={timer < 60 ? 'error' : 'action'} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleResendCode}
                      disabled={isTimerActive && timer > 240} // 1분 남았을 때부터 재발송 가능
                    >
                      재발송
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleVerifyCode}
                    >
                      인증 확인
                    </Button>
                  </Grid>
                </Grid>
              </>
            )}

            {emailVerified && (
              <Alert severity="success" sx={{ mt: 2 }}>
                이메일 인증이 완료되었습니다!
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom align="center">
              새 비밀번호를 설정해주세요
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
              안전한 비밀번호로 변경해주세요
            </Typography>

            <TextField
              fullWidth
              name="newPassword"
              label="새 비밀번호"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
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
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              name="confirmPassword"
              label="비밀번호 확인"
              type={showPasswordConfirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
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
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleResetPassword}
              sx={{ py: 1.5 }}
            >
              비밀번호 변경하기
            </Button>
          </Box>
        );

      default:
        return null;
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
              비밀번호 찾기
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

          {/* Success/Error Messages */}
          {successMessage && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
              icon={<CheckCircle />}
            >
              {successMessage}
            </Alert>
          )}

          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          {/* Step Content */}
          {getStepContent()}

          {/* Back to Login Link */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/login')}
              sx={{ color: 'text.secondary' }}
            >
              로그인 페이지로 돌아가기
            </Button>
          </Box>
        </Paper>

        {/* Footer */}
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 3 }}
        >
          © 2024 학사 관리 시스템. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default ForgotPassword;