const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',        required: true },
  doctor:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  type:  { type: String, enum: ['lab-report','imaging','prescription','vaccination','surgery','allergy','chronic-condition','other'], required: true },
  title:       { type: String, required: true },
  description: String,
  fileUrl:     String,
  fileType:    String,
  date:        { type: Date, default: Date.now },
  tags:        [String],
  isPrivate:   { type: Boolean, default: false },
}, { timestamps: true });

medicalRecordSchema.index({ patient: 1, date: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
