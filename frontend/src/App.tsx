import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QueryList from './pages/QueryList';
import QueryDetails from './pages/QueryDetails';
import CreateQuery from './pages/CreateQuery';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === null ? true : saved === 'dark';
  });

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [darkMode]);

  // Build custom themes
  const theme = useMemo(() => {
    const isDark = darkMode;
    return createTheme({
      palette: {
        mode: isDark ? 'dark' : 'light',
        primary: {
          main: '#2D1F66', // Primary Purple
          light: '#4B2D9B', // Secondary Purple
          dark: '#170E3A',
          contrastText: '#ffffff'
        },
        secondary: {
          main: '#00E5C3', // Accent Cyan
          light: '#33EBD2',
          dark: '#00B298',
          contrastText: isDark ? '#070B14' : '#ffffff'
        },
        info: {
          main: '#39A7FF', // Accent Blue
        },
        success: {
          main: '#00D084', // Success Green
        },
        warning: {
          main: '#FFB020', // Warning Amber
        },
        error: {
          main: '#FF4D6D', // Danger Red
        },
        background: {
          default: isDark ? '#121824' : '#F1F5F9', // Primary Background
          paper: isDark ? '#1B2232' : '#F8FAFC'   // Card Background
        },
        divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        action: {
          hover: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          selected: isDark ? 'rgba(0, 229, 195, 0.08)' : 'rgba(45, 31, 102, 0.08)',
        }
      },
      typography: {
        fontFamily: 'Inter, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        h4: {
          fontWeight: 800,
          fontSize: '1.5rem',
          letterSpacing: '-0.02em',
          color: isDark ? '#E2E8F0' : '#334155'
        },
        h5: {
          fontWeight: 800,
          fontSize: '1.25rem',
          letterSpacing: '-0.01em',
          color: isDark ? '#E2E8F0' : '#334155'
        },
        h6: {
          fontWeight: 700,
          fontSize: '1.05rem',
          color: isDark ? '#E2E8F0' : '#334155'
        },
        body1: {
          fontSize: '0.875rem',
          lineHeight: 1.5,
          color: isDark ? '#E2E8F0' : '#334155'
        },
        body2: {
          fontSize: '0.785rem',
          lineHeight: 1.45,
          color: isDark ? '#94A3B8' : '#64748B'
        },
        subtitle1: {
          fontWeight: 700,
          fontSize: '0.925rem',
          color: isDark ? '#E2E8F0' : '#334155'
        },
        subtitle2: {
          fontWeight: 700,
          fontSize: '0.825rem',
          color: isDark ? '#94A3B8' : '#64748B'
        }
      },
      shape: {
        borderRadius: 12
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 8,
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: isDark ? '0 0 12px rgba(0, 229, 195, 0.25)' : '0 0 12px rgba(45, 31, 102, 0.15)'
              }
            }
          }
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              boxShadow: 'none',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              backgroundColor: isDark ? '#161F2E' : '#FFFFFF',
              borderRadius: 12,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: isDark ? '0 8px 30px rgba(0, 229, 195, 0.08)' : '0 8px 30px rgba(45, 31, 102, 0.06)',
                borderColor: isDark ? 'rgba(0, 229, 195, 0.2)' : 'rgba(45, 31, 102, 0.2)'
              }
            }
          }
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              boxShadow: 'none',
              backgroundColor: isDark ? '#161F2E' : '#FFFFFF',
              borderRadius: 12,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
            }
          }
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              padding: '12px 16px',
              color: isDark ? '#FFFFFF' : '#0F172A',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            },
            head: {
              backgroundColor: isDark ? '#0B1220' : '#E2E8F0',
              fontWeight: 700,
              fontSize: '0.785rem',
              color: isDark ? '#AAB2C8' : '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }
          }
        }
      }
    });
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout darkMode={darkMode} toggleTheme={toggleTheme} />
                  </ProtectedRoute>
                }
              >
                {/* Dashboard */}
                <Route index element={<Dashboard />} />
                
                {/* Queries List */}
                <Route path="queries" element={<QueryList />} />
                
                {/* Single Query Details */}
                <Route path="queries/:id" element={<QueryDetails />} />
                
                {/* Raise Query */}
                <Route
                  path="queries/create"
                  element={
                    <ProtectedRoute allowedRoles={['ANALYST']}>
                      <CreateQuery />
                    </ProtectedRoute>
                  }
                />
                
                {/* Reports Export */}
                <Route path="reports" element={<Reports />} />
                
                {/* Admin user management */}
                <Route
                  path="admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin Audit Logs */}
                <Route
                  path="admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AuditLogs />
                    </ProtectedRoute>
                  }
                />
              </Route>
              
              {/* Fallback routing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
