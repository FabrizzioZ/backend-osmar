const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();
const { uploadsDir, bundledUploadsDir } = require('./config/uploads');
const openApiSpec = require('./docs/openapi');

const app = express();

const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',').map((origin) => origin.trim()).filter(Boolean);
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
}

app.set('trust proxy', 1);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origen no permitido por CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.get('/api-docs.json', (req, res) => res.json(openApiSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  explorer: true,
  customSiteTitle: 'Osmar Figuras API — Swagger',
  swaggerOptions: { persistAuthorization: false },
}));

// Hacer pública la carpeta 'uploads' para que las imágenes se puedan ver en la web
app.use('/uploads', express.static(uploadsDir));
if (path.resolve(uploadsDir) !== path.resolve(bundledUploadsDir)) {
  app.use('/uploads', express.static(bundledUploadsDir));
}

app.get('/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({ status: databaseReady ? 'ok' : 'starting', database: databaseReady ? 'connected' : 'disconnected' });
});

// Conexión MongoDB
// Rutas de API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/figures', require('./routes/figures'));
app.use('/api/categories', require('./routes/categories'));

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.MONGO_URI) throw new Error('Falta configurar MONGO_URI');
  if (!process.env.JWT_SECRET) throw new Error('Falta configurar JWT_SECRET');
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(PORT, '0.0.0.0', () => console.log(`Servidor escuchando en el puerto ${PORT}`));
}

start().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exit(1);
});
