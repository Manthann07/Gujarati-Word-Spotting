const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: String,
    specialization: String, // For doctors
    license: String, // For doctors
    address: String,
    city: String,
    country: String,
  },
  healthData: {
    bloodGroup: String,
    allergies: [String],
    chronicConditions: [String],
    medications: [{
      name: String,
      dosage: String,
      frequency: String
    }]
  },
  deviceData: {
    fitbitToken: String,
    appleHealthToken: String,
  },
  emergencyContacts: [{
    name: String,
    relationship: String,
    phoneNumber: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
