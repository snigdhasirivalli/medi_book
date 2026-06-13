const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
        date: { type: String, required: true },    // e.g. "2026-02-27"
        startTime: { type: String, required: true }, // e.g. "10:00"
        endTime: { type: String, required: true },
        symptoms: [{ type: String }],
        notes: { type: String, default: '' },
        status: {
            type: String,
            enum: ['upcoming', 'completed', 'cancelled'],
            default: 'upcoming',
        },
        matchScore: { type: Number, default: 0 }, // how well doctor matches symptoms
        matchReason: { type: String, default: '' }, // explainability field
    },
    { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
