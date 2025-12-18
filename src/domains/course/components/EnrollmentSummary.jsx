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
  cartCredits,
  registeredCount,
  cartCount,
}) => {

  return (
    <Card sx={{  display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', alignItems: 'center', '&:last-child': { pb: 1.5 } }}>
        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, alignSelf: 'flex-start', width: '100%' }}>
          수강신청 현황
        </Typography>
        <Divider sx={{ mb: 1.5, width: '100%' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Grid container spacing={1.5} sx={{ maxWidth: '100%' }}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'primary.light', borderRadius: 1.5 }}>
                <Typography variant="body2" sx={{ color: 'white', mb: 0.5, fontSize: '1.8rem' }}>
                  신청 완료
                </Typography>
                <Typography variant="h5" sx={{ color: 'white', fontSize: '2rem'}}>
                  {registeredCredits}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontSize: '1.4rem' }}>
                  학점 ({registeredCount}과목)
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} >
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'warning.light', borderRadius: 1.5 }}>
                <Typography variant="body2" sx={{ color: 'white', mb: 0.5, fontSize: '1.8rem' }}>
                  장바구니
                </Typography>
                <Typography variant="h5" sx={{ color: 'white', fontSize: '2rem'}}>
                  {cartCredits}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontSize: '1.4rem' }}>
                  학점 ({cartCount}과목)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 1.5, width: '100%' }} />

        <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.100', borderRadius: 1.5, width: '100%' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '1.4rem' }}>
            총 신청 학점
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
              <Typography variant="h4" sx={{ fontSize: '2rem', color: registeredCredits > 21 ? 'error.main' : 'text.primary' }}>
                {registeredCredits}
              </Typography>
              {cartCredits > 0 && (
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
                  ({cartCredits})
                </Typography>
              )}
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
              / 21 학점
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={Math.min((registeredCredits / 21) * 100, 100)}
            sx={{
              mt: 1,
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.300'
            }}
            color={registeredCredits > 21 ? 'error' : registeredCredits > 18 ? 'warning' : 'primary'}
          />
        </Box>

        {registeredCredits > 21 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            최대 수강 가능 학점(21학점)을 초과했습니다!
          </Alert>
        )}
        {registeredCredits > 18 && registeredCredits <= 21 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            18학점을 초과했습니다. 신중히 선택하세요.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EnrollmentSummary;
