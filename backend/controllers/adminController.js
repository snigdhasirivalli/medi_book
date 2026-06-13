const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc Get dashboard stats
// @route GET /api/admin/stats
const getStats = async (req, res) => {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    const upcomingAppointments = await Appointment.countDocuments({ status: 'upcoming' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    res.json({
        totalPatients,
        totalDoctors,
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
    });
};

// @desc Get all users
// @route GET /api/admin/users
const getUsers = async (req, res) => {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
};

// @desc Get all doctors with profiles
// @route GET /api/admin/doctors
const getAllDoctors = async (req, res) => {
    const doctors = await Doctor.find().populate('user', 'name email phone isActive').sort({ createdAt: -1 });
    res.json(doctors);
};

// @desc Toggle user status
// @route PUT /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
};

// @desc Seed sample doctors (for demo)
// @route POST /api/admin/seed
const seedDoctors = async (req, res) => {
    const User = require('../models/User');
    const Doctor = require('../models/Doctor');

    const sampleDoctors = [
        {
            name: 'Dr. Anita Desai', specialty: 'General Physician', qualification: 'MBBS, MD',
            experience: 12, hospital: 'Apollo Hospital', location: 'Bangalore',
            consultationFee: 500, rating: 4.8, reviewCount: 234,
            symptomsHandled: ['fever', 'cold', 'cough', 'headache', 'fatigue', 'body ache', 'sore throat'],
            bio: 'Experienced general physician with 12 years of practice.',
            availableSlots: [
                { day: 'Monday', startTime: '10:00', endTime: '10:30' },
                { day: 'Monday', startTime: '10:30', endTime: '11:00' },
                { day: 'Tuesday', startTime: '12:00', endTime: '12:30' },
                { day: 'Wednesday', startTime: '14:00', endTime: '14:30' },
            ],
            languages: ['English', 'Hindi', 'Kannada'],
        },
        {
            name: 'Dr. Rajesh Kumar', specialty: 'Cardiologist', qualification: 'MBBS, MD, DM Cardiology',
            experience: 18, hospital: 'Fortis Hospital', location: 'Mumbai',
            consultationFee: 1500, rating: 4.9, reviewCount: 412,
            symptomsHandled: ['chest pain', 'heart palpitations', 'shortness of breath', 'hypertension', 'dizziness'],
            bio: 'Senior cardiologist specializing in interventional cardiology.',
            availableSlots: [
                { day: 'Monday', startTime: '09:00', endTime: '09:30' },
                { day: 'Wednesday', startTime: '11:00', endTime: '11:30' },
                { day: 'Friday', startTime: '15:00', endTime: '15:30' },
            ],
            languages: ['English', 'Hindi'],
        },
        {
            name: 'Dr. Priya Sharma', specialty: 'Dermatologist', qualification: 'MBBS, MD Dermatology',
            experience: 8, hospital: 'Max Healthcare', location: 'Delhi',
            consultationFee: 800, rating: 4.7, reviewCount: 187,
            symptomsHandled: ['skin rash', 'acne', 'eczema', 'psoriasis', 'hair loss', 'itching', 'dry skin'],
            bio: 'Expert dermatologist with special interest in cosmetic and clinical dermatology.',
            availableSlots: [
                { day: 'Tuesday', startTime: '10:00', endTime: '10:30' },
                { day: 'Thursday', startTime: '14:00', endTime: '14:30' },
                { day: 'Saturday', startTime: '11:00', endTime: '11:30' },
            ],
            languages: ['English', 'Hindi', 'Punjabi'],
        },
        {
            name: 'Dr. Suresh Menon', specialty: 'Neurologist', qualification: 'MBBS, MD, DM Neurology',
            experience: 15, hospital: 'Manipal Hospital', location: 'Bangalore',
            consultationFee: 1200, rating: 4.8, reviewCount: 298,
            symptomsHandled: ['headache', 'migraine', 'seizures', 'memory loss', 'dizziness', 'tremors'],
            bio: 'Neurologist with expertise in epilepsy, stroke, and movement disorders.',
            availableSlots: [
                { day: 'Monday', startTime: '11:00', endTime: '11:30' },
                { day: 'Wednesday', startTime: '10:00', endTime: '10:30' },
                { day: 'Friday', startTime: '14:00', endTime: '14:30' },
            ],
            languages: ['English', 'Malayalam', 'Kannada'],
        },
        {
            name: 'Dr. Meera Patel', specialty: 'Gynecologist', qualification: 'MBBS, MS Obstetrics & Gynecology',
            experience: 14, hospital: 'Cloudnine Hospital', location: 'Pune',
            consultationFee: 900, rating: 4.9, reviewCount: 356,
            symptomsHandled: ['pregnancy', 'menstrual irregularities', 'PCOS', 'pelvic pain', 'fertility issues'],
            bio: 'Expert gynecologist and obstetrician with special interest in high-risk pregnancies.',
            availableSlots: [
                { day: 'Tuesday', startTime: '09:00', endTime: '09:30' },
                { day: 'Thursday', startTime: '12:00', endTime: '12:30' },
                { day: 'Saturday', startTime: '10:00', endTime: '10:30' },
            ],
            languages: ['English', 'Hindi', 'Gujarati', 'Marathi'],
        },
        {
            name: 'Dr. Arjun Nair', specialty: 'Orthopedic', qualification: 'MBBS, MS Orthopedic Surgery',
            experience: 10, hospital: 'KIMS Hospital', location: 'Hyderabad',
            consultationFee: 700, rating: 4.6, reviewCount: 143,
            symptomsHandled: ['joint pain', 'back pain', 'knee pain', 'fracture', 'sports injury', 'arthritis'],
            bio: 'Orthopedic surgeon specializing in joint replacement and sports medicine.',
            availableSlots: [
                { day: 'Monday', startTime: '13:00', endTime: '13:30' },
                { day: 'Wednesday', startTime: '16:00', endTime: '16:30' },
                { day: 'Friday', startTime: '09:00', endTime: '09:30' },
            ],
            languages: ['English', 'Malayalam', 'Telugu'],
        },
        {
            name: 'Dr. Kavya Reddy', specialty: 'Pediatrician', qualification: 'MBBS, MD Pediatrics',
            experience: 9, hospital: 'Rainbow Children Hospital', location: 'Hyderabad',
            consultationFee: 600, rating: 4.9, reviewCount: 521,
            symptomsHandled: ['child fever', 'vaccination', 'growth issues', 'asthma', 'cough in children', 'diarrhea'],
            bio: 'Passionate pediatrician dedicated to child health and development.',
            availableSlots: [
                { day: 'Monday', startTime: '09:00', endTime: '09:30' },
                { day: 'Tuesday', startTime: '11:00', endTime: '11:30' },
                { day: 'Thursday', startTime: '15:00', endTime: '15:30' },
                { day: 'Saturday', startTime: '09:00', endTime: '09:30' },
            ],
            languages: ['English', 'Telugu', 'Hindi'],
        },
        {
            name: 'Dr. Vikram Singh', specialty: 'Gastroenterologist', qualification: 'MBBS, MD, DM Gastroenterology',
            experience: 13, hospital: 'Medanta Hospital', location: 'Gurugram',
            consultationFee: 1100, rating: 4.7, reviewCount: 204,
            symptomsHandled: ['stomach pain', 'acidity', 'gastritis', 'IBS', 'liver disease', 'diarrhea', 'constipation'],
            bio: 'Gastroenterologist with expertise in advanced endoscopic procedures.',
            availableSlots: [
                { day: 'Tuesday', startTime: '10:00', endTime: '10:30' },
                { day: 'Thursday', startTime: '14:00', endTime: '14:30' },
                { day: 'Saturday', startTime: '12:00', endTime: '12:30' },
            ],
            languages: ['English', 'Hindi', 'Punjabi'],
        },
    ];

    try {
        // Clear existing seeded doctors
        const existingUsers = await User.find({ role: 'doctor' });
        if (existingUsers.length > 0) {
            return res.json({ message: 'Doctors already seeded', count: existingUsers.length });
        }

        for (const d of sampleDoctors) {
            const email = d.name.toLowerCase().replace('dr.', '').trim().replace(/\s+/g, '.') + '@medibook.com';
            const user = await User.create({
                name: d.name,
                email,
                password: 'Doctor@123',
                role: 'doctor',
            });
            await Doctor.create({
                user: user._id,
                specialty: d.specialty,
                qualification: d.qualification,
                experience: d.experience,
                hospital: d.hospital,
                location: d.location,
                consultationFee: d.consultationFee,
                rating: d.rating,
                reviewCount: d.reviewCount,
                symptomsHandled: d.symptomsHandled,
                bio: d.bio,
                availableSlots: d.availableSlots,
                languages: d.languages,
            });
        }

        // Create admin user
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            await User.create({
                name: 'Admin',
                email: 'admin@medibook.com',
                password: 'Admin@123',
                role: 'admin',
            });
        }

        res.json({ message: `Seeded ${sampleDoctors.length} doctors and admin user` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getStats, getUsers, getAllDoctors, toggleUserStatus, seedDoctors };
