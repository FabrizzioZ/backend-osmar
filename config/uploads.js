const fs = require('fs');
const os = require('os');
const path = require('path');

const bundledUploadsDir = path.join(__dirname, '..', 'uploads');
const temporaryUploadsDir = path.join(os.tmpdir(), 'osmar-figuras-uploads');
const configuredUploadsDir = process.env.UPLOADS_DIR || (
  process.env.RENDER ? temporaryUploadsDir : bundledUploadsDir
);

function prepareDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
  fs.accessSync(directory, fs.constants.W_OK);
}

let uploadsDir = configuredUploadsDir;

try {
  prepareDirectory(uploadsDir);
} catch (error) {
  if (path.resolve(uploadsDir) === path.resolve(temporaryUploadsDir)) {
    throw new Error(`No se puede escribir en el directorio temporal de imágenes ${uploadsDir}: ${error.message}`);
  }

  console.warn(
    `No se puede escribir en UPLOADS_DIR (${uploadsDir}): ${error.message}. ` +
    `Se usarán imágenes temporales en ${temporaryUploadsDir}; Render Free puede borrarlas al reiniciar.`
  );
  uploadsDir = temporaryUploadsDir;
  prepareDirectory(uploadsDir);
}

module.exports = { uploadsDir, bundledUploadsDir };
