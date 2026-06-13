const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// Generate match reason text for explainability
const generateMatchReason = (doctor, symptoms) => {
    if (!symptoms || symptoms.length === 0) return '';
    const matched = symptoms.filter((s) =>
        doctor.symptomsHandled.some((ds) => ds.toLowerCase().includes(s.toLowerCase()))
    );
    if (matched.length === 0) {
        return `Dr. ${doctor.user?.name || 'Doctor'} specializes in ${doctor.specialty}, which may help with your symptoms.`;
    }
    return `Dr. ${doctor.user?.name || 'Doctor'} has experience treating: ${matched.join(', ')}. Specialty: ${doctor.specialty}.`;
};

// @desc Book appointment
// @route POST /api/appointments
const bookAppointment = async (req, res) => {
    const { doctorId, date, startTime, endTime, symptoms, notes } = req.body;

    if (!doctorId || !date || !startTime || !endTime) {
        return res.status(400).json({ message: 'Please provide doctor, date, and time' });
    }

    // Check for duplicate appointment
    const existing = await Appointment.findOne({
        doctor: doctorId,
        date,
        startTime,
        status: { $ne: 'cancelled' },
    });
    if (existing) return res.status(400).json({ message: 'This slot is already booked' });

    const doctor = await Doctor.findById(doctorId).populate('user', 'name');

    const matchScore = doctor
        ? (symptoms && symptoms.length > 0)
            ? Math.round(
                (symptoms.filter((s) =>
                    doctor.symptomsHandled.some((ds) => ds.toLowerCase().includes(s.toLowerCase()))
                ).length /
                    symptoms.length) *
                100
            )
            : 0
        : 0;

    const matchReason = doctor ? generateMatchReason(doctor, symptoms) : '';

    const appointment = await Appointment.create({
        patient: req.user._id,
        doctor: doctorId,
        date,
        startTime,
        endTime,
        symptoms: symptoms || [],
        notes: notes || '',
        matchScore,
        matchReason,
    });

    const populated = await appointment.populate([
        { path: 'doctor', populate: { path: 'user', select: 'name email' } },
        { path: 'patient', select: 'name email' },
    ]);

    res.status(201).json(populated);
};

// @desc Get my appointments (patient)
// @route GET /api/appointments/my
const getMyAppointments = async (req, res) => {
    const appointments = await Appointment.find({ patient: req.user._id })
        .populate({ path: 'doctor', populate: { path: 'user', select: 'name email avatar' } })
        .sort({ date: -1 });
    res.json(appointments);
};

// @desc Get doctor's appointments
// @route GET /api/appointments/doctor
const getDoctorAppointments = async (req, res) => {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    const appointments = await Appointment.find({ doctor: doctor._id })
        .populate('patient', 'name email phone')
        .sort({ date: -1 });
    res.json(appointments);
};

// @desc Cancel appointment
// @route PUT /api/appointments/:id/cancel
const cancelAppointment = async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patient.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }
    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled', appointment });
};

// @desc Mark appointment as completed
// @route PUT /api/appointments/:id/complete
const completeAppointment = async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    appointment.status = 'completed';
    await appointment.save();
    res.json({ message: 'Appointment completed', appointment });
};

// @desc Get all appointments (admin)
// @route GET /api/appointments/all
const getAllAppointments = async (req, res) => {
    const appointments = await Appointment.find()
        .populate('patient', 'name email')
        .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
        .sort({ createdAt: -1 });
    res.json(appointments);
};

module.exports = {
    bookAppointment,
    getMyAppointments,
    getDoctorAppointments,
    cancelAppointment,
    completeAppointment,
    getAllAppointments,
};
