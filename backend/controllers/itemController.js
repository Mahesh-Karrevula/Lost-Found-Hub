const Item = require('../models/Item');

// @desc    Fetch all items
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const items = await Item.find({ ...keyword }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create an item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const { type, title, description, category, location, date, imageUrl } = req.body;

    const item = new Item({
      type,
      title,
      description,
      category,
      location,
      date,
      imageUrl,
      user: req.user._id, // Assume user is attached to req by auth middleware
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(400).json({ message: 'Invalid item data' });
  }
};

module.exports = {
  getItems,
  createItem,
};
