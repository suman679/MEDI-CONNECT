const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: true },
  licenseNumber:  { type: String, required: true, unique: true },
  experience:     { type: Number, required: true, default: 0 },
  consultationFee:{ type: Number, required: true, default: 500 },
  qualifications: [{ degree: String, institution: String, year: Number }],
  bio:            String,
  languages:      [String],
  hospital:       String,
  rating:         { type: Number, default: 0, min: 0, max: 5 },
  totalReviews:   { type: Number, default: 0 },
  totalConsultations: { type: Number, default: 0 },
  slotDuration:   { type: Number, default: 30, enum: [15,20,30,45,60] },
  availability: {
    monday:    { available: { type: Boolean, default: true  }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '17:00' } },
    tuesday:   { available: { type: Boolean, default: true  }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '17:00' } },
    wednesday: { available: { type: Boolean, default: true  }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '17:00' } },
    thursday:  { available: { type: Boolean, default: true  }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '17:00' } },
    friday:    { available: { type: Boolean, default: true  }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '17:00' } },
    saturday:  { available: { type: Boolean, default: true  }, startTime: { type: String, default: '10:00' }, endTime: { type: String, default: '14:00' } },
    sunday:    { available: { type: Boolean, default: false }, startTime: { type: String, default: '00:00' }, endTime: { type: String, default: '00:00' } },
  },
  isApproved:      { type: Boolean, default: true },
  isAvailableNow:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
