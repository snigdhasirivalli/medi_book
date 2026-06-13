const express = require('express');
const router = express.Router();
const {
    bookAppointment,
    getMyAppointments,
    getDoctorAppointments,
    cancelAppointment,
    completeAppointment,
    getAllAppointments,
} = require('../controllers/appointmentController');
const { protect, adminOnly, doctorOnly } = require('../middleware/authMiddleware');

router.post('/', protect, bookAppointment);
router.get('/my', protect, getMyAppointments);
router.get('/doctor', protect, doctorOnly, getDoctorAppointments);
router.get('/all', protect, adminOnly, getAllAppointments);
router.put('/:id/cancel', protect, cancelAppointment);
router.put('/:id/complete', protect, doctorOnly, completeAppointment);

module.exports = router;
