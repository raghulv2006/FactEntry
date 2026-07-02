import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import {
  FileDownload as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const MotionTableRow = motion(TableRow);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface UserDto {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface QueryDto {
  id: number;
  queryNumber: string;
  dateRaised: string;
  subject: string;
  status: string;
  criticalFlag: boolean;
  assignedSme: UserDto | null;
  createdBy: UserDto;
}

const Reports: React.FC = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [queries, setQueries] = useState<QueryDto[]>([]);

  // Filter params
  const [status, setStatus] = useState('');
  const [smeId, setSmeId] = useState('');
  const [createdById, setCreatedById] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [flag, setFlag] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`);
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPreview = async () => {
    try {
      const params: any = { size: 100 };
      if (status) params.status = status;
      if (smeId) params.smeId = smeId;
      if (createdById) params.createdById = createdById;
      if (flag) params.flag = flag;
      if (startDate) params.start = `${startDate}T00:00:00`;
      if (endDate) params.end = `${endDate}T23:59:59`;

      const res = await axios.get(`${API_URL}/queries`, { params });
      setQueries(res.data.content || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
    loadPreview();
  }, []);

  const handleExport = (format: 'excel' | 'pdf') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (smeId) params.append('smeId', smeId);
    if (createdById) params.append('createdById', createdById);
    if (flag) params.append('flag', flag);
    if (startDate) params.append('start', `${startDate}T00:00:00`);
    if (endDate) params.append('end', `${endDate}T23:59:59`);

    const downloadUrl = `${API_URL}/queries/export/${format}?${params.toString()}`;
    const token = localStorage.getItem('token');
    
    if (token) {
      axios({
        url: downloadUrl,
        method: 'GET',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `queries_report.${format === 'excel' ? 'xlsx' : 'pdf'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }).catch((e) => {
        console.error('Export download error: ', e);
      });
    }
  };

  const renderStatusBadge = (q: QueryDto) => {
    let className = 'glow-badge-closed';
    let label = q.status;

    if (q.criticalFlag) {
      className = 'glow-badge-critical';
      label = 'CRITICAL';
    } else {
      switch (q.status) {
        case 'OPEN':
          className = 'glow-badge-open';
          break;
        case 'IN_PROGRESS':
          className = 'glow-badge-in-progress';
          break;
        case 'RESOLVED':
          className = 'glow-badge-resolved';
          break;
        case 'CLOSED':
          className = 'glow-badge-closed';
          break;
      }
    }

    return (
      <Box
        className={className}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1.25,
          py: 0.35,
          borderRadius: 1,
          fontSize: '0.65rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}
      >
        {label.replace('_', ' ')}
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
        <Box sx={{ mb: 4.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '0.01em', mb: 0.5 }}>
            BI Reports & Exports
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Select custom audit parameters, inspect queries, and export reports in Excel spreadsheet or PDF layouts.
          </Typography>
        </Box>

        {/* Configurations panel */}
        <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 4.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 2.5, letterSpacing: '0.08em', color: 'text.primary' }}>
            Report Filter Parameters
          </Typography>
          
          <Grid container spacing={2.25} sx={{ mb: 1 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: '0.8rem',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' }
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: 13 }}>All Statuses</MenuItem>
                  <MenuItem value="OPEN" sx={{ fontSize: 13 }}>Open</MenuItem>
                  <MenuItem value="IN_PROGRESS" sx={{ fontSize: 13 }}>In Progress</MenuItem>
                  <MenuItem value="RESOLVED" sx={{ fontSize: 13 }}>Resolved</MenuItem>
                  <MenuItem value="CLOSED" sx={{ fontSize: 13 }}>Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>SME Assigned</InputLabel>
                <Select
                  value={smeId}
                  label="SME Assigned"
                  onChange={(e) => setSmeId(e.target.value)}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: '0.8rem',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' }
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: 13 }}>All SMEs</MenuItem>
                  {users
                    .filter((u) => u.role === 'SME')
                    .map((u) => (
                      <MenuItem key={u.id} value={u.id} sx={{ fontSize: 13 }}>{u.name}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Created By</InputLabel>
                <Select
                  value={createdById}
                  label="Created By"
                  onChange={(e) => setCreatedById(e.target.value)}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: '0.8rem',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' }
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: 13 }}>All Creators</MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id} sx={{ fontSize: 13 }}>{u.name} ({u.role.toLowerCase()})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Tag Filter</InputLabel>
                <Select
                  value={flag}
                  label="Tag Filter"
                  onChange={(e) => setFlag(e.target.value)}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: '0.8rem',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' }
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: 13 }}>All Tags</MenuItem>
                  <MenuItem value="TEAM_CLARIFICATION" sx={{ fontSize: 13 }}>Team Clarification</MenuItem>
                  <MenuItem value="KNOWLEDGE_SHARING" sx={{ fontSize: 13 }}>Knowledge Sharing</MenuItem>
                  <MenuItem value="TRAINING_REQUIRED" sx={{ fontSize: 13 }}>Training Required</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.8rem',
                    '& fieldset': { borderColor: 'divider' },
                    '&:hover fieldset': { borderColor: 'secondary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'secondary.main' }
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.8rem',
                    '& fieldset': { borderColor: 'divider' },
                    '&:hover fieldset': { borderColor: 'secondary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'secondary.main' }
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={loadPreview}
                startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  borderColor: 'divider',
                  '&:hover': {
                    color: 'text.primary',
                    borderColor: 'divider',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                Update Preview
              </Button>
              <Button
                variant="contained"
                onClick={() => handleExport('excel')}
                startIcon={<ExcelIcon sx={{ fontSize: 14 }} />}
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  bgcolor: 'rgba(0, 208, 132, 0.1)',
                  color: '#00D084',
                  border: '1px solid rgba(0, 208, 132, 0.2)',
                  boxShadow: '0 0 10px rgba(0, 208, 132, 0.05)',
                  '&:hover': {
                    bgcolor: '#00D084',
                    color: 'background.default',
                    boxShadow: '0 0 14px rgba(0, 208, 132, 0.25)'
                  }
                }}
              >
                Export Excel
              </Button>
              <Button
                variant="contained"
                onClick={() => handleExport('pdf')}
                startIcon={<PdfIcon sx={{ fontSize: 14 }} />}
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  bgcolor: 'rgba(255, 77, 109, 0.1)',
                  color: '#FF4D6D',
                  border: '1px solid rgba(255, 77, 109, 0.2)',
                  boxShadow: '0 0 10px rgba(255, 77, 109, 0.05)',
                  '&:hover': {
                    bgcolor: '#FF4D6D',
                    color: 'background.default',
                    boxShadow: '0 0 14px rgba(255, 77, 109, 0.25)'
                  }
                }}
              >
                Export PDF
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Preview Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 2.25, borderBottom: '1px solid', borderColor: 'divider', bgcolor: theme.palette.mode === 'dark' ? '#0B1220' : '#E2E8F0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.primary' }}>
              Report Data Preview ({queries.length} items loaded)
            </Typography>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Query No.</TableCell>
                <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Subject</TableCell>
                <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Created By</TableCell>
                <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>SME Assigned</TableCell>
                <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Status</TableCell>
                <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Raised Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      No matching queries found in current audit window.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                queries.map((q, idx) => (
                  <MotionTableRow
                    key={q.id}
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
                    <TableCell sx={{ py: 1.5, fontWeight: 900, color: 'secondary.main', fontSize: '0.8rem' }}>{q.queryNumber}</TableCell>
                    <TableCell sx={{ py: 1.5, fontSize: '0.8rem', fontWeight: 600, color: 'text.primary' }}>{q.subject}</TableCell>
                    <TableCell sx={{ py: 1.5, fontSize: '0.785rem', color: 'text.secondary' }}>{q.createdBy.name}</TableCell>
                    <TableCell sx={{ py: 1.5, fontSize: '0.785rem', color: 'text.secondary' }}>{q.assignedSme ? q.assignedSme.name : 'Unassigned'}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>{renderStatusBadge(q)}</TableCell>
                    <TableCell sx={{ py: 1.5, fontSize: '0.785rem', color: 'text.secondary' }}>{new Date(q.dateRaised).toLocaleDateString()}</TableCell>
                  </MotionTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </motion.div>
  );
};

export default Reports;
