const Report = require('../models/Report');
const Item = require('../models/Item');
const User = require('../models/User');

// @desc    Create a new report for an item
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const { item_id, reason } = req.body;

    if (!item_id || !reason) {
      return res.status(400).json({ message: 'item_id and reason are required' });
    }

    const itemIdNum = Number(item_id);
    const userId = req.user.id;

    // Check if user has already reported this item
    const alreadyReported = await Report.findOne({ item_id: itemIdNum, reporter_id: userId });
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this item' });
    }

    // Check if item exists
    const item = await Item.findOne({ id: itemIdNum });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const report = new Report({
      item_id: itemIdNum,
      reporter_id: userId,
      reason,
    });

    await report.save();

    // Mark the item as reported
    item.reported = 1;
    await item.save();

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Check if current user has reported this item
// @route   GET /api/reports/item/:itemId/status
// @access  Private
const checkReportStatus = async (req, res) => {
  try {
    const itemIdNum = Number(req.params.itemId);
    const count = await Report.countDocuments({ item_id: itemIdNum, reporter_id: req.user.id });
    res.json({ reported: count > 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get all reports for an item
// @route   GET /api/reports/item/:itemId
// @access  Private
const getItemReports = async (req, res) => {
  try {
    const itemIdNum = Number(req.params.itemId);
    const reports = await Report.find({ item_id: itemIdNum }).sort({ created_at: -1 });

    const results = [];
    for (const r of reports) {
      const user = await User.findOne({ id: r.reporter_id });
      results.push({
        ...r.toObject(),
        reporter_name: user ? user.username : 'Unknown',
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get all reports (Admin only)
// @route   GET /api/reports
// @access  Private/Admin
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ created_at: -1 });

    const results = [];
    for (const r of reports) {
      const user = await User.findOne({ id: r.reporter_id });
      const item = await Item.findOne({ id: r.item_id });

      results.push({
        ...r.toObject(),
        reporter_name: user ? user.username : 'Unknown',
        item_title: item ? item.title : 'Unknown Item',
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Delete a report (Admin only, optionally deletes associated item)
// @route   DELETE /api/reports/:id
// @access  Private/Admin
const deleteReport = async (req, res) => {
  try {
    const reportIdNum = Number(req.params.id);
    const deleteItem = req.query.deleteItem === 'true'; // parse boolean query param

    const report = await Report.findOne({ id: reportIdNum });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const itemIdNum = report.item_id;

    // Delete the report
    await Report.deleteOne({ id: reportIdNum });

    if (deleteItem) {
      // Delete the associated item
      await Item.deleteOne({ id: itemIdNum });
      // Delete all other reports for that item
      await Report.deleteMany({ item_id: itemIdNum });
    } else {
      // Clear item reported status if no other reports exist
      const remainingReports = await Report.countDocuments({ item_id: itemIdNum });
      if (remainingReports === 0) {
        await Item.updateOne({ id: itemIdNum }, { $set: { reported: 0 } });
      }
    }

    res.json({ message: 'Report processed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  createReport,
  checkReportStatus,
  getItemReports,
  getAllReports,
  deleteReport,
};
