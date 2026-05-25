const express    = require('express');
const { protect } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const Doctor        = require('../models/Doctor');
const router = express.Router();

// GET /api/records
router.get('/', protect, async (req, res, next) => {
  try {
    const { type, page=1, limit=30 } = req.query;
    const query = {};
    if (req.user.role === 'patient') query.patient = req.user.id;
    else if (req.user.role === 'doctor') {
      const doc = await Doctor.findOne({ user: req.user.id });
      if (doc) query.doctor = doc._id;
    }
    if (type) query.type = type;
    const total = await MedicalRecord.countDocuments(query);
    const data  = await MedicalRecord.find(query)
      .populate({ path:'doctor', populate:{ path:'user', select:'name' } })
      .sort({ date:-1 })
      .skip((parseInt(page)-1)*parseInt(limit))
      .limit(parseInt(limit));
    res.json({ success:true, count:data.length, total, data });
  } catch (err) { next(err); }
});

// POST /api/records
router.post('/', protect, async (req, res, next) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : req.body.patientId;
    const record = await MedicalRecord.create({ ...req.body, patient: patientId });
    res.status(201).json({ success:true, data:record });
  } catch (err) { next(err); }
});

// GET /api/records/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate({ path:'doctor', populate:{ path:'user', select:'name' } });
    if (!record) return res.status(404).json({ success:false, message:'Record not found' });
    if (record.patient.toString()!==req.user.id && req.user.role!=='doctor' && req.user.role!=='admin')
      return res.status(403).json({ success:false, message:'Not authorized' });
    res.json({ success:true, data:record });
  } catch (err) { next(err); }
});

// DELETE /api/records/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success:false, message:'Record not found' });
    if (record.patient.toString()!==req.user.id && req.user.role!=='admin')
      return res.status(403).json({ success:false, message:'Not authorized' });
    await record.deleteOne();
    res.json({ success:true, message:'Record deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
