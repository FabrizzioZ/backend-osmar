const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Hacer pública la carpeta 'uploads' para que las imágenes se puedan ver en la web
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado exitosamente a MongoDB Atlas'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Rutas de API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/figures', require('./routes/figures'));
app.use('/api/categories', require('./routes/categories'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`));