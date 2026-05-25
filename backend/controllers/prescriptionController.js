const Prescription = require('../models/Prescription');
const Appointment  = require('../models/Appointment');
const Doctor       = require('../models/Doctor');
const Notification = require('../models/Notification');

// POST /api/prescriptions
exports.createPrescription = async (req, res, next) => {
  try {
    const { appointmentId, diagnosis, medicines, labTests, notes, followUpDate } = req.body;
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(404).json({ success:false, message:'Doctor profile not found' });

    const appt = await Appointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ success:false, message:'Appointment not found' });
    if (appt.doctor.toString()!==doctor._id.toString()) return res.status(403).json({ success:false, message:'Not authorized' });

    const rx = await Prescription.create({ appointment:appointmentId, patient:appt.patient, doctor:doctor._id, diagnosis, medicines, labTests:labTests||[], notes, followUpDate });

    appt.prescription = rx._id;
    await appt.save();

    await Notification.create({ user:appt.patient, type:'prescription_ready', title:'Prescription Ready', message:'Your prescription is ready. Download it from the Prescriptions section.', data:{ prescriptionId:rx._id } });

    res.status(201).json({ success:true, data:rx });
  } catch (err) { next(err); }
};

// GET /api/prescriptions
exports.getPrescriptions = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role==='patient') {
      query.patient = req.user.id;
    } else if (req.user.role==='doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) return res.status(404).json({ success:false, message:'Doctor profile not found' });
      query.doctor = doctor._id;
    }
    const data = await Prescription.find(query)
      .populate({ path:'doctor', populate:{ path:'user', select:'name avatar' } })
      .populate('patient','name email avatar dateOfBirth gender')
      .populate('appointment','date timeSlot')
      .sort({ createdAt:-1 });
    res.json({ success:true, count:data.length, data });
  } catch (err) { next(err); }
};

// GET /api/prescriptions/:id
exports.getPrescription = async (req, res, next) => {
  try {
    const rx = await Prescription.findById(req.params.id)
      .populate({ path:'doctor', populate:{ path:'user', select:'name email avatar' } })
      .populate('patient','name email avatar dateOfBirth gender address')
      .populate('appointment','date timeSlot type');
    if (!rx) return res.status(404).json({ success:false, message:'Prescription not found' });

    const doctorDoc = await Doctor.findOne({ user: req.user.id });
    const ok = req.user.role==='admin'
      || rx.patient._id.toString()===req.user.id
      || (doctorDoc && rx.doctor._id.toString()===doctorDoc._id.toString());
    if (!ok) return res.status(403).json({ success:false, message:'Not authorized' });

    res.json({ success:true, data:rx });
  } catch (err) { next(err); }
};
