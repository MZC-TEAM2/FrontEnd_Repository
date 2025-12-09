import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'lms-theme-mode';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // 라이트 모드
          primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
          },
          secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          text: {
            primary: '#212121',
            secondary: '#757575',
          },
        }
      : {
          // 다크 모드
          primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
          },
          secondary: {
            main: '#ce93d8',
            light: '#f3e5f5',
            dark: '#ab47bc',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ffffff',
            secondary: '#b0b0b0',
          },
        }),
  },
  typography: {
    fontFamily: [
      'Pretendard',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light'
            ? '0 2px 8px rgba(0,0,0,0.08)'
            : '0 2px 8px rgba(0,0,0,0.4)',
        },
      },
    },
  },
});

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem(THEME_STORAGE_KEY);
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setThemeMode = (newMode) => {
    setMode(newMode);
  };

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const value = useMemo(
    () => ({
      mode,
      isDarkMode: mode === 'dark',
      toggleTheme,
      setThemeMode,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
};

export default ThemeContext;