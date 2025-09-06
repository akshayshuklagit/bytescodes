const express = require('express');
const { body, validationResult } = require('express-validator');
const PatientDoctor = require('../models/PatientDoctor');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');

const router = express.Router();

// Assign doctor to patient
router.post('/', auth, [
  body('patientId').notEmpty().withMessage('Valid patient ID is required'),
  body('doctorId').notEmpty().withMessage('Valid doctor ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patientId, doctorId } = req.body;

    // Verify patient belongs to authenticated user
    const patient = await Patient.findOne({ 
      where: { id: patientId, userId: req.user.id }
    });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Verify doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if mapping already exists
    const existingMapping = await PatientDoctor.findOne({ 
      where: { patientId, doctorId }
    });
    if (existingMapping) {
      return res.status(400).json({ error: 'Doctor already assigned to this patient' });
    }

    const mapping = await PatientDoctor.create({ patientId, doctorId });

    res.status(201).json({ message: 'Doctor assigned successfully', mapping });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all mappings
router.get('/', auth, async (req, res) => {
  try {
    const mappings = await PatientDoctor.findAll({
      include: [
        {
          model: Patient,
          where: { userId: req.user.id },
          attributes: ['name', 'age', 'gender']
        },
        {
          model: Doctor,
          attributes: ['name', 'specialization', 'phone', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const filteredMappings = mappings;

    res.json(filteredMappings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctors for specific patient
router.get('/:patient_id', auth, async (req, res) => {
  try {
    // Verify patient belongs to authenticated user
    const patient = await Patient.findOne({ 
      where: { id: req.params.patient_id, userId: req.user.id }
    });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const mappings = await PatientDoctor.findAll({
      where: { patientId: req.params.patient_id },
      include: [{
        model: Doctor,
        attributes: ['name', 'specialization', 'phone', 'email', 'experience']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(mappings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove doctor from patient
router.delete('/:id', auth, async (req, res) => {
  try {
    const mapping = await PatientDoctor.findByPk(req.params.id, {
      include: [Patient]
    });
    
    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    // Check if patient belongs to authenticated user
    if (mapping.Patient.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await PatientDoctor.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Doctor removed from patient successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;