const Item = require('../models/Item');
const User = require('../models/User');
const Report = require('../models/Report');

// @desc    Fetch and search all items
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const { keyword, type, location, date } = req.query;
    const filter = {};

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (type) {
      filter.type = type.toLowerCase();
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (date) {
      filter.created_at = { $regex: '^' + date };
    }

    const items = await Item.find(filter).sort({ id: -1 });

    const itemsWithUsernames = [];
    for (const item of items) {
      const user = await User.findOne({ id: item.user_id });
      itemsWithUsernames.push({
        ...item.toObject(),
        username: user ? user.username : 'Unknown',
      });
    }

    res.json(itemsWithUsernames);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Fetch single item by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res) => {
  try {
    const item = await Item.findOne({ id: Number(req.params.id) });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const user = await User.findOne({ id: item.user_id });
    res.json({
      ...item.toObject(),
      username: user ? user.username : 'Unknown',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Create a new item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const { title, description, type, location, image, latitude, longitude } = req.body;

    if (!title || !description || !type || !location) {
      return res.status(400).json({ message: 'Title, description, type, and location are required' });
    }

    const item = new Item({
      title,
      description,
      type: type.toLowerCase(),
      location,
      user_id: req.user.id, // the integer user ID
      image: image || '',
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid item data: ' + error.message });
  }
};

// @desc    Update item status to resolved
// @route   PUT /api/items/:id/resolve
// @access  Private
const resolveItem = async (req, res) => {
  try {
    const item = await Item.findOne({ id: Number(req.params.id) });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Only owner or admin can resolve
    if (item.user_id !== req.user.id && req.user.is_admin !== 1) {
      return res.status(403).json({ message: 'Not authorized to resolve this item' });
    }

    item.status = 'resolved';
    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findOne({ id: Number(req.params.id) });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Only owner or admin can delete
    if (item.user_id !== req.user.id && req.user.is_admin !== 1) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Item.deleteOne({ id: Number(req.params.id) });

    // Also clean up any associated reports
    await Report.deleteMany({ item_id: Number(req.params.id) });

    res.json({ message: 'Item and associated reports deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get all items flagged as reported (for admin)
// @route   GET /api/items/reported
// @access  Private/Admin
const getReportedItems = async (req, res) => {
  try {
    const items = await Item.find({ reported: 1 });
    const reportedItemsData = [];

    for (const item of items) {
      const user = await User.findOne({ id: item.user_id });
      const report = await Report.findOne({ item_id: item.id });

      reportedItemsData.push({
        ...item.toObject(),
        username: user ? user.username : 'Unknown',
        reported_by: report ? report.reporter_id : null,
      });
    }

    res.json(reportedItemsData);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get total count of items
// @route   GET /api/items/count
// @access  Private/Admin
const getTotalItems = async (req, res) => {
  try {
    const count = await Item.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  resolveItem,
  deleteItem,
  getReportedItems,
  getTotalItems,
};
