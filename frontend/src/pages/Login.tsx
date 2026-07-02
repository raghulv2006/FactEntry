import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particles array
    const particleCount = 80;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 0.5,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const isLightTheme = document.body.classList.contains('light-theme');

      // Deep dark space space color or clean light gray
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        200,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      if (isLightTheme) {
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.6, '#F8FAFC');
        gradient.addColorStop(1, '#E2E8F0');
      } else {
        gradient.addColorStop(0, '#100c24');
        gradient.addColorStop(0.6, '#070B14');
        gradient.addColorStop(1, '#020408');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Subtle connected lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.12;
            ctx.strokeStyle = isLightTheme ? `rgba(45, 31, 102, ${alpha * 1.5})` : `rgba(0, 229, 195, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isLightTheme ? 'rgba(45, 31, 102, 0.2)' : 'rgba(0, 229, 195, 0.25)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Background canvas particle network */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          px: 2
        }}
      >
        <Container maxWidth="xs">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Box
              className="glass-panel"
              sx={{
                p: 4.5,
                borderRadius: 2.5,
                boxShadow: (theme) => theme.palette.mode === 'dark' 
                  ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                  : '0 8px 32px rgba(45, 31, 102, 0.08)',
                border: '1px solid !important',
                borderColor: 'divider !important',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* FactEntry Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3.5, justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    bgcolor: '#00E5C3',
                    borderRadius: '50%',
                    boxShadow: '0 0 10px #00E5C3'
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    color: 'text.primary',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    fontSize: '1.25rem'
                  }}
                >
                  FactEntry
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, textAlign: 'center' }}>
                INTELLIGENCE PORTAL ACCESS
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center', fontSize: '0.75rem' }}>
                Authorized Personnel Only. Session Activities Monitored & Audited.
              </Typography>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    bgcolor: 'rgba(255, 77, 109, 0.1)',
                    color: '#FF4D6D',
                    border: '1px solid rgba(255, 77, 109, 0.2)'
                  }}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Analyst Email Address"
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
                    inputLabel: { style: { fontSize: '0.8rem', color: 'text.secondary' } }
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Security Password"
                  type="password"
                  variant="outlined"
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      fontSize: '0.8rem',
                      '& fieldset': { borderColor: 'divider' },
                      '&:hover fieldset': { borderColor: 'secondary.main' },
                      '&.Mui-focused fieldset': { borderColor: 'secondary.main' }
                    }
                  }}
                  slotProps={{
                    inputLabel: { style: { fontSize: '0.8rem', color: 'text.secondary' } }
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  className="glow-btn-cyan"
                  sx={{
                    py: 1.25,
                    fontSize: '0.785rem',
                    letterSpacing: '0.08em',
                    borderRadius: 1.5,
                    boxShadow: '0 0 10px rgba(0, 229, 195, 0.25)'
                  }}
                >
                  {loading ? <CircularProgress size={16} sx={{ color: 'background.default' }} /> : 'Authenticate Credentials'}
                </Button>
              </form>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                  SECURED SSL ENCRYPTION
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                  REFID: FE-SYS-93X
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Login;
