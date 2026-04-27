const Mould = require('../models/Mould');
const User = require('../models/User');
const Product = require('../models/Product');
const Client = require('../models/Client');

// @desc    Get dashboard overview stats dynamically
// @route   GET /api/dashboard/overview
// @access  Private/Admin
const getOverview = async (req, res) => {
  try {
    const totalClients = await User.countDocuments({ isAdmin: false });
    const totalMoulds = await Mould.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalTestimonials = await Client.countDocuments({});

    // Dynamic aggregation for mould statuses
    const statusCountsAgg = await Mould.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Format the status counts as an object
    const statusCounts = {};
    statusCountsAgg.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    res.json({
      totals: {
        clients: totalClients,
        moulds: totalMoulds,
        products: totalProducts,
        testimonials: totalTestimonials,
      },
      statusCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOverview };
