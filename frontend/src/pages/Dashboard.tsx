import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Grid,
  Card,
  Typography,
  Box,
  CircularProgress,
  Paper,
  ButtonBase,
  useTheme
} from '@mui/material';
import {
  Assignment as TotalIcon,
  FolderOpen as OpenIcon,
  CheckCircleOutlined as ResolvedIcon,
  Warning as CriticalIcon,
  Loop as InProgressIcon,
  School as TrainingIcon
} from '@mui/icons-material';

import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface QueryData {
  id: number;
  status: string;
  criticalFlag: boolean;
  assignedSme: { name: string; email: string } | null;
  createdBy: { name: string } | null;
  flags: string[];
  dateRaised: string;
}

const MotionCard = motion(Card);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState<QueryData[]>([]);
  const theme = useTheme();

  const isDark = theme.palette.mode === 'dark';
  const textSecondaryColor = theme.palette.text.secondary;
  const dividerColor = theme.palette.divider;

  useEffect(() => {
    axios.get(`${API_URL}/queries?size=1000`)
      .then(res => {
        setQueries(res.data.content || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
        <CircularProgress size={30} sx={{ color: '#00E5C3' }} />
      </Box>
    );
  }

  // Aggregate stats
  const total = queries.length;
  const open = queries.filter(q => q.status === 'OPEN').length;
  const inProgress = queries.filter(q => q.status === 'IN_PROGRESS').length;
  const resolved = queries.filter(q => q.status === 'RESOLVED').length;
  const closed = queries.filter(q => q.status === 'CLOSED').length;
  const critical = queries.filter(q => q.criticalFlag).length;
  const trainingRequired = queries.filter(q => q.flags && q.flags.includes('TRAINING_REQUIRED')).length;

  // SME Workload Aggregation
  const smeWorkload: { [key: string]: number } = {};
  queries.forEach(q => {
    if (q.assignedSme) {
      smeWorkload[q.assignedSme.name] = (smeWorkload[q.assignedSme.name] || 0) + 1;
    } else {
      smeWorkload['Unassigned'] = (smeWorkload['Unassigned'] || 0) + 1;
    }
  });

  // Date-based volume aggregation (last 7 days query count)
  const dateCounts: { [key: string]: number } = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dateCounts[d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })] = 0;
  }
  queries.forEach(q => {
    const dateStr = new Date(q.dateRaised).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (dateCounts[dateStr] !== undefined) {
      dateCounts[dateStr]++;
    }
  });

  // Chart Data: Status (FactEntry Workstation Theme)
  const statusChartData = {
    labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
    datasets: [
      {
        data: [open, inProgress, resolved, closed],
        backgroundColor: [
          'rgba(57, 167, 255, 0.85)',  // Blue Glow
          'rgba(255, 176, 32, 0.85)',  // Orange Glow
          'rgba(0, 208, 132, 0.85)',   // Green Glow
          isDark ? 'rgba(170, 178, 200, 0.3)' : 'rgba(71, 85, 105, 0.3)'  // Gray
        ],
        hoverBackgroundColor: [
          '#39A7FF',
          '#FFB020',
          '#00D084',
          isDark ? '#AAB2C8' : '#475569'
        ],
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        borderWidth: 1,
      },
    ],
  };

  // Chart Data: SME Workload
  const smeChartData = {
    labels: Object.keys(smeWorkload),
    datasets: [
      {
        label: 'Active Queries Count',
        data: Object.values(smeWorkload),
        backgroundColor: isDark ? 'rgba(75, 45, 155, 0.75)' : 'rgba(45, 31, 102, 0.75)', // Purple
        hoverBackgroundColor: '#00E5C3', // Accent Cyan
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // Chart Data: Volume Trend
  const trendChartData = {
    labels: Object.keys(dateCounts),
    datasets: [
      {
        label: 'New Queries Raised',
        data: Object.values(dateCounts),
        fill: true,
        backgroundColor: isDark ? 'rgba(0, 229, 195, 0.06)' : 'rgba(0, 229, 195, 0.12)', // Subtle Cyan opacity
        borderColor: '#00E5C3', // Cyan
        borderWidth: 2.5,
        tension: 0.3,
        pointBackgroundColor: '#00E5C3',
        pointHoverBackgroundColor: '#FFFFFF',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const kpis = [
    {
      title: 'Total Queries',
      value: total,
      icon: <TotalIcon sx={{ fontSize: 18 }} />,
      color: '#39A7FF',
      trend: 'Database Records',
      path: '/queries'
    },
    {
      title: 'Open Queries',
      value: open,
      icon: <OpenIcon sx={{ fontSize: 18 }} />,
      color: '#39A7FF',
      trend: 'Awaiting SME Triage',
      path: '/queries?status=OPEN'
    },
    {
      title: 'In Progress',
      value: inProgress,
      icon: <InProgressIcon sx={{ fontSize: 18 }} />,
      color: '#FFB020',
      trend: 'Under Active Review',
      path: '/queries?status=IN_PROGRESS'
    },
    {
      title: 'Resolved',
      value: resolved,
      icon: <ResolvedIcon sx={{ fontSize: 18 }} />,
      color: '#00D084',
      trend: 'SME Proposed Solution',
      path: '/queries?status=RESOLVED'
    },
    {
      title: 'Critical Queries',
      value: critical,
      icon: <CriticalIcon sx={{ fontSize: 18 }} />,
      color: '#FF4D6D',
      trend: 'High Priority SLA Alert',
      path: '/queries?critical=true'
    },
    {
      title: 'Training Required',
      value: trainingRequired,
      icon: <TrainingIcon sx={{ fontSize: 18 }} />,
      color: '#FFB020',
      trend: 'Documentation Flags',
      path: '/queries?flag=TRAINING_REQUIRED'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '0.01em', color: 'text.primary', mb: 0.5 }}>
          Operations & Intelligence Desk
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Analyst Session: <strong>{user?.name}</strong> • Node connection state initialized on in-memory storage.
        </Typography>
      </Box>

      {/* KPI Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <Grid container spacing={2} sx={{ mb: 4.5 }}>
          {kpis.map((kpi, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={idx}>
              <motion.div variants={cardVariants}>
                <MotionCard
                  whileHover={{
                    y: -4,
                    borderColor: isDark ? 'rgba(0, 229, 195, 0.35)' : 'rgba(45, 31, 102, 0.35)',
                    boxShadow: isDark ? '0 8px 30px rgba(0, 229, 195, 0.08)' : '0 8px 30px rgba(45, 31, 102, 0.06)'
                  }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  sx={{
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <ButtonBase
                    onClick={() => navigate(kpi.path)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      textAlign: 'left',
                      p: 2.25
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>
                        {kpi.title}
                      </Typography>
                      <Box sx={{ color: kpi.color, display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                        {kpi.icon}
                      </Box>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mb: 0.75, letterSpacing: '-0.02em', fontSize: '1.65rem' }}>
                      {kpi.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 9.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      {kpi.trend}
                    </Typography>
                  </ButtonBase>
                </MotionCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Graphical Insights */}
      <Grid container spacing={3}>
        {/* Status Donut */}
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.primary' }}>
                Query Distribution Status
              </Typography>
              <Box sx={{ height: 240, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Doughnut
                  data={statusChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          boxWidth: 8,
                          padding: 18,
                          color: textSecondaryColor,
                          font: { family: 'Inter', size: 10, weight: 700 }
                        }
                      }
                    },
                    cutout: '72%',
                    animation: { duration: 800 }
                  }}
                />
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Volume Trend Line */}
        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.primary' }}>
                Data Intake Volume (7D Timeline)
              </Typography>
              <Box sx={{ height: 240 }}>
                <Line
                  data={trendChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: textSecondaryColor, font: { family: 'Inter', size: 9, weight: 600 } },
                        grid: { color: dividerColor }
                      },
                      x: {
                        ticks: { color: textSecondaryColor, font: { family: 'Inter', size: 9, weight: 600 } },
                        grid: { display: false }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* SME Resource Workload */}
        <Grid size={{ xs: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.primary' }}>
                Subject Matter Expert Workloads
              </Typography>
              <Box sx={{ height: 220 }}>
                <Bar
                  data={smeChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: textSecondaryColor, font: { family: 'Inter', size: 9, weight: 600 } },
                        grid: { color: dividerColor }
                      },
                      x: {
                        ticks: { color: textSecondaryColor, font: { family: 'Inter', size: 9, weight: 600 } },
                        grid: { display: false }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
