import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Avatar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Check as CheckIcon,
  History as HistoryIcon,
  AttachFile as FileIcon,
  ArrowBack as BackIcon,
  Quickreply as ResolutionIcon
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
  question: string;
  status: string;
  criticalFlag: boolean;
  assignedSme: UserDto | null;
  createdBy: UserDto;
  flags: string[];
}

interface CommentDto {
  id: number;
  queryId: number;
  author: UserDto;
  commentType: 'NORMAL' | 'RESOLUTION';
  commentText: string;
  createdAt: string;
}

interface AttachmentDto {
  id: number;
  queryId: number;
  fileName: string;
  uploadedBy: UserDto;
  filePath: string;
}

interface AuditLogDto {
  id: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string;
  changedBy: UserDto;
  changedAt: string;
}

interface DuplicateQueryDto {
  id: number;
  queryNumber: string;
  subject: string;
  status: string;
  similarityScore: number;
}

const QueryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [query, setQuery] = useState<QueryDto | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogDto[]>([]);
  const [relatedQueries, setRelatedQueries] = useState<DuplicateQueryDto[]>([]);
  const [smes, setSmes] = useState<UserDto[]>([]);

  const [loading, setLoading] = useState(true);

  // Form states
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('NORMAL');
  const [selectedSme, setSelectedSme] = useState<string>('');
  const [isCritical, setIsCritical] = useState(false);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const fetchQueryDetails = async () => {
    try {
      const qRes = await axios.get(`${API_URL}/queries/${id}`);
      setQuery(qRes.data);
      setSelectedSme(qRes.data.assignedSme ? String(qRes.data.assignedSme.id) : '');
      setIsCritical(qRes.data.criticalFlag);
      setSelectedFlags(qRes.data.flags || []);

      const cRes = await axios.get(`${API_URL}/queries/${id}/comments`);
      setComments(cRes.data);

      const aRes = await axios.get(`${API_URL}/queries/${id}/attachments`);
      setAttachments(aRes.data);

      const auditRes = await axios.get(`${API_URL}/queries/${id}/audit-logs`);
      setAuditLogs(auditRes.data);

      // Perform duplicate duplicate-check for recommendations
      const dupRes = await axios.post(`${API_URL}/queries/duplicate-check`, {
        subject: qRes.data.subject,
        question: qRes.data.question,
        sourceLink: qRes.data.sourceLink
      });
      // Filter out current query from matches
      setRelatedQueries(
        (dupRes.data || []).filter((r: DuplicateQueryDto) => r.id !== Number(id))
      );

      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchSmes = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`);
      const list: UserDto[] = res.data || [];
      setSmes(list.filter((u) => u.role === 'SME'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchQueryDetails();
    fetchSmes();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await axios.post(`${API_URL}/queries/${id}/comments`, {
        commentText: newComment,
        commentType: commentType
      });
      setNewComment('');
      setCommentType('NORMAL');
      fetchQueryDetails();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSmeAssign = async (smeIdStr: string) => {
    try {
      const targetSmeId = smeIdStr ? Number(smeIdStr) : '';
      await axios.put(`${API_URL}/queries/${id}/assign`, null, {
        params: { smeId: targetSmeId }
      });
      setSelectedSme(smeIdStr);
      fetchQueryDetails();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCriticalToggle = async (checked: boolean) => {
    try {
      await axios.put(`${API_URL}/queries/${id}/critical`, null, {
        params: { critical: checked }
      });
      setIsCritical(checked);
      fetchQueryDetails();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFlagToggle = (flagName: string) => {
    setSelectedFlags((prev) => {
      if (prev.includes(flagName)) {
        return prev.filter((f) => f !== flagName);
      } else {
        return [...prev, flagName];
      }
    });
  };

  const handleSaveFlags = async () => {
    try {
      await axios.put(`${API_URL}/queries/${id}/flags`, selectedFlags);
      fetchQueryDetails();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) return;

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      await axios.post(`${API_URL}/queries/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFileToUpload(null);
      fetchQueryDetails();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadAttachment = (attachment: AttachmentDto) => {
    window.open(`${API_URL}/queries/attachments/${attachment.id}/download`, '_blank');
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await axios.delete(`${API_URL}/queries/attachments/${attachmentId}`);
      fetchQueryDetails();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (targetStatus: string) => {
    try {
      await axios.put(`${API_URL}/queries/${id}/status?status=${targetStatus}`);
      fetchQueryDetails();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !query) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
        <CircularProgress size={30} sx={{ color: '#00E5C3' }} />
      </Box>
    );
  }

  const isSmeOrAdmin = user?.role === 'SME' || user?.role === 'ADMIN';

  const renderStatusBadge = (status: string, critical: boolean) => {
    let className = 'glow-badge-closed';
    let label = status;

    if (critical) {
      className = 'glow-badge-critical';
      label = 'CRITICAL';
    } else {
      switch (status) {
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
          borderRadius: 0.25,
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
    <Box sx={{ flexGrow: 1 }}>
      {/* Top Header Actions */}
      <Box sx={{ mb: 4.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/queries')} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, color: 'text.secondary', '&:hover': { color: 'text.primary', borderColor: 'text.primary' } }}>
            <BackIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5, letterSpacing: '0.01em' }}>
              Case File: {query.queryNumber}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {isSmeOrAdmin && query.status === 'OPEN' && (
            <Button
              variant="contained"
              onClick={() => handleSmeAssign(String(user?.id))}
              className="glow-btn-cyan"
              sx={{ py: 0.75, px: 2, fontSize: '0.75rem', letterSpacing: '0.04em', borderRadius: 1.5 }}
            >
              Assign to Self
            </Button>
          )}

          {user?.role === 'ANALYST' && query.status === 'RESOLVED' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
              onClick={() => handleStatusChange('CLOSED')}
              sx={{ borderRadius: 1.5, fontWeight: 800, py: 0.75, px: 2, fontSize: '0.75rem', letterSpacing: '0.04em', boxShadow: '0 0 10px rgba(0, 208, 132, 0.2)' }}
            >
              Confirm & Close Case
            </Button>
          )}

          {isSmeOrAdmin && (query.status === 'OPEN' || query.status === 'IN_PROGRESS') && (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleStatusChange('RESOLVED')}
              sx={{ borderRadius: 1.5, fontWeight: 800, py: 0.75, px: 2, fontSize: '0.75rem', letterSpacing: '0.04em', boxShadow: '0 0 10px rgba(0, 208, 132, 0.2)' }}
            >
              Mark Resolved
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Section: Information, Thread, Audit trail */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Query Information Card */}
            <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {query.subject}
                </Typography>
                {renderStatusBadge(query.status, query.criticalFlag)}
              </Box>

              <Divider sx={{ borderColor: 'divider', mb: 2.5 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 1, letterSpacing: '0.05em' }}>
                  Reference Question / Issue Details
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', p: 2.5, borderRadius: 1.5, fontSize: '0.825rem', color: 'text.primary', lineHeight: 1.6 }}>
                  {query.question}
                </Typography>
              </Box>

              {query.sourceLink && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5, letterSpacing: '0.05em' }}>
                    Reference Source Link
                  </Typography>
                  <a href={query.sourceLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#00E5C3', fontWeight: 700, fontSize: '0.825rem' }}>
                    {query.sourceLink}
                  </a>
                </Box>
              )}

              <Grid container spacing={2.5} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>Created By</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8rem' }}>{query.createdBy.name}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>Raised On</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8rem' }}>{new Date(query.dateRaised).toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>Assigned Expert</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#00E5C3', fontSize: '0.8rem' }}>
                    {query.assignedSme ? query.assignedSme.name : 'Unassigned'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>Categorization Tags</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {query.flags.length === 0 ? '-' : query.flags.map(f => (
                      <Chip key={f} label={f.replace('_', ' ')} size="small" sx={{ fontSize: 9, height: 18, borderRadius: 1, fontWeight: 700, bgcolor: 'action.hover', borderColor: 'divider', color: 'text.secondary' }} />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Resolution Thread (Discussion) */}
            <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 2.5, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                <ResolutionIcon sx={{ fontSize: 16, color: '#00E5C3' }} />
                Resolution & Discussion Thread
              </Typography>

              <List sx={{ mb: 2, p: 0 }}>
                <AnimatePresence>
                  {comments.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', p: 1 }}>
                      No case updates or resolutions posted. Use discussion form below to interact.
                    </Typography>
                  ) : (
                    comments.map((c, idx) => {
                      const isResolution = c.commentType === 'RESOLUTION';
                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 }}
                        >
                          <ListItem
                            alignItems="flex-start"
                            sx={{
                              px: 2,
                              py: 2,
                              borderRadius: 1.5,
                              bgcolor: isResolution ? 'rgba(0, 208, 132, 0.04)' : 'transparent',
                              border: isResolution ? '1px solid rgba(0, 208, 132, 0.2)' : 'none',
                              mb: 1.5,
                              boxShadow: isResolution ? '0 0 10px rgba(0, 208, 132, 0.03)' : 'none'
                            }}
                          >
                            <ListItemAvatar sx={{ minWidth: 40 }}>
                              <Avatar sx={{ bgcolor: isResolution ? '#00D084' : '#2D1F66', color: isResolution ? '#070B14' : '#00E5C3', width: 28, height: 28, fontSize: 11, fontWeight: 800, border: '1px solid rgba(0, 229, 195, 0.1)' }}>
                                {c.author.name.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: 12, color: 'text.primary' }}>
                                    {c.author.name} <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>(e.g. {c.author.role.toLowerCase()})</Typography>
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                                    {new Date(c.createdAt).toLocaleString()}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 0.75 }}>
                                  {isResolution && (
                                    <Chip label="SME RESOLUTION ACTION" size="small" sx={{ mb: 1, fontWeight: 900, fontSize: 8.5, height: 18, borderRadius: 1, bgcolor: '#00D084', color: '#070B14' }} />
                                  )}
                                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: 'text.primary', lineHeight: 1.5 }}>
                                    {c.commentText}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {idx < comments.length - 1 && <Divider sx={{ borderColor: 'divider', my: 1 }} />}
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </List>

              {/* Add Comment Input Form */}
              {query.status !== 'CLOSED' && (
                <Box component="form" onSubmit={handleAddComment} sx={{ mt: 3 }}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: isSmeOrAdmin ? 9 : 12 }}>
                      <TextField
                        fullWidth
                        placeholder="Post discussion message or formal resolution details..."
                        variant="outlined"
                        size="small"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
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
                    {isSmeOrAdmin && (
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Type</InputLabel>
                          <Select
                            value={commentType}
                            label="Type"
                            onChange={(e) => setCommentType(e.target.value)}
                            sx={{
                              borderRadius: 1.5,
                              fontSize: '0.8rem',
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' }
                            }}
                          >
                            <MenuItem value="NORMAL" sx={{ fontSize: 13 }}>Comment</MenuItem>
                            <MenuItem value="RESOLUTION" sx={{ fontSize: 13 }}>SME Resolution</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      className="glow-btn-cyan"
                      endIcon={<SendIcon sx={{ fontSize: 12 }} />}
                      sx={{ py: 0.75, px: 3, fontSize: '0.785rem', letterSpacing: '0.04em', borderRadius: 1.5 }}
                    >
                      Post Message
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>

            {/* Audit History Log */}
            <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                <HistoryIcon sx={{ fontSize: 16, color: '#00E5C3' }} />
                Case Audit Logs & History
              </Typography>
              {auditLogs.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No audit history recorded.</Typography>
              ) : (
                <Box sx={{ maxHeight: 240, overflowY: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ py: 1, fontSize: '0.7rem', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Action By</TableCell>
                        <TableCell sx={{ py: 1, fontSize: '0.7rem', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Field</TableCell>
                        <TableCell sx={{ py: 1, fontSize: '0.7rem', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Old Value</TableCell>
                        <TableCell sx={{ py: 1, fontSize: '0.7rem', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>New Value</TableCell>
                        <TableCell sx={{ py: 1, fontSize: '0.7rem', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B1220 !important' : '#E2E8F0 !important' }}>Timestamp</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                          <TableCell sx={{ py: 1, fontSize: 11, fontWeight: 700, color: 'text.primary' }}>{log.changedBy.name}</TableCell>
                          <TableCell sx={{ py: 1, fontSize: 11, color: '#00E5C3' }}>{log.fieldName}</TableCell>
                          <TableCell sx={{ py: 1, fontSize: 11, color: 'text.secondary', fontStyle: 'italic', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.oldValue || '-'}</TableCell>
                          <TableCell sx={{ py: 1, fontSize: 11, fontWeight: 700, color: 'text.primary', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.newValue || '-'}</TableCell>
                          <TableCell sx={{ py: 1, fontSize: 11, color: 'text.secondary' }}>{new Date(log.changedAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>
          </Box>
        </Grid>

        {/* Right Section: SME Controls, Vertical Status Timeline, Attachments, Related Queries */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* SME Controls (Administration) */}
            {isSmeOrAdmin && (
              <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 2.5, letterSpacing: '0.08em', color: 'text.primary' }}>
                  Case Control Panel
                </Typography>
                <Box sx={{ mb: 2.5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Assigned SME</InputLabel>
                    <Select
                      value={selectedSme}
                      label="Assigned SME"
                      onChange={(e) => handleSmeAssign(e.target.value)}
                      sx={{
                        borderRadius: 1.5,
                        fontSize: '0.8rem',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' }
                      }}
                    >
                      <MenuItem value="">Unassigned</MenuItem>
                      {smes.map((s) => (
                        <MenuItem key={s.id} value={s.id} sx={{ fontSize: 13 }}>{s.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mb: 2.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isCritical}
                        onChange={(e) => handleCriticalToggle(e.target.checked)}
                        color="error"
                        size="small"
                      />
                    }
                    label={<Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary' }}>Critical Urgency Flag</Typography>}
                  />
                </Box>
                
                <Divider sx={{ borderColor: 'divider', my: 2.5 }} />
                
                <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.08em', fontSize: 11, color: 'text.primary' }}>
                  Categorization Tags
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2.5 }}>
                  {['TEAM_CLARIFICATION', 'KNOWLEDGE_SHARING', 'TRAINING_REQUIRED'].map((flg) => (
                    <FormControlLabel
                      key={flg}
                      control={
                        <Checkbox
                          checked={selectedFlags.includes(flg)}
                          onChange={() => handleFlagToggle(flg)}
                          size="small"
                          sx={{ color: 'text.secondary', '&.Mui-checked': { color: '#00E5C3' } }}
                        />
                      }
                      label={<Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{flg.replace('_', ' ')}</Typography>}
                      sx={{ my: -0.25 }}
                    />
                  ))}
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleSaveFlags}
                  sx={{
                    borderRadius: 1.5,
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    color: '#00E5C3',
                    borderColor: 'rgba(0, 229, 195, 0.3)',
                    '&:hover': {
                      borderColor: '#00E5C3',
                      bgcolor: 'rgba(0, 229, 195, 0.03)'
                    }
                  }}
                >
                  Save Tags Selection
                </Button>
              </Paper>
            )}



            {/* Attachments panel */}
            <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 2.5, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                <FileIcon sx={{ fontSize: 16, color: '#00E5C3' }} />
                Case Attachments
              </Typography>

              <List sx={{ mb: 2.5, p: 0 }}>
                {attachments.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: 11 }}>No files attached.</Typography>
                ) : (
                  attachments.map((file) => (
                    <ListItem
                      key={file.id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton edge="end" onClick={() => handleDownloadAttachment(file)} sx={{ color: '#00E5C3' }} size="small">
                            <DownloadIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                          {(file.uploadedBy.id === user?.id || user?.role === 'ADMIN') && (
                            <IconButton edge="end" onClick={() => handleDeleteAttachment(file.id)} sx={{ color: '#FF4D6D' }} size="small">
                              <DeleteIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          )}
                        </Box>
                      }
                      sx={{ px: 1, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
                    >
                      <ListItemText
                        primary={<Typography noWrap sx={{ fontSize: 11.5, fontWeight: 700, color: 'text.primary', width: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.fileName}</Typography>}
                        secondary={<Typography sx={{ fontSize: 9.5, color: 'text.secondary' }}>By {file.uploadedBy.name}</Typography>}
                      />
                    </ListItem>
                  ))
                )}
              </List>

              {query.status !== 'CLOSED' && (
                <Box component="form" onSubmit={handleFileUpload}>
                  <Box sx={{ mb: 1.5 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<UploadIcon sx={{ fontSize: 12 }} />}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                        py: 0.75,
                        color: 'text.secondary',
                        borderColor: 'divider',
                        '&:hover': {
                          color: 'text.primary',
                          borderColor: 'secondary.main',
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      {fileToUpload ? fileToUpload.name : 'Select File'}
                      <input
                        type="file"
                        hidden
                        onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                      />
                    </Button>
                  </Box>
                  {fileToUpload && (
                    <Button type="submit" variant="contained" className="glow-btn-cyan" fullWidth sx={{ py: 0.5, fontSize: '0.75rem', borderRadius: 1.5 }}>
                      Upload Selected
                    </Button>
                  )}
                </Box>
              )}
            </Paper>

            {/* Related Queries Panel */}
            <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 2.5, letterSpacing: '0.08em', color: 'text.primary' }}>
                Similar & Related Cases
              </Typography>

              {relatedQueries.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: 11 }}>
                  No duplicate or related queries detected.
                </Typography>
              ) : (
                <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {relatedQueries.slice(0, 3).map((rq) => (
                    <Paper
                      key={rq.id}
                      onClick={() => navigate(`/queries/${rq.id}`)}
                      sx={{
                        p: 1.75,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        '&:hover': {
                          borderColor: '#00E5C3',
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography variant="subtitle2" sx={{ fontSize: 11.5, fontWeight: 900, color: '#00E5C3' }}>
                          {rq.queryNumber}
                        </Typography>
                        {renderStatusBadge(rq.status, false)}
                      </Box>
                      <Typography variant="body2" noWrap sx={{ fontSize: 11.5, fontWeight: 700, color: 'text.primary', mb: 0.75 }}>
                        {rq.subject}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: 9.5, color: 'text.secondary', fontWeight: 800 }}>
                        Score: <span style={{ color: '#00D084' }}>{(rq.similarityScore * 100).toFixed(0)}% Match</span>
                      </Typography>
                    </Paper>
                  ))}
                </List>
              )}
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QueryDetails;
