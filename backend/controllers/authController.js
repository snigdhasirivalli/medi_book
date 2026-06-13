const User = require('../models/User');
const Doctor = require('../models/Doctor');
const generateToken = require('../utils/generateToken');

// @desc Register new user
// @route POST /api/auth/register
const register = async (req, res) => {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const userRole = ['patient', 'doctor'].includes(role) ? role : 'patient';
    const user = await User.create({ name, email, password, role: userRole, phone });

    // If registering as doctor, create a basic doctor profile
    if (userRole === 'doctor') {
        await Doctor.create({
            user: user._id,
            specialty: req.body.specialty || 'General Physician',
            qualification: req.body.qualification || 'MBBS',
            hospital: req.body.hospital || '',
            location: req.body.location || '',
            symptomsHandled: req.body.symptomsHandled || [],
        });
    }

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
    });
};

// @desc Login user
// @route POST /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        if (user.isActive === false) {
            return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
};

// @desc Update user profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
    const { name, phone, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (password) user.password = password;

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        token: generateToken(updatedUser._id),
    });
};

module.exports = { register, login, getMe, updateProfile };
