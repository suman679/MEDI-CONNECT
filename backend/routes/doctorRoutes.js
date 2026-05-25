const express = require('express');
const { getDoctors, getDoctor, createDoctorProfile, updateDoctorProfile, getSpecializations, getDoctorAvailability, getDoctorStats } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/',                   getDoctors);
router.get('/specializations',    getSpecializations);
router.get('/stats',              protect, authorize('doctor'), getDoctorStats);
router.post('/profile',           protect, authorize('doctor'), createDoctorProfile);
router.put('/profile',            protect, authorize('doctor'), updateDoctorProfile);
router.get('/:id',                getDoctor);
router.get('/:id/availability',   getDoctorAvailability);

module.exports = router;
