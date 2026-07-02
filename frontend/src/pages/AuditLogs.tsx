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
  TablePagination,
  Chip,
  CircularProgress,
  useTheme
} from '@mui/material';

const MotionTableRow = motion(TableRow);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface UserDto {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuditLogDto {
  id: number;
  entityType: string;
  entityId: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: UserDto;
  changedAt: string;
}

const AuditLogs: React.FC = () => {
  const theme = useTheme();
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/audit-logs`, {
        params: {
          page,
          size: rowsPerPage
        }
      });
      setLogs(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage]);

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
            System Audit Trail & Log
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Realtime telemetry of database operations: query updates, status changes, assignments, and thread activity.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: 'secondary.main' }} />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Timestamp</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Actor</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Entity Type</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>ID</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Field</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Old Value</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>New Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        No audit logs recorded yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, idx) => (
                    <MotionTableRow
                      key={log.id}
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
                      <TableCell sx={{ py: 1.5, fontSize: '0.785rem', color: 'text.secondary' }}>
                        {new Date(log.changedAt).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8rem' }}>{log.changedBy.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 10 }}>{log.changedBy.email}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, fontSize: '0.785rem', color: 'text.primary', fontWeight: 600 }}>{log.entityType}</TableCell>
                      <TableCell sx={{ py: 1.5, fontWeight: 800, color: 'secondary.main', fontSize: '0.785rem' }}>#{log.entityId}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          label={log.fieldName || 'action'}
                          size="small"
                          sx={{
                            fontSize: 9,
                            height: 18,
                            borderRadius: 1,
                            fontWeight: 700,
                            bgcolor: 'action.hover',
                            borderColor: 'divider',
                            color: 'secondary.main'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5, fontSize: '0.785rem', color: 'text.secondary', fontStyle: 'italic', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.oldValue !== null ? String(log.oldValue) : '-'}
                      </TableCell>
                      <TableCell sx={{ py: 1.5, fontSize: '0.785rem', fontWeight: 700, color: 'text.primary', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.newValue !== null ? String(log.newValue) : '-'}
                      </TableCell>
                    </MotionTableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
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
        )}
      </Box>
    </motion.div>
  );
};

export default AuditLogs;
