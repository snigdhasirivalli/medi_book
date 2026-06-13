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

const seedData = async () => {
    try {
        // Clear any stale/incorrect doctors starting with a dot
        const badUsers = await User.find({ email: /^\./ });
        if (badUsers.length > 0) {
            console.log('🧹 Clearing stale dot-prefixed doctor accounts...');
            const badUserIds = badUsers.map((u) => u._id);
            await Doctor.deleteMany({ user: { $in: badUserIds } });
            await User.deleteMany({ _id: { $in: badUserIds } });
        }

        const existingUsers = await User.find({ role: 'doctor' });
        if (existingUsers.length > 0) {
            console.log('Database already has seeded doctors');
            return;
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

        console.log(`✅ Seeded ${sampleDoctors.length} doctors and admin user`);
    } catch (err) {
        console.error(`❌ Seeding error: ${err.message}`);
    }
};

module.exports = { seedData };
