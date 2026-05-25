const Appointment  = require('../models/Appointment');
const Doctor       = require('../models/Doctor');
const Notification = require('../models/Notification');

// POST /api/appointments
exports.bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, timeSlot, type, symptoms } = req.body;
    const doctor = await Doctor.findById(doctorId).populate('user','_id name');
    if (!doctor)            return res.status(404).json({ success:false, message:'Doctor not found' });
    if (!doctor.isApproved) return res.status(400).json({ success:false, message:'Doctor is not available' });

    // Slot clash check
    const clash = await Appointment.findOne({ doctor:doctorId, date:new Date(date), 'timeSlot.start':timeSlot.start, status:{ $in:['pending','confirmed'] } });
    if (clash) return res.status(400).json({ success:false, message:'This time slot is already booked' });

    const roomId = type==='video' ? `room-${Date.now().toString(36)}` : undefined;
    const appt = await Appointment.create({ patient:req.user.id, doctor:doctorId, date:new Date(date), timeSlot, type:type||'video', symptoms, fee:doctor.consultationFee, roomId });

    await Promise.all([
      Notification.create({ user:doctor.user._id, type:'appointment_booked', title:'New Appointment Booked', message:`New ${type||'video'} appointment on ${new Date(date).toDateString()} at ${timeSlot.start}.`, data:{ appointmentId:appt._id } }),
      Notification.create({ user:req.user.id,      type:'appointment_booked', title:'Appointment Booked',     message:`Appointment with ${doctor.user.name} on ${new Date(date).toDateString()} at ${timeSlot.start}.`, data:{ appointmentId:appt._id } }),
    ]);

    const populated = await Appointment.findById(appt._id)
      .populate({ path:'doctor', populate:{ path:'user', select:'name email avatar' } })
      .populate('patient','name email');
    res.status(201).json({ success:true, data:populated });
  } catch (err) { next(err); }
};

// GET /api/appointments
exports.getAppointments = async (req, res, next) => {
  try {
    const { status, upcoming, page=1, limit=20 } = req.query;
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) return res.status(404).json({ success:false, message:'Doctor profile not found' });
      query.doctor = doctor._id;
    }
    // admin sees all

    if (status) query.status = status;
    if (upcoming === 'true') { query.date = { $gte: new Date() }; if (!status) query.status = { $in:['pending','confirmed'] }; }

    const total = await Appointment.countDocuments(query);
    const data  = await Appointment.find(query)
      .populate({ path:'doctor', populate:{ path:'user', select:'name avatar' } })
      .populate('patient','name email avatar')
      .sort({ date:1, 'timeSlot.start':1 })
      .skip((parseInt(page)-1)*parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success:true, count:data.length, total, data });
  } catch (err) { next(err); }
};

// GET /api/appointments/:id
exports.getAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate({ path:'doctor', populate:{ path:'user', select:'name email avatar phone' } })
      .populate('patient','name email avatar phone dateOfBirth gender')
      .populate('prescription');
    if (!appt) return res.status(404).json({ success:false, message:'Appointment not found' });

    const doctorDoc = await Doctor.findOne({ user: req.user.id });
    const ok = req.user.role==='admin'
      || appt.patient._id.toString()===req.user.id
      || (doctorDoc && appt.doctor._id.toString()===doctorDoc._id.toString());
    if (!ok) return res.status(403).json({ success:false, message:'Not authorized' });

    res.json({ success:true, data:appt });
  } catch (err) { next(err); }
};

// PUT /api/appointments/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const appt = await Appointment.findById(req.params.id)
      .populate({ path:'doctor', populate:{ path:'user', select:'_id name' } })
      .populate('patient','_id name');
    if (!appt) return res.status(404).json({ success:false, message:'Appointment not found' });

    const valid = { pending:['confirmed','cancelled'], confirmed:['in-progress','cancelled','no-show'], 'in-progress':['completed'] };
    if (valid[appt.status] && !valid[appt.status].includes(status))
      return res.status(400).json({ success:false, message:`Cannot transition from '${appt.status}' to '${status}'` });

    appt.status = status;
    if (cancellationReason) { appt.cancellationReason = cancellationReason; appt.cancelledBy = req.user.role; }
    await appt.save();

    if (status==='completed') await Doctor.findByIdAndUpdate(appt.doctor._id, { $inc:{ totalConsultations:1 } });

    const notifMap = { confirmed:'appointment_confirmed', cancelled:'appointment_cancelled' };
    if (notifMap[status]) {
      await Promise.all([
        Notification.create({ user:appt.patient._id, type:notifMap[status], title:`Appointment ${status}`, message:`Your appointment has been ${status}.` }),
        Notification.create({ user:appt.doctor.user._id, type:notifMap[status], title:`Appointment ${status}`, message:`An appointment was ${status}.` }),
      ]);
    }

    res.json({ success:true, data:appt });
  } catch (err) { next(err); }
};

// POST /api/appointments/:id/review
exports.addReview = async (req, res, next) => {
  try {
    const { score, review } = req.body;
    const appt = await Appointment.findById(req.params.id);
    if (!appt)                                         return res.status(404).json({ success:false, message:'Appointment not found' });
    if (appt.patient.toString()!==req.user.id)         return res.status(403).json({ success:false, message:'Not authorized' });
    if (appt.status!=='completed')                     return res.status(400).json({ success:false, message:'Can only review completed appointments' });
    if (appt.rating?.score)                            return res.status(400).json({ success:false, message:'Already reviewed' });

    appt.rating = { score, review, createdAt: new Date() };
    await appt.save();

    // Recalculate doctor rating
    const reviewed = await Appointment.find({ doctor:appt.doctor, 'rating.score':{ $exists:true } });
    const avg = reviewed.reduce((s,a) => s+a.rating.score, 0) / reviewed.length;
    await Doctor.findByIdAndUpdate(appt.doctor, { rating:Math.round(avg*10)/10, totalReviews:reviewed.length });

    res.json({ success:true, data:appt });
  } catch (err) { next(err); }
};
