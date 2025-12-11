import React from 'react';
import { Box } from '@mui/material';

/**
 * 탭 패널 컴포넌트
 */
function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ display: value === index ? 'flex' : 'none', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {value === index && <Box sx={{ py: 3, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>{children}</Box>}
    </div>
  );
}

export default TabPanel;
