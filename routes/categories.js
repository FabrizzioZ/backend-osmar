const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    const saved = await newCategory.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear categoría' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar categoría' });
  }
});

module.exports = router;
