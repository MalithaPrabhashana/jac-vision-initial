import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Button, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DeveloperProps {
  themeMode: 'light' | 'dark';
}

interface SystemInfo {
  timestamp: string;
  cpu_usage_percent: number;
  cpu_usage_label: string;
  memory_total_gb: number;
  memory_used_gb: number;
  memory_remaining_gb: number;
  memory_percent: number;
  disk_total_gb: number;
  disk_used_gb: number;
  disk_remaining_gb: number;
  disk_percent: number;
}

interface MetricHistory {
  timestamp: string;
  cpu_usage_percent: number;
  memory_percent: number;
  disk_percent: number;
}

const Developer: React.FC<DeveloperProps> = ({ themeMode }) => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [history, setHistory] = useState<MetricHistory[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchSystemInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/system-info');
      const data: SystemInfo = response.data;
      setSystemInfo(data);

      // Add to history (keep last 60 entries, roughly 1 hour if refreshing every minute)
      setHistory((prev) => {
        const newEntry = {
          timestamp: new Date(data.timestamp).toLocaleTimeString(),
          cpu_usage_percent: data.cpu_usage_percent,
          memory_percent: data.memory_percent,
          disk_percent: data.disk_percent,
        };
        const updatedHistory = [...prev, newEntry].slice(-60);
        return updatedHistory;
      });
    } catch (err: any) {
      setError('Error fetching system info. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSystemInfo();

    // Set up auto-refresh every 60 seconds if enabled
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(fetchSystemInfo, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newViewMode: 'current' | 'history') => {
    if (newViewMode) {
      setViewMode(newViewMode);
    }
  };

  const handleRefreshToggle = () => {
    setAutoRefresh((prev) => !prev);
  };

  return (
    <div className={`content-section ${themeMode}`}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: { xs: 'center', sm: 'left' } }}>
        System Metrics Dashboard
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="current">Current Metrics</ToggleButton>
          <ToggleButton value="history">Historical Trends</ToggleButton>
        </ToggleButtonGroup>

        <Box>
          <Button
            variant="contained"
            onClick={fetchSystemInfo}
            disabled={loading}
            sx={{
              mr: 2,
              backgroundColor: '#3B82F6',
              '&:hover': { backgroundColor: '#2563EB' },
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Refresh Now'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleRefreshToggle}
            sx={{
              borderColor: autoRefresh ? '#10B981' : '#EF4444',
              color: autoRefresh ? '#10B981' : '#EF4444',
              '&:hover': {
                borderColor: autoRefresh ? '#059669' : '#DC2626',
                color: autoRefresh ? '#059669' : '#DC2626',
              },
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
        </Box>
      </Box>

      {error ? (
        <Typography variant="body1" color="error" sx={{ mb: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      ) : (
        <>
          {viewMode === 'current' ? (
            <Box>
              {systemInfo ? (
                <Box>
                  {/* CPU Usage */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#E2E8F0' : '#000000', mb: 1 }}>
                      CPU Usage
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={systemInfo.cpu_usage_percent}
                        sx={{
                          flexGrow: 1,
                          mr: 2,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: themeMode === 'dark' ? '#4B5563' : '#D1D5DB',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: systemInfo.cpu_usage_percent > 80 ? '#EF4444' : '#3B82F6',
                          },
                        }}
                      />
                      <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#E2E8F0' : '#000000' }}>
                        {systemInfo.cpu_usage_label}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#A5B4FC' : '#4B5563' }}>
                      Raw Value: {systemInfo.cpu_usage_percent.toFixed(2)}%
                    </Typography>
                  </Box>

                  {/* Memory Usage */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#E2E8F0' : '#000000', mb: 1 }}>
                      Memory Usage
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={systemInfo.memory_percent}
                        sx={{
                          flexGrow: 1,
                          mr: 2,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: themeMode === 'dark' ? '#4B5563' : '#D1D5DB',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: systemInfo.memory_percent > 80 ? '#EF4444' : '#3B82F6',
                          },
                        }}
                      />
                      <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#E2E8F0' : '#000000' }}>
                        {systemInfo.memory_percent.toFixed(2)}%
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#A5B4FC' : '#4B5563' }}>
                      Used: {systemInfo.memory_used_gb.toFixed(2)} GB / Total: {systemInfo.memory_total_gb.toFixed(2)} GB
                    </Typography>
                    <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#A5B4FC' : '#4B5563' }}>
                      Remaining: {systemInfo.memory_remaining_gb.toFixed(2)} GB
                    </Typography>
                  </Box>

                  {/* Disk Usage */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#E2E8F0' : '#000000', mb: 1 }}>
                      Disk Usage
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={systemInfo.disk_percent}
                        sx={{
                          flexGrow: 1,
                          mr: 2,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: themeMode === 'dark' ? '#4B5563' : '#D1D5DB',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: systemInfo.disk_percent > 80 ? '#EF4444' : '#3B82F6',
                          },
                        }}
                      />
                      <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#E2E8F0' : '#000000' }}>
                        {systemInfo.disk_percent.toFixed(2)}%
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#A5B4FC' : '#4B5563' }}>
                      Used: {systemInfo.disk_used_gb.toFixed(2)} GB / Total: {systemInfo.disk_total_gb.toFixed(2)} GB
                    </Typography>
                    <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#A5B4FC' : '#4B5563' }}>
                      Remaining: {systemInfo.disk_remaining_gb.toFixed(2)} GB
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#9CA3AF' : '#6B7280', mt: 2 }}>
                    Last Updated: {systemInfo.timestamp}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#E2E8F0' : '#000000', textAlign: 'center' }}>
                  No data available. Please refresh to fetch system metrics.
                </Typography>
              )}
            </Box>
          ) : (
            <Box>
              {history.length > 0 ? (
                <Box>
                  {/* CPU Usage Trend */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#E2E8F0' : '#000000', mb: 2 }}>
                      CPU Usage Over Time
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke={themeMode === 'dark' ? '#4B5563' : '#D1D5DB'} />
                        <XAxis dataKey="timestamp" stroke={themeMode === 'dark' ? '#E2E8F0' : '#000000'} />
                        <YAxis stroke={themeMode === 'dark' ? '#E2E8F0' : '#000000'} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: themeMode === 'dark' ? '#2D3748' : '#FFFFFF', borderColor: themeMode === 'dark' ? '#4B5563' : '#D1D5DB' }}
                          labelStyle={{ color: themeMode === 'dark' ? '#E2E8F0' : '#000000' }}
                          itemStyle={{ color: themeMode === 'dark' ? '#A5B4FC' : '#4B5563' }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="cpu_usage_percent"
                          name="CPU Usage (%)"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>

                  {/* Memory Usage Trend */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#E2E8F0' : '#000000', mb: 2 }}>
                      Memory Usage Over Time
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke={themeMode === 'dark' ? '#4B5563' : '#D1D5DB'} />
                        <XAxis dataKey="timestamp" stroke={themeMode === 'dark' ? '#E2E8F0' : '#000000'} />
                        <YAxis stroke={themeMode === 'dark' ? '#E2E8F0' : '#000000'} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: themeMode === 'dark' ? '#2D3748' : '#FFFFFF', borderColor: themeMode === 'dark' ? '#4B5563' : '#D1D5DB' }}
                          labelStyle={{ color: themeMode === 'dark' ? '#E2E8F0' : '#000000' }}
                          itemStyle={{ color: themeMode === 'dark' ? '#A5B4FC' : '#4B5563' }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="memory_percent"
                          name="Memory Usage (%)"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>

                  {/* Disk Usage Trend */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#E2E8F0' : '#000000', mb: 2 }}>
                      Disk Usage Over Time
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke={themeMode === 'dark' ? '#4B5563' : '#D1D5DB'} />
                        <XAxis dataKey="timestamp" stroke={themeMode === 'dark' ? '#E2E8F0' : '#000000'} />
                        <YAxis stroke={themeMode === 'dark' ? '#E2E8F0' : '#000000'} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: themeMode === 'dark' ? '#2D3748' : '#FFFFFF', borderColor: themeMode === 'dark' ? '#4B5563' : '#D1D5DB' }}
                          labelStyle={{ color: themeMode === 'dark' ? '#E2E8F0' : '#000000' }}
                          itemStyle={{ color: themeMode === 'dark' ? '#A5B4FC' : '#4B5563' }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="disk_percent"
                          name="Disk Usage (%)"
                          stroke="#ff7300"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#E2E8F0' : '#000000', textAlign: 'center' }}>
                  No historical data available. Please wait for more data points.
                </Typography>
              )}
            </Box>
          )}
        </>
      )}
    </div>
  );
};

export default Developer;