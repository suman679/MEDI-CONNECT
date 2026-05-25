const express = require('express');
const { register, login, getMe, updateProfile, updatePassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register',        register);
router.post('/login',           login);
router.get('/me',               protect, getMe);
router.put('/updateprofile',    protect, updateProfile);
router.put('/updatepassword',   protect, updatePassword);
router.post('/logout',          protect, logout);

module.exports = router;
