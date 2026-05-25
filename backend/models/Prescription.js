const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',        required: true },
  doctor:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',      required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  prescriptionId: { type: String, unique: true },
  diagnosis:   { type: String, required: true },
  medicines: [{
    name:         { type: String, required: true },
    dosage:       String,
    frequency:    String,
    duration:     String,
    instructions: String,
  }],
  labTests:    [String],
  notes:       String,
  followUpDate: Date,
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

prescriptionSchema.pre('save', function(next) {
  if (!this.prescriptionId) {
    this.prescriptionId = 'RX-' + Date.now().toString(36).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
