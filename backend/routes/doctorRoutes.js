const express = require('express');
const router = express.Router();
const {
    getDoctors,
    getDoctorById,
    getSymptomMap,
    createDoctor,
    updateDoctor,
    getMyDoctorProfile,
} = require('../controllers/doctorController');
const { protect, adminOnly, doctorOnly } = require('../middleware/authMiddleware');

router.get('/', getDoctors);
router.get('/symptom-map', getSymptomMap);
router.get('/me', protect, doctorOnly, getMyDoctorProfile);
router.get('/:id', getDoctorById);
router.post('/', protect, adminOnly, createDoctor);
router.put('/:id', protect, doctorOnly, updateDoctor);

module.exports = router;
