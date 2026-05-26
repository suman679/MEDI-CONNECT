const express = require('express');
const rateLimit = require('express-rate-limit');

const {
  bookAppointment,
  getAppointments,
  getAppointment,
  updateStatus,
  addReview
} = require('../controllers/appointmentController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();


// Booking Rate Limiter
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many booking attempts. Please try again later.'
  }
});


// BOOK APPOINTMENT
router.post(
  '/',
  bookingLimiter,
  protect,
  authorize('patient'),
  bookAppointment
);


// GET ALL APPOINTMENTS
router.get(
  '/',
  protect,
  authorize('patient','doctor','admin'),
  getAppointments
);


// GET SINGLE APPOINTMENT
router.get(
  '/:id',
  protect,
  authorize('patient','doctor','admin'),
  getAppointment
);


// UPDATE STATUS
router.put(
  '/:id/status',
  protect,
  authorize('doctor','admin'),
  updateStatus
);


// ADD REVIEW
router.post(
  '/:id/review',
  protect,
  authorize('patient'),
  addReview
);

module.exports = router;