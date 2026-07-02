import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/FactEntry.png';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Avatar,
  Paper,
  InputBase,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ListAlt as ListIcon,
  AddCircleOutlined as AddIcon,
  Assessment as ReportsIcon,
  People as PeopleIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  ExitToApp as LogoutIcon,
  Label as TagIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface NotificationItem {
  id: number;
  message: string;
  queryId: number;
  queryNumber: string;
  isRead: boolean;
  createdAt: string;
}

interface LayoutProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ darkMode, toggleTheme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [globalSearch, setGlobalSearch] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // States
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications`);
      setNotifications(res.data);
      const countRes = await axios.get(`${API_URL}/notifications/unread-count`);
      setUnreadCount(countRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleNotifClick = async (notif: NotificationItem) => {
    try {
      await axios.put(`${API_URL}/notifications/${notif.id}/read`);
      setNotifDrawerOpen(false);
      fetchNotifications();
      if (notif.queryId) {
        navigate(`/queries/${notif.queryId}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReadAll = async () => {
    try {
      await axios.put(`${API_URL}/notifications/read-all`);
      fetchNotifications();
      setNotifDrawerOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon sx={{ fontSize: 20 }} />, path: '/', roles: ['ANALYST', 'SME', 'ADMIN'] },
    { text: 'Queries', icon: <ListIcon sx={{ fontSize: 20 }} />, path: '/queries', roles: ['ANALYST', 'SME', 'ADMIN'] },
    { text: 'New Query', icon: <AddIcon sx={{ fontSize: 20 }} />, path: '/queries/create', roles: ['ANALYST'] },
    { text: 'Reports', icon: <ReportsIcon sx={{ fontSize: 20 }} />, path: '/reports', roles: ['ANALYST', 'SME', 'ADMIN'] },
    { text: 'User Management', icon: <PeopleIcon sx={{ fontSize: 20 }} />, path: '/admin/users', roles: ['ADMIN'] },
    { text: 'Audit Logs', icon: <HistoryIcon sx={{ fontSize: 20 }} />, path: '/admin/audit-logs', roles: ['ADMIN'] },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'var(--bg-sidebar)', borderRight: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ justifyContent: collapsed ? 'center' : 'space-between', px: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src={logo} alt="FactEntry Logo" style={{ height: 35, objectFit: 'contain' }} />
          </Box>
        )}
        {collapsed && (
          <Box sx={{ width: 28, height: 28, bgcolor: 'secondary.main', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0.5, fontWeight: 900, fontSize: 11, border: '1px solid var(--border-subtle)' }}>
            FE
          </Box>
        )}
        <IconButton onClick={toggleSidebar} sx={{ display: { xs: 'none', sm: 'inline-flex' }, p: 0.5, color: 'text.secondary' }}>
          {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </Toolbar>
      
      <List sx={{ px: 1, py: 2.5 }}>
        {menuItems
          .filter((item) => user && item.roles.includes(user.role))
          .map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.75 }}>
                <Tooltip title={collapsed ? item.text : ""} placement="right" arrow>
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                    className={isActive ? 'glowing-active-sidebar' : ''}
                    sx={{
                      borderRadius: 1.5,
                      minHeight: 42,
                      justifyContent: collapsed ? 'center' : 'initial',
                      px: 2.5,
                      color: isActive ? 'text.primary' : 'text.secondary',
                      bgcolor: 'transparent',
                      borderLeft: '3px solid transparent',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        color: 'text.primary'
                      },
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? '#00E5C3' : '#AAB2C8',
                        minWidth: 0,
                        mr: collapsed ? 0 : 2,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={
                          <Typography sx={{ fontSize: 13, fontWeight: isActive ? 800 : 500, letterSpacing: '0.01em' }}>
                            {item.text}
                          </Typography>
                        }
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
      </List>
      
      <Box sx={{ mt: 'auto', p: collapsed ? 1 : 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Tooltip title={collapsed ? `${user?.name} (${user?.role})` : ""} placement="right" arrow>
          <Paper
            elevation={0}
            className="glass-panel"
            sx={{
              p: collapsed ? 0.75 : 1.5,
              borderRadius: 1.5,
              bgcolor: 'rgba(255, 255, 255, 0.01) !important',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#4B2D9B', color: '#00E5C3', width: 28, height: 28, fontSize: 11, fontWeight: 800, border: '1px solid rgba(0, 229, 195, 0.2)' }}>
                {user?.name.charAt(0)}
              </Avatar>
              {!collapsed && (
                <Box sx={{ overflow: 'hidden', textAlign: 'left' }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800, fontSize: 12, color: 'text.primary' }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textTransform: 'uppercase', fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>
                    {user?.role.toLowerCase()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Tooltip>
      </Box>
    </Box>
  );

  const currentDrawerWidth = collapsed ? 70 : 240;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Header */}
      <AppBar
        position="fixed"
        elevation={0}
        className="glass-panel"
        sx={{
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { sm: `${currentDrawerWidth}px` },
          borderBottom: '1px solid !important',
          borderColor: 'divider !important',
          bgcolor: 'transparent !important',
          backdropFilter: 'blur(16px) !important',
          color: 'text.primary',
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: 150,
          }),
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 3, height: 64 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Global Search Bar */}
            <Box
              sx={{
                position: 'relative',
                borderRadius: 1.5,
                bgcolor: 'action.hover',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                width: '100%',
                maxWidth: 400,
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                px: 2,
                height: 36,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.15s ease-in-out',
                '&:focus-within': {
                  borderColor: '#00E5C3',
                  boxShadow: '0 0 8px rgba(0, 229, 195, 0.15)'
                }
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary', fontSize: 16, mr: 1.5 }} />
              <InputBase
                placeholder="Search queries and documentation..."
                sx={{ fontSize: '0.785rem', width: '100%', color: 'text.primary' }}
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/queries?search=${encodeURIComponent(globalSearch)}`);
                  }
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Theme Toggle */}
            <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton
                color="inherit"
                onClick={toggleTheme}
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'text.primary' }
                }}
              >
                {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications Tray">
              <IconButton color="inherit" onClick={() => setNotifDrawerOpen(true)} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                <Badge
                  badgeContent={unreadCount}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: '#FF4D6D',
                      color: '#FFFFFF',
                      fontSize: 9,
                      fontWeight: 800,
                      boxShadow: '0 0 6px #FF4D6D'
                    }
                  }}
                >
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'divider', mx: 0.5 }} />

            {/* Profile Dropdown */}
            <Tooltip title="Account Control">
              <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)} size="small" sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    bgcolor: '#2D1F66',
                    color: '#00E5C3',
                    width: 30,
                    height: 30,
                    fontSize: 12,
                    fontWeight: 800,
                    border: '1px solid rgba(0, 229, 195, 0.15)'
                  }}
                >
                  {user?.name.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={() => setUserMenuAnchor(null)}
              className="glass-panel"
              slotProps={{
                paper: {
                  sx: {
                    width: 240,
                    mt: 1.5,
                    border: '1px solid !important',
                    borderColor: 'divider !important',
                    bgcolor: 'background.paper !important',
                    backgroundImage: 'none',
                    boxShadow: theme => theme.palette.mode === 'dark' ? '0 10px 30px rgba(0, 0, 0, 0.5)' : '0 10px 30px rgba(0, 0, 0, 0.05)'
                  }
                }
              }}
            >
              <Box sx={{ px: 2.5, py: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>{user?.name}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 11, mb: 1.5 }} noWrap>{user?.email}</Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    bgcolor: 'rgba(75, 45, 155, 0.2)',
                    color: '#00E5C3',
                    border: '1px solid rgba(0, 229, 195, 0.2)',
                    px: 1.25,
                    py: 0.25,
                    borderRadius: 0.25,
                    fontWeight: 800,
                    fontSize: 9,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}
                >
                  {user?.role}
                </Box>
              </Box>
              <Divider sx={{ borderColor: 'divider' }} />
              <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/queries'); }} sx={{ fontSize: 13, py: 1, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>My Work Desk</MenuItem>
              <MenuItem onClick={logout} sx={{ fontSize: 13, py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#FF4D6D' }}>
                  <LogoutIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 700, color: '#FF4D6D' }}>Terminate Session</Typography>
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notifications Drawer (Sliding from Right) */}
      <Drawer
        anchor="right"
        open={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(0,0,0,0.4)' } }
        }}
      >
        <Box sx={{ width: 340, height: '100%', bgcolor: 'background.paper', borderLeft: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>Activity Notifications</Typography>
          <IconButton onClick={() => setNotifDrawerOpen(false)} sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
            {notifications.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No alerts recorded.</Typography>
              </Box>
            ) : (
              notifications.map((item) => (
                <Box
                  key={item.id}
                  onClick={() => handleNotifClick(item)}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 0.5,
                    border: '1px solid',
                    borderColor: item.isRead ? 'rgba(255,255,255,0.03)' : 'rgba(0, 229, 195, 0.15)',
                    bgcolor: item.isRead ? 'transparent' : 'rgba(0, 229, 195, 0.02)',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.02)',
                      borderColor: 'rgba(255,255,255,0.1)'
                    },
                    transition: 'all 0.15s ease-in-out'
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <TagIcon sx={{ fontSize: 16, mt: 0.3, color: item.isRead ? 'text.secondary' : 'secondary.main' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: item.isRead ? 500 : 800, fontSize: 12, color: 'text.primary' }}>
                        {item.message}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.75, fontSize: 9, color: 'text.secondary' }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </Box>
          {unreadCount > 0 && (
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleReadAll}
                sx={{
                  py: 1,
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#00E5C3',
                  borderColor: 'rgba(0, 229, 195, 0.3)',
                  '&:hover': {
                    borderColor: '#00E5C3',
                    bgcolor: 'rgba(0, 229, 195, 0.03)'
                  }
                }}
              >
                Dismiss All Unread Alerts
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Sidebar Navigation */}
      <Box component="nav" sx={{ width: { sm: currentDrawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, border: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentDrawerWidth,
              border: 'none',
              transition: (theme) => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: 150,
              }),
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Page Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          mt: 8,
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: 150,
          }),
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default Layout;
