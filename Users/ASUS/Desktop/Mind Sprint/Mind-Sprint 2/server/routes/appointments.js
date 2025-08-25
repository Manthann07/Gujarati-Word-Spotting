const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const Appointment = require('../models/Appointment');

// Get appointments (filtered by role)
router.get('/', auth, async (req, res) => {
  try {
    let appointments;
    if (req.user.role === 'patient') {
      appointments = await Appointment.find({ patient: req.user._id })
        .populate('doctor', 'profile.firstName profile.lastName profile.specialization');
    } else if (req.user.role === 'doctor') {
      appointments = await Appointment.find({ doctor: req.user._id })
        .populate('patient', 'profile.firstName profile.lastName');
    } else {
      appointments = await Appointment.find()
        .populate('patient', 'profile.firstName profile.lastName')
        .populate('doctor', 'profile.firstName profile.lastName profile.specialization');
    }
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create appointment
router.post('/', auth, checkRole(['patient']), async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      patient: req.user._id,
      status: 'scheduled'
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update appointment
router.patch('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user has permission to update
    if (
      req.user.role !== 'admin' &&
      appointment.patient.toString() !== req.user._id.toString() &&
      appointment.doctor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update appointment
    Object.assign(appointment, req.body);
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user has permission to cancel
    if (
      req.user.role !== 'admin' &&
      appointment.patient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
