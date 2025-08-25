# HealthXCare - Digital Healthcare Platform

HealthXCare is a comprehensive digital healthcare platform that connects patients, doctors, and healthcare providers through secure teleconsultations, AI-driven insights, and location-aware services.

## Features

### Core Features (MVP)

- 🔐 User Authentication & Profiles
  - Role-based access (patients, doctors, admins)
  - Secure login with encrypted credentials

- 📹 Video/Audio Consultation
  - Real-time virtual visits via WebRTC
  - Chat functionality during consultations

- 📅 Appointment Scheduling
  - Calendar view
  - Booking and rescheduling
  - Appointment reminders

- 📝 E-Health Records Dashboard
  - Upload/view medical reports
  - Digital prescriptions
  - Medical history tracking

### Advanced Features

- 🌍 Google Maps Integration
  - Find nearby clinics & pharmacies
  - Emergency navigation
  - Live location sharing

- 🔊 Multi-Language Support
  - Local-language consultations
  - Live translation during calls

- 💳 Digital Payments
  - Secure payment processing
  - Insurance integration

## Tech Stack

### Frontend
- React + Vite
- Material-UI
- React Router
- Socket.IO Client
- WebRTC
- Google Maps API

### Backend
- Node.js
- Express
- MongoDB
- Socket.IO
- JWT Authentication
- WebRTC Signaling

## Getting Started

### Prerequisites
- Node.js v14+
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
\`\`\`

2. Install backend dependencies:
\`\`\`bash
cd server
npm install
\`\`\`

3. Install frontend dependencies:
\`\`\`bash
cd client
npm install
\`\`\`

4. Create a .env file in the server directory with the following variables:
\`\`\`
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthxcare
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_API_KEY=your_twilio_api_key
TWILIO_API_SECRET=your_twilio_api_secret
\`\`\`

### Running the Application

1. Start the backend server:
\`\`\`bash
cd server
npm start
\`\`\`

2. Start the frontend development server:
\`\`\`bash
cd client
npm run dev
\`\`\`

The application will be available at http://localhost:5173

## Evaluation Criteria

- UI/UX Design & Visual Appeal (30%)
- Server / Backend Functionality (30%)
- Real-life Use Cases & Problem Solving (20%)
- Overall Experience & Usability (20%)

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
