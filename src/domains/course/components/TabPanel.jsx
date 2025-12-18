import React, { memo } from 'react';
import { Box } from '@mui/material';

/**
 * 탭 패널 컴포넌트
 * display: none을 사용하여 언마운트하지 않고 숨김 처리 (리렌더링 방지)
 */
const TabPanel = memo(({ children, value, index }) => {
  const isActive = value === index;

  return (
    <Box
      role="tabpanel"
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      sx={{ 
        flex: 1,
        display: isActive ? 'flex' : 'none', 
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
});

TabPanel.displayName = 'TabPanel';

export default TabPanel;
