import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  Alert,
} from '@mui/material';

/**
 * 수강신청 현황 컴포넌트
 */
const EnrollmentSummary = ({
  registeredCredits,
  totalCredits,
  registeredCount,
  cartCount,
}) => {
  const total = registeredCredits + totalCredits;

  return (
    <Card>
      <CardContent sx={{ p: 3, height: '100%', overflow: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          수강신청 현황
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                신청 완료
              </Typography>
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                {registeredCredits}
              </Typography>
              <Typography variant="body1" sx={{ color: 'white' }}>
                학점 ({registeredCount}과목)
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                장바구니
              </Typography>
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                {totalCredits}
              </Typography>
              <Typography variant="body1" sx={{ color: 'white' }}>
                학점 ({cartCount}과목)
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            총 신청 학점
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 700, color: total > 21 ? 'error.main' : 'text.primary' }}>
            {total}
          </Typography>
          <Typography variant="h5" color="text.secondary">
            / 21 학점
          </Typography>

          <LinearProgress
            variant="determinate"
            value={Math.min((total / 21) * 100, 100)}
            sx={{
              mt: 2,
              height: 10,
              borderRadius: 5,
              bgcolor: 'grey.300'
            }}
            color={total > 21 ? 'error' : total > 18 ? 'warning' : 'primary'}
          />
        </Box>

        {total > 21 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            최대 수강 가능 학점(21학점)을 초과했습니다!
          </Alert>
        )}
        {total > 18 && total <= 21 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            18학점을 초과했습니다. 신중히 선택하세요.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EnrollmentSummary;
