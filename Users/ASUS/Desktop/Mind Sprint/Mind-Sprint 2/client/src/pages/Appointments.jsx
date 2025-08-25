import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [openBooking, setOpenBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Temporary mock user for development
  const user = {
    profile: {
      firstName: 'John',
      lastName: 'Doe'
    },
    role: 'patient'
  };
  const [bookingData, setBookingData] = useState({
    doctor: '',
    type: 'video',
    symptoms: '',
  });

  useEffect(() => {
    // Mock appointments data
    const mockAppointments = [
      {
        _id: '1',
        dateTime: new Date(Date.now() + 86400000),
        type: 'video',
        status: 'scheduled',
        doctor: {
          profile: {
            firstName: 'Sarah',
            lastName: 'Wilson',
            specialization: 'Cardiologist'
          }
        },
        symptoms: 'Regular checkup'
      },
      {
        _id: '2',
        dateTime: new Date(Date.now() + 172800000),
        type: 'in-person',
        status: 'scheduled',
        doctor: {
          profile: {
            firstName: 'Michael',
            lastName: 'Brown',
            specialization: 'Neurologist'
          }
        },
        symptoms: 'Follow-up consultation'
      }
    ];
    setAppointments(mockAppointments);

    // Mock doctors data
    const mockDoctors = [
      {
        _id: '1',
        profile: {
          firstName: 'Sarah',
          lastName: 'Wilson',
          specialization: 'Cardiologist'
        }
      },
      {
        _id: '2',
        profile: {
          firstName: 'Michael',
          lastName: 'Brown',
          specialization: 'Neurologist'
        }
      },
      {
        _id: '3',
        profile: {
          firstName: 'Emily',
          lastName: 'Davis',
          specialization: 'Pediatrician'
        }
      }
    ];
    setDoctors(mockDoctors);
  }, []);

  const handleBookingChange = (field) => (event) => {
    setBookingData({
      ...bookingData,
      [field]: event.target.value,
    });
  };

  const handleBookAppointment = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...bookingData,
          dateTime: selectedDate,
        }),
      });

      if (response.ok) {
        setOpenBooking(false);
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'primary',
      completed: 'success',
      cancelled: 'error',
      'in-progress': 'warning',
    };
    return colors[status] || 'default';
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Appointments</Typography>
        {user?.role === 'patient' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenBooking(true)}
          >
            Book Appointment
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {appointments.map((appointment) => (
          <Grid item xs={12} md={6} key={appointment._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    {new Date(appointment.dateTime).toLocaleDateString()}
                  </Typography>
                  <Chip
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                  />
                </Box>
                <Typography variant="body1" gutterBottom>
                  Time: {new Date(appointment.dateTime).toLocaleTimeString()}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user?.role === 'patient'
                    ? `Doctor: Dr. ${appointment.doctor.profile.firstName} ${appointment.doctor.profile.lastName}`
                    : `Patient: ${appointment.patient.profile.firstName} ${appointment.patient.profile.lastName}`}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Type: {appointment.type}
                </Typography>
                {appointment.symptoms && (
                  <Typography variant="body2" color="textSecondary">
                    Symptoms: {appointment.symptoms}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openBooking} onClose={() => setOpenBooking(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Book Appointment</DialogTitle>
        <DialogContent>
          <Box my={2}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Doctor</InputLabel>
              <Select
                value={bookingData.doctor}
                onChange={handleBookingChange('doctor')}
                label="Doctor"
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor._id} value={doctor._id}>
                    Dr. {doctor.profile.firstName} {doctor.profile.lastName} -{' '}
                    {doctor.profile.specialization}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Appointment Date & Time"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
              />
            </LocalizationProvider>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Consultation Type</InputLabel>
              <Select
                value={bookingData.type}
                onChange={handleBookingChange('type')}
                label="Consultation Type"
              >
                <MenuItem value="video">Video Call</MenuItem>
                <MenuItem value="audio">Audio Call</MenuItem>
                <MenuItem value="in-person">In-Person</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Symptoms & Notes"
              value={bookingData.symptoms}
              onChange={handleBookingChange('symptoms')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBooking(false)}>Cancel</Button>
          <Button onClick={handleBookAppointment} variant="contained" color="primary">
            Book Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Appointments;
