const express = require('express');
const router = express.Router();
const {
  createReport,
  checkReportStatus,
  getItemReports,
  getAllReports,
  deleteReport,
} = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createReport).get(protect, admin, getAllReports);
router.get('/item/:itemId/status', protect, checkReportStatus);
router.get('/item/:itemId', protect, getItemReports);
router.delete('/:id', protect, admin, deleteReport);

module.exports = router;
