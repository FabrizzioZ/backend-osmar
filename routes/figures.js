const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const Figure = require('../models/Figure');
const authenticate = require('../middleware/auth');
const { uploadsDir } = require('../config/uploads');
const claimLegacyData = require('../services/claimLegacyData');

const router = express.Router();
router.use(authenticate);
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadsDir),
  filename: (_req, file, callback) => callback(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname).toLowerCase()}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) return callback(new Error('Solo se permiten archivos de imagen.'));
    return callback(null, true);
  },
});
const imageUpload = upload.fields([{ name: 'images', maxCount: 20 }, { name: 'image', maxCount: 1 }]);
const parseAccessories = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || '').split('|').map((item) => item.trim()).filter(Boolean);
};
const uploadedPhotos = (req) => Object.values(req.files || {}).flat().map((file) => ({
  url: `${(process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '')}/uploads/${file.filename}`,
}));
const fields = ['name', 'category', 'costo', 'valorUsd', 'franchise', 'line', 'maker', 'scale', 'condition', 'shelfLocation', 'acquisitionDate', 'notes', 'cameraBody', 'lightingSetup'];
function figurePayload(body) {
  const result = {};
  for (const field of fields) if (body[field] !== undefined) result[field] = String(body[field]).trim();
  if (body.marketPrice !== undefined) {
    const price = Number(body.marketPrice);
    if (!Number.isFinite(price) || price < 0) throw new Error('El valor de mercado debe ser un número igual o mayor que cero.');
    result.marketPrice = price;
  }
  if (body.accessories !== undefined) result.accessories = parseAccessories(body.accessories);
  return result;
}
function handleUpload(req, res, next) {
  imageUpload(req, res, (error) => {
    if (!error) return next();
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Cada imagen debe pesar 10 MB o menos.'
      : error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE' ? 'Puedes subir hasta 20 imágenes por registro.'
        : error.message || 'No se pudieron procesar las imágenes.';
    return res.status(400).json({ message });
  });
}

router.get('/', async (req, res) => {
  try {
    await claimLegacyData(req.user.userId);
    const figures = await Figure.find({ user: req.user.userId }).sort({ createdAt: -1 });
    return res.json(figures);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener figuras' });
  }
});

router.post('/', handleUpload, async (req, res) => {
  try {
    const data = figurePayload(req.body);
    if (!data.name) return res.status(400).json({ message: 'El nombre de la figura es obligatorio.' });
    data.category = data.category || 'General';
    data.costo = data.costo || '0';
    data.valorUsd = data.valorUsd || '0';
    const photos = uploadedPhotos(req);
    const figure = await Figure.create({ ...data, photos, imageUrl: photos[0]?.url || '', user: req.user.userId });
    return res.status(201).json(figure);
  } catch (error) {
    return res.status(400).json({ message: error.message || 'No se pudo guardar la figura.' });
  }
});

router.put('/:id', handleUpload, async (req, res) => {
  try {
    const data = figurePayload(req.body);
    const addedPhotos = uploadedPhotos(req);
    const figure = await Figure.findOne({ _id: req.params.id, user: req.user.userId });
    if (!figure) return res.status(404).json({ message: 'No se encontró la figura.' });
    Object.assign(figure, data);
    if (addedPhotos.length) figure.photos.push(...addedPhotos);
    if (addedPhotos.length && !figure.imageUrl) figure.imageUrl = addedPhotos[0].url;
    await figure.save();
    return res.json(figure);
  } catch (error) {
    return res.status(error.name === 'CastError' ? 404 : 400).json({ message: error.message || 'No se pudo actualizar la figura.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const figure = await Figure.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!figure) return res.status(404).json({ message: 'No se encontró la figura.' });
    return res.json({ message: 'Figura eliminada' });
  } catch (error) {
    return res.status(error.name === 'CastError' ? 404 : 500).json({ message: 'Error al eliminar la figura.' });
  }
});

module.exports = router;
