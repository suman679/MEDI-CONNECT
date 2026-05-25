const express = require('express');
const { bookAppointment, getAppointments, getAppointment, updateStatus, addReview } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.post('/',                protect, authorize('patient'),        bookAppointment);
router.get('/',                 protect,                              getAppointments);
router.get('/:id',              protect,                              getAppointment);
router.put('/:id/status',       protect, authorize('doctor','admin'), updateStatus);
router.post('/:id/review',      protect, authorize('patient'),        addReview);

module.exports = router;
