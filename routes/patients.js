const express = require('express');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');

const router = express.Router();

// Add patient
router.post('/', auth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('age').isInt({ min: 1 }).withMessage('Valid age is required'),
  body('gender').notEmpty().withMessage('Gender is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const patient = await Patient.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({ message: 'Patient created successfully', patient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all patients for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const patients = await Patient.findAll({ 
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get patient by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update patient
router.put('/:id', auth, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('age').optional().isInt({ min: 1 }).withMessage('Valid age is required'),
  body('gender').optional().notEmpty().withMessage('Gender cannot be empty'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const [updatedRows] = await Patient.update(req.body, {
      where: { id: req.params.id, userId: req.user.id },
      returning: true
    });

    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patient = await Patient.findOne({ 
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ message: 'Patient updated successfully', patient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete patient
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedRows = await Patient.destroy({ 
      where: { id: req.params.id, userId: req.user.id }
    });

    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;