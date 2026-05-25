const express = require('express');
const { createPrescription, getPrescriptions, getPrescription } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.post('/',     protect, authorize('doctor'), createPrescription);
router.get('/',      protect,                      getPrescriptions);
router.get('/:id',   protect,                      getPrescription);

module.exports = router;
