const SpamReport = require('../models/SpamReport');
const Item = require('../models/Item');
const User = require('../models/User');

// @desc    Submit a new spam report for an item
// @route   POST /api/spam
// @access  Private
const submitSpamReport = async (req, res) => {
  try {
    const { item_id, reason } = req.body;

    if (!item_id || !reason) {
      return res.status(400).json({ message: 'item_id and reason are required' });
    }

    const itemIdNum = Number(item_id);
    const userId = req.user.id;

    // Check if user already reported this item as spam
    const existing = await SpamReport.findOne({ user_id: userId, item_id: itemIdNum });
    if (existing) {
      return res.status(400).json({ message: 'You have already reported this item as spam' });
    }

    const report = new SpamReport({
      user_id: userId,
      item_id: itemIdNum,
      reason,
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get all spam reports (Admin only)
// @route   GET /api/spam
// @access  Private/Admin
const getAllSpamReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const reports = await SpamReport.find(filter).sort({ created_at: -1 });

    const results = [];
    for (const r of reports) {
      const user = await User.findOne({ id: r.user_id });
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

// @desc    Update status of spam report (Admin only)
// @route   PUT /api/spam/:id
// @access  Private/Admin
const updateSpamStatus = async (req, res) => {
  try {
    const reportIdNum = Number(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const report = await SpamReport.findOne({ id: reportIdNum });
    if (!report) {
      return res.status(404).json({ message: 'Spam report not found' });
    }

    report.status = status;
    report.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get count of spam reports by status (Admin only)
// @route   GET /api/spam/counts
// @access  Private/Admin
const getSpamCounts = async (req, res) => {
  try {
    const counts = {
      pending: await SpamReport.countDocuments({ status: 'pending' }),
      reviewed: await SpamReport.countDocuments({ status: 'reviewed' }),
      resolved: await SpamReport.countDocuments({ status: 'resolved' }),
      dismissed: await SpamReport.countDocuments({ status: 'dismissed' }),
    };

    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  submitSpamReport,
  getAllSpamReports,
  updateSpamStatus,
  getSpamCounts,
};
