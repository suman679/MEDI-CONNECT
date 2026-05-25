const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['patient','doctor','admin'], default: 'patient' },
  phone:    { type: String },
  avatar:   { type: String, default: '' },
  dateOfBirth: Date,
  gender:   { type: String, enum: ['male','female','other'] },
  bloodGroup: String,
  address: { street: String, city: String, state: String, zipCode: String, country: String },
  isActive:   { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  lastLogin:  Date,
  resetPasswordToken:  String,
  resetPasswordExpire: Date,
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
