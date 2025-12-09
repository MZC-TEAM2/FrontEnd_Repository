import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home,
  Business,
  School,
  Badge,
  Save,
  Cancel,
} from '@mui/icons-material';
import profileService from '../services/profileService';
import authService from '../services/authService';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editForm, setEditForm] = useState({
    name: '',
    mobileNumber: '',
    homeNumber: '',
    officeNumber: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await profileService.getMyProfile();
      setProfile(data);
      setEditForm({
        name: data.name || '',
        mobileNumber: data.mobileNumber || '',
        homeNumber: data.homeNumber || '',
        officeNumber: data.officeNumber || '',
      });
    } catch (err) {
      setError('프로필 정보를 불러오는데 실패했습니다.');
      console.error('프로필 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const updatedProfile = await profileService.updateProfile(editForm);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('프로필이 성공적으로 수정되었습니다.');

      // localStorage의 사용자 정보도 업데이트
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        currentUser.name = updatedProfile.name;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
    } catch (err) {
      setError('프로필 수정에 실패했습니다.');
      console.error('프로필 수정 실패:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: profile?.name || '',
      mobileNumber: profile?.mobileNumber || '',
      homeNumber: profile?.homeNumber || '',
      officeNumber: profile?.officeNumber || '',
    });
    setIsEditing(false);
    setError('');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        내 프로필
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 프로필 이미지 및 기본 정보 카드 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                src={profile?.thumbnailUrl || profile?.profileImageUrl || undefined}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {profile?.name?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {profile?.name}
              </Typography>
              <Chip
                label={profile?.userType === 'STUDENT' ? '학생' : '교수'}
                color="primary"
                size="small"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                {profile?.email}
              </Typography>
            </CardContent>
          </Card>

          {/* 학과 정보 카드 */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <School fontSize="small" />
                소속 정보
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>대학:</strong> {profile?.collegeName || '-'}
                </Typography>
                <Typography variant="body2">
                  <strong>학과:</strong> {profile?.departmentName || '-'}
                </Typography>
                {profile?.userType === 'STUDENT' && (
                  <>
                    <Typography variant="body2">
                      <strong>학번:</strong> {profile?.studentId || '-'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>입학년도:</strong> {profile?.admissionYear || '-'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>학년:</strong> {profile?.grade ? `${profile.grade}학년` : '-'}
                    </Typography>
                  </>
                )}
                {profile?.userType === 'PROFESSOR' && (
                  <>
                    <Typography variant="body2">
                      <strong>교번:</strong> {profile?.professorId || '-'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>임용일:</strong> {profile?.appointmentDate || '-'}
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 상세 정보 및 수정 폼 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                상세 정보
              </Typography>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(true)}
                >
                  수정
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    취소
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={isSaving ? <CircularProgress size={16} /> : <Save />}
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    저장
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {/* 이름 */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Person color="action" />
                  {isEditing ? (
                    <TextField
                      fullWidth
                      label="이름"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      size="small"
                    />
                  ) : (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        이름
                      </Typography>
                      <Typography variant="body1">{profile?.name || '-'}</Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* 이메일 (읽기 전용) */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      이메일
                    </Typography>
                    <Typography variant="body1">{profile?.email || '-'}</Typography>
                  </Box>
                </Box>
              </Grid>

              {/* 휴대폰 번호 */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone color="action" />
                  {isEditing ? (
                    <TextField
                      fullWidth
                      label="휴대폰 번호"
                      name="mobileNumber"
                      value={editForm.mobileNumber}
                      onChange={handleEditChange}
                      size="small"
                      placeholder="010-0000-0000"
                    />
                  ) : (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        휴대폰 번호
                      </Typography>
                      <Typography variant="body1">
                        {profile?.mobileNumber || '-'}
                        {profile?.mobileVerified && (
                          <Chip label="인증됨" size="small" color="success" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* 자택 번호 */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Home color="action" />
                  {isEditing ? (
                    <TextField
                      fullWidth
                      label="자택 번호"
                      name="homeNumber"
                      value={editForm.homeNumber}
                      onChange={handleEditChange}
                      size="small"
                      placeholder="02-0000-0000"
                    />
                  ) : (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        자택 번호
                      </Typography>
                      <Typography variant="body1">{profile?.homeNumber || '-'}</Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* 사무실 번호 */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Business color="action" />
                  {isEditing ? (
                    <TextField
                      fullWidth
                      label="사무실 번호"
                      name="officeNumber"
                      value={editForm.officeNumber}
                      onChange={handleEditChange}
                      size="small"
                      placeholder="02-0000-0000"
                    />
                  ) : (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        사무실 번호
                      </Typography>
                      <Typography variant="body1">{profile?.officeNumber || '-'}</Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;