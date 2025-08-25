import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import VideoConsultation from './pages/VideoConsultation';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Temporarily commented out auth routes
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> 
          */}
          <Route
            path="/"
            element={<Dashboard />}
          />
          <Route
            path="/appointments"
            element={<Appointments />}
          />
          <Route
            path="/consultation/:id"
            element={<VideoConsultation />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
