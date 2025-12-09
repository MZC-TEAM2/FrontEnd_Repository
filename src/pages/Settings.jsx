import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Brightness4,
  Notifications,
  Language,
  Security,
} from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext';

const Settings = () => {
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        설정
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <Brightness4 />
            </ListItemIcon>
            <ListItemText
              primary="다크 모드"
              secondary="어두운 테마를 사용합니다"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={isDarkMode}
                onChange={toggleTheme}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <Divider variant="inset" component="li" />

          <ListItem>
            <ListItemIcon>
              <Notifications />
            </ListItemIcon>
            <ListItemText
              primary="알림 설정"
              secondary="푸시 알림을 받습니다"
            />
            <ListItemSecondaryAction>
              <Switch edge="end" defaultChecked />
            </ListItemSecondaryAction>
          </ListItem>

          <Divider variant="inset" component="li" />

          <ListItem>
            <ListItemIcon>
              <Language />
            </ListItemIcon>
            <ListItemText
              primary="언어"
              secondary="한국어"
            />
          </ListItem>

          <Divider variant="inset" component="li" />

          <ListItem>
            <ListItemIcon>
              <Security />
            </ListItemIcon>
            <ListItemText
              primary="보안 설정"
              secondary="계정 보안 관리"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Settings;