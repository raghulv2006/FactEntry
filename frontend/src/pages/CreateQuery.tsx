import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface DuplicateQueryDto {
  id: number;
  queryNumber: string;
  subject: string;
  status: string;
  createdAt: string;
  similarityScore: number;
}

const CreateQuery: React.FC = () => {
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [sourceLink, setSourceLink] = useState('');
  const [question, setQuestion] = useState('');
  
  // Critical urgency flag
  const [criticalFlag, setCriticalFlag] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Duplicate warning states
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateQueryDto[]>([]);


  const checkDuplicates = async (): Promise<DuplicateQueryDto[]> => {
    try {
      const res = await axios.post(`${API_URL}/queries/duplicate-check`, {
        subject,
        question,
        sourceLink
      });
      return res.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const handleSubmitAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Call duplicate check API first
    const similarQueries = await checkDuplicates();
    
    // Filter duplicates with a score threshold (e.g., > 0.15 similarity)
    const matches = similarQueries.filter(q => q.similarityScore > 0.15);

    if (matches.length > 0) {
      setDuplicates(matches);
      setShowDuplicateDialog(true);
      setLoading(false);
    } else {
      // No duplicate matching - proceed directly to creation
      submitQuery();
    }
  };

  const submitQuery = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/queries`, {
        subject,
        question,
        sourceLink,
        flags: [],
        criticalFlag
      });
      
      navigate('/queries');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit case inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 4.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '0.01em', mb: 0.5 }}>
            Raise New Operational Query
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Submit structured bond discrepancies or security reference questions to our experts.
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 1.5,
              bgcolor: 'rgba(255, 77, 109, 0.1)',
              color: '#FF4D6D',
              border: '1px solid rgba(255, 77, 109, 0.2)'
            }}
          >
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 4.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <form onSubmit={handleSubmitAttempt}>
            <Grid container spacing={3.5}>
              {/* Subject */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Case Subject / Title"
                  placeholder="Brief summary of the discrepancy (e.g. Missing financials for Q3 XYZ)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
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
                  slotProps={{
                    inputLabel: { style: { fontSize: '0.85rem', color: 'text.secondary' } }
                  }}
                />
              </Grid>

              {/* Source Link */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Reference URL / Source Link"
                  placeholder="Include reference web link if applicable"
                  value={sourceLink}
                  onChange={(e) => setSourceLink(e.target.value)}
                  sx={{
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
              </Grid>

              {/* Question Details */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Inquiry / Question Details"
                  placeholder="Describe details, mismatched fields, calculations, or missing items in full details..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
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
                  slotProps={{
                    inputLabel: { style: { fontSize: '0.85rem', color: 'text.secondary' } }
                  }}
                />
              </Grid>

              {/* Critical Urgency Flag */}
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={criticalFlag}
                      onChange={(e) => setCriticalFlag(e.target.checked)}
                      color="error"
                      size="small"
                      sx={{ color: 'text.secondary', '&.Mui-checked': { color: '#FF4D6D' } }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary' }}>
                      Critical Urgency Flag
                    </Typography>
                  }
                />
              </Grid>

              {/* Action buttons */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/queries')}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 1.5,
                      fontWeight: 800,
                      fontSize: '0.785rem',
                      py: 1,
                      px: 3,
                      color: 'text.secondary',
                      borderColor: 'divider',
                      '&:hover': {
                        color: 'text.primary',
                        borderColor: 'text.secondary',
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    Cancel Case
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    className="glow-btn-cyan"
                    sx={{ px: 4, py: 1, fontSize: '0.785rem', letterSpacing: '0.04em', borderRadius: 1.5 }}
                  >
                    Submit Operational Query
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Duplicate Warning Dialog */}
        <Dialog
          open={showDuplicateDialog}
          onClose={() => setShowDuplicateDialog(false)}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 1.5,
                maxWidth: 520,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper !important',
                backgroundImage: 'none',
                boxShadow: (theme) => theme.palette.mode === 'dark' 
                  ? '0 12px 40px rgba(0,0,0,0.6)' 
                  : '0 12px 40px rgba(45,31,102,0.06)'
              }
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 900, color: '#FFB020', fontSize: '1.1rem', letterSpacing: '0.01em' }}>
            <WarningIcon sx={{ color: '#FFB020' }} /> Duplicate Inquiries Detected
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3.5, lineHeight: 1.5 }}>
              Our natural language matching system found highly similar queries already logged. Please check the entries below before submitting to verify if they solve your question.
            </Typography>

            <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {duplicates.map((dup) => (
                <ListItem
                  key={dup.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    p: 2,
                    bgcolor: 'background.default',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#00E5C3', fontSize: 11 }}>
                          {dup.queryNumber}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 800, fontSize: 9.5 }}>
                          Score: {Math.round(dup.similarityScore * 100)}% Match
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" noWrap sx={{ color: 'text.primary', fontWeight: 600, fontSize: 12, mb: 0.5 }}>
                          {dup.subject}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', fontSize: 9.5, color: 'text.secondary' }}>
                          Status: <span style={{ color: '#39A7FF', fontWeight: 700 }}>{dup.status}</span> • Raised: {new Date(dup.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/queries/${dup.id}`)}
                    sx={{
                      textTransform: 'none',
                      minWidth: 80,
                      borderRadius: 1.5,
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#00E5C3',
                      borderColor: 'rgba(0, 229, 195, 0.3)',
                      '&:hover': {
                        borderColor: '#00E5C3',
                        bgcolor: 'rgba(0, 229, 195, 0.03)'
                      }
                    }}
                  >
                    View Case
                  </Button>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              onClick={() => setShowDuplicateDialog(false)}
              sx={{ textTransform: 'none', fontWeight: 800, color: 'text.secondary', '&:hover': { color: 'text.primary' }, fontSize: 11 }}
            >
              Go Back & Edit
            </Button>
            <Button
              onClick={() => {
                setShowDuplicateDialog(false);
                submitQuery();
              }}
              variant="contained"
              color="warning"
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                fontSize: 11,
                borderRadius: 1.5,
                bgcolor: '#FFB020',
                color: '#070B14',
                '&:hover': { bgcolor: '#FFA000' }
              }}
            >
              Submit Anyway
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};

export default CreateQuery;
