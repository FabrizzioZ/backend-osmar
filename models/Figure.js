const mongoose = require('mongoose');

const figureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  costo: { type: String, required: true },     // Cambiado a String para aceptar "S/200"
  valorUsd: { type: String, required: true },  // Cambiado a String para aceptar "$ 200"
  imageUrl: { type: String, required: true },  // Nombre exacto que pide la base de datos
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Figure', figureSchema);