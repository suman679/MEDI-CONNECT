const User         = require('../models/User');
const Doctor       = require('../models/Doctor');
const Appointment  = require('../models/Appointment');
const Notification = require('../models/Notification');

exports.getStats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const [totalPatients, totalDoctors, totalAppointments, pendingDoctors, todayAppts, completedToday] = await Promise.all([
      User.countDocuments({ role:'patient' }),
      Doctor.countDocuments({ isApproved:true }),
      Appointment.countDocuments(),
      Doctor.countDocuments({ isApproved:false }),
      Appointment.countDocuments({ date:{ $gte:today, $lt:tomorrow } }),
      Appointment.countDocuments({ date:{ $gte:today, $lt:tomorrow }, status:'completed' }),
    ]);
    res.json({ success:true, data:{ totalPatients, totalDoctors, totalAppointments, pendingDoctors, todayAppts, completedToday } });
  } catch (err) { next(err); }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page=1, limit=30 } = req.query;
    const query = role ? { role } : {};
    const total = await User.countDocuments(query);
    const data  = await User.find(query).select('-password').sort({ createdAt:-1 }).skip((parseInt(page)-1)*parseInt(limit)).limit(parseInt(limit));
    res.json({ success:true, count:data.length, total, data });
  } catch (err) { next(err); }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success:false, message:'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave:false });
    res.json({ success:true, message:`User ${user.isActive?'activated':'deactivated'}` });
  } catch (err) { next(err); }
};

exports.approveDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isApproved:true }, { new:true }).populate('user','name email _id');
    if (!doctor) return res.status(404).json({ success:false, message:'Doctor not found' });
    await Notification.create({ user:doctor.user._id, type:'doctor_approved', title:'Profile Approved!', message:'Your doctor profile has been approved. You can now receive appointments.' });
    res.json({ success:true, message:'Doctor approved', data:doctor });
  } catch (err) { next(err); }
};

exports.rejectDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isApproved:false }, { new:true }).populate('user','name _id');
    if (!doctor) return res.status(404).json({ success:false, message:'Doctor not found' });
    await Notification.create({ user:doctor.user._id, type:'system', title:'Profile Under Review', message:'Your doctor profile requires additional review. Please contact support.' });
    res.json({ success:true, message:'Doctor application updated' });
  } catch (err) { next(err); }
};
