const express = require('express');
const Category = require('../models/Category');
const Figure = require('../models/Figure');
const authenticate = require('../middleware/auth');
const claimLegacyData = require('../services/claimLegacyData');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    await claimLegacyData(req.user.userId);
    return res.json(await Category.find({ user: req.user.userId }).sort({ name: 1 }));
  } catch {
    return res.status(500).json({ message: 'Error al obtener líneas de colección.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'El nombre de la línea es obligatorio.' });
    const category = await Category.create({ name, icon: String(req.body.icon || '✦').slice(0, 8), user: req.user.userId });
    return res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Ya existe una línea con ese nombre.' });
    return res.status(400).json({ message: 'No se pudo crear la línea.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user.userId });
    if (!category) return res.status(404).json({ message: 'No se encontró la línea.' });
    const inUse = await Figure.exists({ user: req.user.userId, category: category.name });
    if (inUse) return res.status(409).json({ message: 'No puedes borrar una línea que todavía tiene figuras.' });
    await category.deleteOne();
    return res.json({ message: 'Línea eliminada.' });
  } catch (error) {
    return res.status(error.name === 'CastError' ? 404 : 500).json({ message: 'Error al eliminar la línea.' });
  }
});

module.exports = router;
