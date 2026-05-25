const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  doctor:   { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date:     { type: Date, required: true },
  timeSlot: { start: { type: String, required: true }, end: { type: String, required: true } },
  type:     { type: String, enum: ['video','in-person','chat'], default: 'video' },
  status:   { type: String, enum: ['pending','confirmed','in-progress','completed','cancelled','no-show'], default: 'pending' },
  symptoms: String,
  notes:    String,
  fee:      { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending','paid','refunded'], default: 'pending' },
  roomId:   String,
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  rating:   { score: { type: Number, min:1, max:5 }, review: String, createdAt: Date },
  cancelledBy: { type: String, enum: ['patient','doctor','admin'] },
  cancellationReason: String,
}, { timestamps: true });

// Generate a readable appointment ID
appointmentSchema.pre('save', function(next) {
  if (!this.appointmentId) {
    this.appointmentId = 'APT-' + Date.now().toString(36).toUpperCase();
  }
  next();
});
appointmentSchema.add({ appointmentId: { type: String, unique: true, sparse: true } });

appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: -1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
