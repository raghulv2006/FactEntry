import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  TablePagination,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

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
  sourceLink: string;
  status: string;
  criticalFlag: boolean;
  assignedSme: UserDto | null;
  createdBy: UserDto;
  flags: string[];
}

const MotionTableRow = motion(TableRow);

const QueryList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [queries, setQueries] = useState<QueryDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [users, setUsers] = useState<UserDto[]>([]);

  // Filter states bound to search parameters
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [smeId, setSmeId] = useState(searchParams.get('smeId') || '');
  const [createdById, setCreatedById] = useState(searchParams.get('createdById') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [flag, setFlag] = useState(searchParams.get('flag') || '');
  const [critical, setCritical] = useState(searchParams.get('critical') || '');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchQueries = async () => {
    try {
      const params: any = {
        page,
        size: rowsPerPage,
        sort: 'dateRaised,desc'
      };
      if (status) params.status = status;
      if (smeId) params.smeId = smeId;
      if (createdById) params.createdById = createdById;
      if (search) params.search = search;
      if (flag) params.flag = flag;
      if (critical) params.critical = critical;

      const res = await axios.get(`${API_URL}/queries`, { params });
      setQueries(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`);
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [page, rowsPerPage, searchParams]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateFilters = (newFilters: any) => {
    const updated = new URLSearchParams(searchParams);
    Object.keys(newFilters).forEach((key) => {
      const value = newFilters[key];
      if (value !== undefined && value !== null && value !== '') {
        updated.set(key, value);
      } else {
        updated.delete(key);
      }
    });
    // Reset page to 0 when filters change
    updated.delete('page');
    setPage(0);
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search });
  };

  const handleClearFilters = () => {
    setStatus('');
    setSmeId('');
    setCreatedById('');
    setSearch('');
    setFlag('');
    setCritical('');
    setSearchParams({});
    setPage(0);
  };

  const renderStatusBadge = (q: QueryDto) => {
    let styleClass = 'glow-badge-closed';
    if (q.criticalFlag && q.status !== 'CLOSED' && q.status !== 'RESOLVED') {
      styleClass = 'glow-badge-critical';
    } else if (q.status === 'OPEN') {
      styleClass = 'glow-badge-open';
    } else if (q.status === 'IN_PROGRESS') {
      styleClass = 'glow-badge-in-progress';
    } else if (q.status === 'RESOLVED') {
      styleClass = 'glow-badge-resolved';
    }

    return (
      <Box
        className={styleClass}
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
        {q.status}
      </Box>
    );
  };


  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '0.01em' }}>
          Database Repository & Cases
        </Typography>
        {user?.role === 'ANALYST' && (
          <Button
            variant="contained"
            className="glow-btn-cyan"
            onClick={() => navigate('/queries/create')}
            sx={{ py: 1, px: 3, fontSize: '0.785rem', letterSpacing: '0.05em', borderRadius: 1.5 }}
          >
            Raise New Query
          </Button>
        )}
      </Box>

      {/* Corporate Filter Panel */}
      <Card sx={{ borderRadius: 1.5, mb: 4.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <TextField
                  fullWidth
                  placeholder="ID, subject keyword or URL..."
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: <SearchIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                    }
                  }}
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
              
              <Grid size={{ xs: 12, sm: 2, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Status</InputLabel>
                  <Select
                    value={status}
                    label="Status"
                    onChange={(e) => updateFilters({ status: e.target.value })}
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

              <Grid size={{ xs: 12, sm: 2, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>SME Assigned</InputLabel>
                  <Select
                    value={smeId}
                    label="SME Assigned"
                    onChange={(e) => updateFilters({ smeId: e.target.value })}
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

              <Grid size={{ xs: 12, sm: 2, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Priority</InputLabel>
                  <Select
                    value={critical}
                    label="Priority"
                    onChange={(e) => updateFilters({ critical: e.target.value })}
                    sx={{
                      borderRadius: 1.5,
                      fontSize: '0.8rem',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' }
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: 13 }}>All Priorities</MenuItem>
                    <MenuItem value="true" sx={{ fontSize: 13 }}>Critical Only</MenuItem>
                    <MenuItem value="false" sx={{ fontSize: 13 }}>Standard Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 2, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Tag Filter</InputLabel>
                  <Select
                    value={flag}
                    label="Tag Filter"
                    onChange={(e) => updateFilters({ flag: e.target.value })}
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

              <Grid size={{ xs: 12, sm: 2, md: 1 }}>
                <Button
                  fullWidth
                  variant="text"
                  onClick={handleClearFilters}
                  sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.785rem', color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Sticky Header Data Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Table stickyHeader sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>ID</TableCell>
              <TableCell sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Subject</TableCell>
              <TableCell sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Created By</TableCell>
              <TableCell sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Assigned SME</TableCell>
              <TableCell sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Date Raised</TableCell>
              <TableCell sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Status</TableCell>
              <TableCell sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Tags</TableCell>
              <TableCell align="center" sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {queries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    No corporate queries found matching active filter set.
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
                  onClick={() => navigate(`/queries/${q.id}`)}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    borderLeft: '3px solid transparent',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderLeftColor: '#00E5C3 !important'
                    }
                  }}
                >
                  <TableCell sx={{ py: 1.5, fontWeight: 900, color: '#00E5C3', fontSize: '0.8rem' }}>
                    {q.queryNumber}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.8rem', fontWeight: 600, color: 'text.primary', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.subject}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.785rem', color: 'text.secondary' }}>{q.createdBy.name}</TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.785rem', color: 'text.secondary' }}>
                    {q.assignedSme ? (
                      <Typography variant="body2" sx={{ fontSize: '0.785rem', fontWeight: 600, color: 'text.primary' }}>{q.assignedSme.name}</Typography>
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: '0.785rem', fontStyle: 'italic', color: 'text.secondary' }}>
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.785rem', color: 'text.secondary' }}>{new Date(q.dateRaised).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ py: 1.5 }}>{renderStatusBadge(q)}</TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 160 }}>
                      {q.flags.map((flg) => (
                        <Chip
                          key={flg}
                          label={flg.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: 9,
                            height: 18,
                            borderRadius: 1,
                            fontWeight: 700,
                            borderColor: 'divider',
                            bgcolor: 'action.hover',
                            color: 'text.secondary'
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.5 }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Open Case File">
                      <IconButton onClick={() => navigate(`/queries/${q.id}`)} sx={{ color: '#00E5C3', '&:hover': { bgcolor: 'action.hover' } }} size="small">
                        <ViewIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </MotionTableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            fontSize: '0.75rem',
            color: 'text.secondary',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.75rem' },
            '& .MuiIconButton-root': { color: 'text.secondary' },
            '& .MuiTablePagination-select': { color: 'text.primary' }
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default QueryList;
