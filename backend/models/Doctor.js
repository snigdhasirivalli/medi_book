const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    day: { type: String, required: true }, // e.g. "Monday"
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true },   // e.g. "09:30"
    isAvailable: { type: Boolean, default: true },
});

const doctorSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        specialty: { type: String, required: true },
        qualification: { type: String, default: 'MBBS' },
        experience: { type: Number, default: 0 }, // years
        hospital: { type: String, default: '' },
        location: { type: String, default: '' },
        consultationFee: { type: Number, default: 500 },
        rating: { type: Number, default: 4.0, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0 },
        symptomsHandled: [{ type: String }], // list of symptoms this doctor treats
        bio: { type: String, default: '' },
        availableSlots: [slotSchema],
        isVerified: { type: Boolean, default: true },
        languages: [{ type: String }],
    },
    { timestamps: true }
);

// Index for symptom-based search
doctorSchema.index({ symptomsHandled: 1, specialty: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
