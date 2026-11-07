const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: '🔥' },
  count: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

CategorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
