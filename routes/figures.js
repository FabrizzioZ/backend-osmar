const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Figure = require('../models/Figure');
const authenticate = require('../middleware/auth');

router.use(authenticate);

// ⚙️ 1. Configuración de Multer (Esto faltaba definir)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destination = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// 📥 2. Ruta GET para obtener las figuras
router.get('/', async (req, res) => {
  try {
    const figures = await Figure.find().sort({ createdAt: -1 });
    res.json(figures);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener figuras' });
  }
});

// 📤 3. Ruta POST para crear una figura con imagen
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, category, costo, valorUsd } = req.body;
    
    const imagePath = req.file 
      ? `${(process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '')}/uploads/${req.file.filename}`
      : 'https://via.placeholder.com/200x250/1e293b/facc15?text=Figura';

    const nuevaFigura = new Figure({
      name,
      category,
      costo,
      valorUsd,
      imageUrl: imagePath
    });

    const savedFigure = await nuevaFigura.save();
    res.status(201).json(savedFigure);
  } catch (error) {
    console.error("Error al guardar figura:", error);
    res.status(500).json({ message: 'Error al guardar la figura', error: error.message });
  }
});

// 🗑️ 4. Ruta DELETE para eliminar figura
router.delete('/:id', async (req, res) => {
  try {
    await Figure.findByIdAndDelete(req.params.id);
    res.json({ message: 'Figura eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
});

module.exports = router;
