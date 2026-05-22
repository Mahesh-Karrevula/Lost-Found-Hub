const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  resolveItem,
  deleteItem,
  getReportedItems,
  getTotalItems,
} = require('../controllers/itemController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getItems).post(protect, createItem);
router.get('/reported', protect, admin, getReportedItems);
router.get('/count', protect, admin, getTotalItems);
router.route('/:id').get(getItemById).delete(protect, deleteItem);
router.put('/:id/resolve', protect, resolveItem);

module.exports = router;
