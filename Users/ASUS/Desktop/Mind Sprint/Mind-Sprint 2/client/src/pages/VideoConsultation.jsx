import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  Send,
} from '@mui/icons-material';
import { io } from 'socket.io-client';

const VideoConsultation = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize Socket.IO
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Fetch appointment details
    fetchAppointment();

    // Initialize WebRTC
    setupMediaDevices();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [id]);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setAppointment(data);
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
    }
  };

  const setupMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      const messageData = {
        text: newMessage,
        timestamp: new Date(),
        sender: 'user', // Replace with actual user ID
      };
      socket.emit('consultation-message', {
        appointmentId: id,
        message: messageData,
      });
      setMessages([...messages, messageData]);
      setNewMessage('');
    }
  };

  return (
    <Grid container spacing={2} sx={{ height: '100vh', p: 2 }}>
      {/* Video Area */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Box sx={{ height: '70%', bgcolor: 'black', mb: 2 }}>
            {localStream && (
              <video
                autoPlay
                playsInline
                muted
                ref={video => {
                  if (video) video.srcObject = localStream;
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </Box>
          <Box sx={{ height: '30%', bgcolor: 'black' }}>
            {remoteStream && (
              <video
                autoPlay
                playsInline
                ref={video => {
                  if (video) video.srcObject = remoteStream;
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <IconButton onClick={toggleMute}>
              {isMuted ? <MicOff /> : <Mic />}
            </IconButton>
            <IconButton onClick={toggleVideo}>
              {isVideoOff ? <VideocamOff /> : <Videocam />}
            </IconButton>
            <Button variant="contained" color="error">
              End Call
            </Button>
          </Box>
        </Paper>
      </Grid>

      {/* Chat Area */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Chat
          </Typography>
          <List sx={{ flexGrow: 1, overflow: 'auto' }}>
            {messages.map((message, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={message.text}
                  secondary={new Date(message.timestamp).toLocaleTimeString()}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
            />
            <IconButton onClick={sendMessage} color="primary">
              <Send />
            </IconButton>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default VideoConsultation;
