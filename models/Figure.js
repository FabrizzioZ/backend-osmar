const mongoose = require('mongoose');

const figureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  costo: { type: String, default: '0' },
  valorUsd: { type: String, default: '0' },
  marketPrice: { type: Number, default: 0, min: 0 },
  imageUrl: { type: String, default: '' },
  photos: [{ url: { type: String, required: true }, caption: { type: String, default: '' }, createdAt: { type: Date, default: Date.now } }],
  franchise: { type: String, default: '' },
  line: { type: String, default: '' },
  maker: { type: String, default: '' },
  scale: { type: String, default: '' },
  condition: { type: String, default: '' },
  shelfLocation: { type: String, default: '' },
  acquisitionDate: { type: String, default: '' },
  notes: { type: String, default: '' },
  accessories: [{ type: String }],
  cameraBody: { type: String, default: '' },
  lightingSetup: { type: String, default: '' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Figure', figureSchema);
