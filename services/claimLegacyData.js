const Category = require('../models/Category');
const Figure = require('../models/Figure');
const User = require('../models/User');

// Previous releases stored a single shared collection without an owner field.
// Assign those records once to the oldest account so they remain available
// while new records are correctly isolated by user.
module.exports = async function claimLegacyData(userId) {
  const [firstUser] = await User.find().sort({ createdAt: 1, _id: 1 }).select('_id').limit(1).lean();
  if (!firstUser || String(firstUser._id) !== String(userId)) return;

  await Promise.all([
    Figure.updateMany({ user: { $exists: false } }, { $set: { user: firstUser._id } }),
    Category.updateMany({ user: { $exists: false } }, { $set: { user: firstUser._id } }),
  ]);
};
