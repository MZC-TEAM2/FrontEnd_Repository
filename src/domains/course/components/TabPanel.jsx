import React from 'react';
import { Box } from '@mui/material';

/**
 * 탭 패널 컴포넌트
 */
function TabPanel({ children, value, index }) {
  if (value !== index) {
    return null;
  }

  return (
    <Box
      role="tabpanel"
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      sx={{ 
        flex: 1,
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: 0, 
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

export default TabPanel;
