const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Osmar Figuras API',
    version: '1.0.0',
    description: 'API para autenticación y administración de la colección de figuras y categorías.',
  },
  servers: [
    { url: '/', description: 'Este mismo servicio (Render o entorno local)' },
  ],
  tags: [
    { name: 'Health', description: 'Estado del servicio y la base de datos' },
    { name: 'Auth', description: 'Registro e inicio de sesión' },
    { name: 'Figures', description: 'Consulta y administración de figuras' },
    { name: 'Categories', description: 'Consulta y administración de categorías' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Usa el token devuelto por /api/auth/login o /api/auth/register.',
      },
    },
    schemas: {
      Credentials: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'coleccionista@example.com' },
          password: { type: 'string', format: 'password', example: 'una-clave-segura' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'JWT válido durante 7 días.' },
          user: {
            type: 'object',
            properties: { email: { type: 'string', format: 'email' } },
          },
        },
      },
      Figure: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '665f1a2b3c4d5e6f78901234' },
          name: { type: 'string', example: 'Goku Super Saiyan' },
          category: { type: 'string', example: 'Dragon Ball' },
          costo: { type: 'string', example: 'S/200' },
          valorUsd: { type: 'string', example: '$ 57.64' },
          marketPrice: { type: 'number', example: 42.5 },
          imageUrl: { type: 'string', format: 'uri', nullable: true },
          photos: { type: 'array', items: { type: 'object', properties: { url: { type: 'string', format: 'uri' }, caption: { type: 'string' } } } },
          franchise: { type: 'string' },
          line: { type: 'string' },
          maker: { type: 'string' },
          scale: { type: 'string', example: '1/12' },
          condition: { type: 'string', example: 'displayed' },
          shelfLocation: { type: 'string' },
          acquisitionDate: { type: 'string', format: 'date' },
          notes: { type: 'string' },
          accessories: { type: 'array', items: { type: 'string' } },
          cameraBody: { type: 'string' },
          lightingSetup: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '665f1a2b3c4d5e6f78901234' },
          name: { type: 'string', example: 'Dragon Ball' },
          icon: { type: 'string', example: '🐉' },
          count: { type: 'integer', example: 0 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Message: {
        type: 'object',
        properties: { message: { type: 'string' } },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Comprueba que el servicio y MongoDB estén disponibles',
        responses: {
          200: {
            description: 'Servicio listo y conectado a MongoDB',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' }, database: { type: 'string', example: 'connected' } } } } },
          },
          503: {
            description: 'MongoDB aún no está conectado',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'starting' }, database: { type: 'string', example: 'disconnected' } } } } },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Crea una cuenta y devuelve un JWT',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Credentials' } } } },
        responses: {
          200: { description: 'Cuenta creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: { description: 'El correo ya está registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          500: { description: 'Error del servidor' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Inicia sesión y devuelve un JWT',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Credentials' } } } },
        responses: {
          200: { description: 'Inicio de sesión correcto', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: { description: 'Usuario o contraseña incorrectos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          500: { description: 'Error del servidor' },
        },
      },
    },
    '/api/figures': {
      get: {
        tags: ['Figures'],
        summary: 'Lista las figuras, ordenadas por fecha de creación',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de figuras', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Figure' } } } } },
          401: { description: 'Falta un JWT válido' },
          500: { description: 'Error al consultar las figuras' },
        },
      },
      post: {
        tags: ['Figures'],
        summary: 'Crea una figura y opcionalmente sube hasta 20 imágenes',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Goku Super Saiyan' },
                  category: { type: 'string', example: 'Dragon Ball' },
                  costo: { type: 'string', example: 'S/200' },
                  valorUsd: { type: 'string', example: '$ 57.64' },
                  marketPrice: { type: 'number', example: 42.5 },
                  franchise: { type: 'string' },
                  line: { type: 'string' },
                  maker: { type: 'string' },
                  scale: { type: 'string' },
                  condition: { type: 'string' },
                  shelfLocation: { type: 'string' },
                  acquisitionDate: { type: 'string', format: 'date' },
                  notes: { type: 'string' },
                  accessories: { type: 'string', description: 'Lista separada por |.' },
                  cameraBody: { type: 'string' },
                  lightingSetup: { type: 'string' },
                  images: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Hasta 20 imágenes de 10 MB como máximo cada una.' },
                  image: { type: 'string', format: 'binary', description: 'Campo anterior compatible con una sola imagen.' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Figura creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Figure' } } } },
          401: { description: 'Falta un JWT válido' },
          500: { description: 'Error al guardar la figura' },
        },
      },
    },
    '/api/figures/{id}': {
      put: {
        tags: ['Figures'],
        summary: 'Actualiza los datos de una figura y añade fotos opcionales',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { name: { type: 'string' }, category: { type: 'string' }, costo: { type: 'string' }, marketPrice: { type: 'number' }, notes: { type: 'string' }, images: { type: 'array', items: { type: 'string', format: 'binary' } } } } } } },
        responses: {
          200: { description: 'Figura actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Figure' } } } },
          401: { description: 'Falta un JWT válido' },
          404: { description: 'No se encontró la figura' },
        },
      },
      delete: {
        tags: ['Figures'],
        summary: 'Elimina una figura por su ID de MongoDB',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '665f1a2b3c4d5e6f78901234' }],
        responses: {
          200: { description: 'Figura eliminada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          401: { description: 'Falta un JWT válido' },
          500: { description: 'Error al eliminar la figura' },
        },
      },
    },
    '/api/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Lista las categorías',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de categorías', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } },
          401: { description: 'Falta un JWT válido' },
          500: { description: 'Error al consultar las categorías' },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Crea una categoría',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Dragon Ball' },
                  icon: { type: 'string', example: '🐉' },
                  count: { type: 'integer', example: 0 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Línea creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
          401: { description: 'Falta un JWT válido' },
          500: { description: 'Error al crear la categoría' },
        },
      },
    },
    '/api/categories/{id}': {
      delete: {
        tags: ['Categories'],
        summary: 'Elimina una categoría por su ID de MongoDB',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '665f1a2b3c4d5e6f78901234' }],
        responses: {
          200: { description: 'Categoría eliminada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          401: { description: 'Falta un JWT válido' },
          500: { description: 'Error al eliminar la categoría' },
        },
      },
    },
  },
};

module.exports = openApiSpec;
