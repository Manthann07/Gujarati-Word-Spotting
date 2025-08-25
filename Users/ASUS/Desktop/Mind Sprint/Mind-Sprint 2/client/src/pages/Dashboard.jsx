import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  // Temporary mock user for development
  const user = {
    profile: {
      firstName: 'John',
      lastName: 'Doe'
    },
    role: 'patient'
  };

  useEffect(() => {
    // Mock appointments data for development
    const mockAppointments = [
      {
        _id: '1',
        dateTime: new Date(Date.now() + 86400000), // Tomorrow
        type: 'video',
        status: 'scheduled',
        doctor: {
          profile: {
            firstName: 'Sarah',
            lastName: 'Wilson',
            specialization: 'Cardiologist'
          }
        }
      },
      {
        _id: '2',
        dateTime: new Date(Date.now() + 172800000), // Day after tomorrow
        type: 'in-person',
        status: 'scheduled',
        doctor: {
          profile: {
            firstName: 'Michael',
            lastName: 'Brown',
            specialization: 'Neurologist'
          }
        }
      }
    ];
    setAppointments(mockAppointments);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.profile?.firstName}!
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {user?.role === 'patient' ? 'Manage your health journey' : 'Manage your consultations'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {user?.role === 'patient' && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/appointments')}
                  >
                    Book Consultation
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={() => navigate('/appointments')}
                >
                  View Appointments
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Appointments
              </Typography>
              {appointments.length > 0 ? (
                appointments.slice(0, 3).map((appointment) => (
                  <Box
                    key={appointment._id}
                    p={2}
                    mb={2}
                    bgcolor="background.paper"
                    borderRadius={1}
                    boxShadow={1}
                  >
                    <Typography variant="subtitle1">
                      {new Date(appointment.dateTime).toLocaleDateString()} at{' '}
                      {new Date(appointment.dateTime).toLocaleTimeString()}
                    </Typography>
                    <Typography color="textSecondary">
                      {user?.role === 'patient'
                        ? `Dr. ${appointment.doctor.profile.firstName} ${appointment.doctor.profile.lastName}`
                        : `Patient: ${appointment.patient.profile.firstName} ${appointment.patient.profile.lastName}`}
                    </Typography>
                    {appointment.type === 'video' && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => navigate(`/consultation/${appointment._id}`)}
                      >
                        Join Video Call
                      </Button>
                    )}
                  </Box>
                ))
              ) : (
                <Typography color="textSecondary">
                  No upcoming appointments
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Health Insights or Doctor Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {user?.role === 'patient' ? 'Health Insights' : 'Consultation Stats'}
              </Typography>
              {/* Add health insights or stats visualization here */}
              <Typography color="textSecondary">
                Coming soon...
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard;
