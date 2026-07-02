import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  useTheme
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const MotionTableRow = motion(TableRow);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface UserDto {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

const UserManagement: React.FC = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState<UserDto | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ANALYST');
  
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`);
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('ANALYST');
    setError(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (u: UserDto) => {
    setEditUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setError(null);
    setOpenDialog(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editUser) {
        const payload: any = { name, email, role };
        if (password.trim()) {
          payload.password = password;
        }
        await axios.put(`${API_URL}/admin/users/${editUser.id}`, payload);
      } else {
        if (!password.trim()) {
          setError('Password is required for new users');
          return;
        }
        await axios.post(`${API_URL}/admin/users`, { name, email, password, role });
      }
      setOpenDialog(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error occurred while saving user');
    }
  };

  const handleDelete = async (u: UserDto) => {
    if (!window.confirm(`Are you sure you want to delete user ${u.name}?`)) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${u.id}`);
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const renderRoleChip = (role: string) => {
    let colorClass = 'glow-badge-closed';
    if (role === 'ADMIN') colorClass = 'glow-badge-critical';
    else if (role === 'SME') colorClass = 'glow-badge-in-progress';
    else if (role === 'ANALYST') colorClass = 'glow-badge-open';

    return (
      <Box
        className={colorClass}
        sx={{
          display: 'inline-flex',
          px: 1.25,
          py: 0.35,
          borderRadius: 1,
          fontSize: '0.65rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}
      >
        {role}
      </Box>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 4.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', mb: 0.5 }}>
              User Accounts Directory
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Register new analytical staff and assign operational access privileges (Analyst, SME, Administrator).
            </Typography>
          </Box>
          <Button
            variant="contained"
            className="glow-btn-cyan"
            startIcon={<AddIcon sx={{ fontSize: 14 }} />}
            onClick={handleOpenCreate}
            sx={{ py: 1, px: 3, fontSize: '0.785rem', letterSpacing: '0.04em', borderRadius: 1.5 }}
          >
            Add System User
          </Button>
        </Box>

        {/* Users list table */}
        <TableContainer component={Paper} sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Name</TableCell>
                <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Email Address</TableCell>
                <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Security Role</TableCell>
                <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Registered Date</TableCell>
                <TableCell align="center" sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u, idx) => (
                <MotionTableRow
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: idx * 0.02 }}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': { bgcolor: 'action.hover !important' }
                  }}
                >
                  <TableCell sx={{ py: 1.5, fontWeight: 700, color: 'text.primary', fontSize: '0.8rem' }}>{u.name}</TableCell>
                  <TableCell sx={{ py: 1.5, color: 'text.secondary', fontSize: '0.785rem' }}>{u.email}</TableCell>
                  <TableCell sx={{ py: 1.5 }}>{renderRoleChip(u.role)}</TableCell>
                  <TableCell sx={{ py: 1.5, color: 'text.secondary', fontSize: '0.785rem' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.5 }}>
                    <IconButton onClick={() => handleOpenEdit(u)} sx={{ color: 'secondary.main', '&:hover': { bgcolor: 'action.hover' } }} size="small">
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(u)} sx={{ color: 'error.main', '&:hover': { bgcolor: 'action.hover' } }} size="small">
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </TableCell>
                </MotionTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add / Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 1.5,
                width: 400,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                backgroundImage: 'none',
                boxShadow: theme.palette.mode === 'dark' ? '0 12px 40px rgba(0,0,0,0.6)' : '0 12px 40px rgba(0,0,0,0.1)'
              }
            }
          }}
        >
          <form onSubmit={handleSave}>
            <DialogTitle sx={{ fontWeight: 900, color: 'text.primary', fontSize: '1.1rem', pb: 1 }}>
              {editUser ? 'Edit User Credentials' : 'Register System User'}
            </DialogTitle>
            <DialogContent>
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2.5,
                    mt: 1,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    bgcolor: 'rgba(255, 77, 109, 0.1)',
                    color: 'error.main',
                    border: '1px solid',
                    borderColor: 'error.light'
                  }}
                >
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                sx={{
                  mb: 2.5,
                  mt: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.8rem',
                    '& fieldset': { borderColor: 'divider' },
                    '&:hover fieldset': { borderColor: 'secondary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'secondary.main' }
                  }
                }}
                slotProps={{
                  inputLabel: { style: { fontSize: '0.85rem', color: 'text.secondary' } }
                }}
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                variant="outlined"
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.8rem',
                    '& fieldset': { borderColor: 'divider' },
                    '&:hover fieldset': { borderColor: 'secondary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'secondary.main' }
                  }
                }}
                slotProps={{
                  inputLabel: { style: { fontSize: '0.85rem', color: 'text.secondary' } }
                }}
              />

              <TextField
                fullWidth
                label={editUser ? 'Password (Leave blank to keep current)' : 'Security Password'}
                type="password"
                variant="outlined"
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!editUser}
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.8rem',
                    '& fieldset': { borderColor: 'divider' },
                    '&:hover fieldset': { borderColor: 'secondary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'secondary.main' }
                  }
                }}
                slotProps={{
                  inputLabel: { style: { fontSize: '0.85rem', color: 'text.secondary' } }
                }}
              />

              <FormControl fullWidth size="small" required>
                <InputLabel sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>Access Privilege</InputLabel>
                <Select
                  value={role}
                  label="Access Privilege"
                  onChange={(e) => setRole(e.target.value)}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: '0.8rem',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' }
                  }}
                >
                  <MenuItem value="ANALYST">Analyst Desk</MenuItem>
                  <MenuItem value="SME">Subject Matter Expert (SME)</MenuItem>
                  <MenuItem value="ADMIN">System Administrator</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
              <Button
                onClick={() => setOpenDialog(false)}
                sx={{ textTransform: 'none', fontWeight: 800, color: 'text.secondary', '&:hover': { color: 'text.primary' }, fontSize: 11 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                className="glow-btn-cyan"
                sx={{ py: 0.75, px: 3, fontSize: '0.785rem', letterSpacing: '0.04em', borderRadius: 1.5 }}
              >
                Save Credentials
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </motion.div>
  );
};

export default UserManagement;
