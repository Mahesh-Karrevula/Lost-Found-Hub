const express = require('express');
const router = express.Router();
const {
  submitSpamReport,
  getAllSpamReports,
  updateSpamStatus,
  getSpamCounts,
} = require('../controllers/spamController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, submitSpamReport);
router.get('/', protect, admin, getAllSpamReports);
router.get('/counts', protect, admin, getSpamCounts);
router.put('/:id', protect, admin, updateSpamStatus);

module.exports = router;
