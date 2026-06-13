const Doctor = require('../models/Doctor');

// Symptom -> Specialty mapping for smart recommendations
const symptomSpecialtyMap = {
    fever: ['General Physician', 'Internal Medicine'],
    cough: ['General Physician', 'Pulmonologist', 'ENT'],
    cold: ['General Physician', 'ENT'],
    headache: ['General Physician', 'Neurologist'],
    migraine: ['Neurologist'],
    chest_pain: ['Cardiologist', 'General Physician'],
    heart: ['Cardiologist'],
    palpitations: ['Cardiologist'],
    skin_rash: ['Dermatologist'],
    acne: ['Dermatologist'],
    eczema: ['Dermatologist'],
    joint_pain: ['Orthopedic', 'Rheumatologist'],
    back_pain: ['Orthopedic', 'Physiotherapist'],
    fracture: ['Orthopedic'],
    stomach_pain: ['Gastroenterologist', 'General Physician'],
    acidity: ['Gastroenterologist', 'General Physician'],
    diarrhea: ['Gastroenterologist', 'General Physician'],
    eye_pain: ['Ophthalmologist'],
    vision: ['Ophthalmologist'],
    ear_pain: ['ENT'],
    throat: ['ENT', 'General Physician'],
    diabetes: ['Endocrinologist', 'General Physician'],
    thyroid: ['Endocrinologist'],
    anxiety: ['Psychiatrist', 'Psychologist'],
    depression: ['Psychiatrist', 'Psychologist'],
    pregnancy: ['Gynecologist', 'Obstetrics'],
    periods: ['Gynecologist'],
    child_fever: ['Pediatrician'],
    child: ['Pediatrician'],
    urine: ['Urologist', 'Nephrologist'],
    kidney: ['Nephrologist', 'Urologist'],
    allergy: ['Allergist', 'General Physician'],
    dental: ['Dentist'],
    tooth: ['Dentist'],
};

// Calculate symptom match score
const computeMatchScore = (doctor, symptoms) => {
    if (!symptoms || symptoms.length === 0) return 0;
    const doctorSymptoms = (doctor.symptomsHandled || []).map((s) => s.toLowerCase());
    let matched = 0;
    symptoms.forEach((s) => {
        if (doctorSymptoms.includes(s.toLowerCase())) matched++;
    });
    return Math.round((matched / symptoms.length) * 100);
};

// Get suggested specialties from symptoms
const getSuggestedSpecialties = (symptoms) => {
    const specialties = new Set();
    symptoms.forEach((sym) => {
        const key = sym.toLowerCase().replace(/\s+/g, '_');
        if (symptomSpecialtyMap[key]) {
            symptomSpecialtyMap[key].forEach((sp) => specialties.add(sp));
        }
        // Partial match
        Object.keys(symptomSpecialtyMap).forEach((k) => {
            if (key.includes(k) || k.includes(key)) {
                symptomSpecialtyMap[k].forEach((sp) => specialties.add(sp));
            }
        });
    });
    return [...specialties];
};

// @desc Get all doctors with optional symptom/specialty filter
// @route GET /api/doctors
const getDoctors = async (req, res) => {
    const { symptoms, specialty, search, location } = req.query;

    let query = { isVerified: true };
    let suggestedSpecialties = [];

    if (symptoms) {
        const symptomList = symptoms
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        suggestedSpecialties = getSuggestedSpecialties(symptomList);

        if (suggestedSpecialties.length > 0) {
            query.$or = [
                { specialty: { $in: suggestedSpecialties.map((sp) => new RegExp(sp, 'i')) } },
                { symptomsHandled: { $in: symptomList.map((s) => new RegExp(s, 'i')) } },
            ];
        } else {
            query.symptomsHandled = { $in: symptomList.map((s) => new RegExp(s, 'i')) };
        }
    }

    if (specialty) {
        query.specialty = { $regex: specialty, $options: 'i' };
    }

    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }

    let doctors = await Doctor.find(query).populate('user', 'name email avatar').sort({ rating: -1 });

    if (search) {
        doctors = doctors.filter(
            (d) =>
                d.user.name.toLowerCase().includes(search.toLowerCase()) ||
                d.specialty.toLowerCase().includes(search.toLowerCase())
        );
    }

    // Add match score if symptoms provided
    if (symptoms) {
        const symptomList = symptoms
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        doctors = doctors
            .map((doc) => ({
                ...doc.toObject(),
                matchScore: computeMatchScore(doc, symptomList),
                suggestedSpecialties,
            }))
            .sort((a, b) => b.matchScore - a.matchScore || b.rating - a.rating);
    }

    res.json({ doctors, suggestedSpecialties });
};

// @desc Get single doctor with explainability
// @route GET /api/doctors/:id
const getDoctorById = async (req, res) => {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email avatar phone');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
};

// @desc Get symptom->specialty suggestions
// @route GET /api/doctors/symptom-map
const getSymptomMap = async (req, res) => {
    res.json(symptomSpecialtyMap);
};

// @desc Create doctor profile (admin)
// @route POST /api/doctors
const createDoctor = async (req, res) => {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
};

// @desc Update doctor profile
// @route PUT /api/doctors/:id
const updateDoctor = async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Verify ownership or admin role
    if (req.user.role !== 'admin' && doctor.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this doctor profile' });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedDoctor);
};

// @desc Get my doctor profile
// @route GET /api/doctors/me
const getMyDoctorProfile = async (req, res) => {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email avatar');
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(doctor);
};

module.exports = {
    getDoctors,
    getDoctorById,
    getSymptomMap,
    createDoctor,
    updateDoctor,
    getMyDoctorProfile,
};
