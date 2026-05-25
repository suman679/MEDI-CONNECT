const express = require('express');
const { getStats, approveDoctor, rejectDoctor, getAllUsers, toggleUserStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats',                  getStats);
router.get('/users',                  getAllUsers);
router.put('/users/:id/toggle',       toggleUserStatus);
router.put('/doctors/:id/approve',    approveDoctor);
router.put('/doctors/:id/reject',     rejectDoctor);

module.exports = router;
