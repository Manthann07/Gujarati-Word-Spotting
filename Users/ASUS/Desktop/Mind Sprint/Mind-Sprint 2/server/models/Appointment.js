const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'in-progress'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['video', 'audio', 'in-person'],
    required: true
  },
  symptoms: [String],
  diagnosis: String,
  prescription: [{
    medicine: String,
    dosage: String,
    duration: String,
    notes: String
  }],
  notes: String,
  attachments: [{
    name: String,
    url: String,
    type: String // lab-report, prescription, other
  }],
  followUp: {
    recommended: Boolean,
    date: Date
  },
  vitals: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    oxygenLevel: String
  },
  aiSummary: String,
  meetingLink: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
