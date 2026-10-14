const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'NovaMarket API',
    version: '1.0.0',
    description: 'Documentación de los endpoints de NovaMarket.',
  },
  servers: [
    {
      url: '/api',
      description: 'API del servidor actual',
    },
  ],
  tags: [
    {
      name: 'Autenticación',
      description: 'Registro e inicio de sesión de usuarios.',
    },
    {
      name: 'Formularios',
      description: 'Datos de referencia para completar formularios.',
    },
    {
      name: 'Productos',
      description: 'Consulta de productos disponibles.',
    },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Autenticación'],
        summary: 'Registrar usuario',
        description:
          'Crea un usuario nuevo y devuelve un JWT y sus datos, sin incluir la contraseña.',
        operationId: 'registerUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
              example: {
                nombre: 'Ana Pérez',
                email: 'ana@example.com',
                password: 'ClaveSegura1',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuario registrado correctamente.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthSuccessResponse',
                },
                example: {
                  ok: true,
                  message: 'Usuario registrado correctamente',
                  data: {
                    token: '<jwt>',
                    user: {
                      _id: '<id>',
                      nombre: 'Ana Pérez',
                      email: 'ana@example.com',
                      rol: 'client',
                      carrito: {
                        items: [],
                        fechaCreacion: null,
                        fechaActualizacion: null,
                      },
                      createdAt: '<fecha>',
                      updatedAt: '<fecha>',
                      __v: 0,
                    },
                  },
                },
              },
            },
          },
          400: {
            description:
              'El cuerpo no pasa la validación o el email ya está registrado.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                examples: {
                  validationError: {
                    summary: 'Error de validación',
                    value: {
                      ok: false,
                      message:
                        'La contraseña debe tener al menos 8 caracteres',
                      error: null,
                    },
                  },
                  emailAlreadyRegistered: {
                    summary: 'Email ya registrado',
                    value: {
                      ok: false,
                      message: 'El email ya está registrado',
                      error: 'El email ya está registrado',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar sesión',
        description:
          'Autentica al usuario y devuelve un JWT y sus datos, sin incluir la contraseña. El JWT vence en 1 día.',
        operationId: 'loginUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
              example: {
                email: 'ana@example.com',
                password: 'ClaveSegura1',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login exitoso.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthSuccessResponse',
                },
                example: {
                  ok: true,
                  message: 'Login exitoso',
                  data: {
                    token: '<jwt>',
                    user: {
                      _id: '<id>',
                      nombre: 'Ana Pérez',
                      email: 'ana@example.com',
                      rol: 'client',
                      carrito: {
                        items: [],
                        fechaCreacion: null,
                        fechaActualizacion: null,
                      },
                      createdAt: '<fecha>',
                      updatedAt: '<fecha>',
                      __v: 0,
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'El cuerpo no pasa la validación.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'Email inválido',
                  error: null,
                },
              },
            },
          },
          401: {
            description:
              'Credenciales inválidas o excepción durante el inicio de sesión.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'Credenciales inválidas',
                  error: 'Credenciales inválidas',
                },
              },
            },
          },
        },
      },
    },
    '/formdata/products': {
      get: {
        tags: ['Formularios'],
        summary: 'Obtener categorías de productos',
        description:
          'Devuelve las categorías disponibles para productos según las opciones definidas en el modelo.',
        operationId: 'getProductCategories',
        responses: {
          200: {
            description: 'Categorías de productos obtenidas correctamente.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProductCategoriesResponse',
                },
                example: {
                  ok: true,
                  message: 'Categorías de productos',
                  data: ['accesorios', 'perifericos', 'gadgets'],
                },
              },
            },
          },
          500: {
            description: 'Error interno al obtener las categorías.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'Error al comprobar el estado del servidor',
                  error: 'Error interno del servidor',
                },
              },
            },
          },
        },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Productos'],
        summary: 'Obtener producto por ID',
        description:
          'Devuelve un producto activo por su identificador de MongoDB (ObjectId).',
        operationId: 'getProductById',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Identificador del producto. Debe ser un ObjectId de 24 caracteres hexadecimales.',
            schema: {
              type: 'string',
              pattern: '^[0-9a-fA-F]{24}$',
              example: '507f1f77bcf86cd799439011',
            },
          },
        ],
        responses: {
          200: {
            description: 'Producto encontrado.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProductByIdResponse',
                },
                example: {
                  ok: true,
                  message: 'Producto encontrado',
                  data: {
                    _id: '507f1f77bcf86cd799439011',
                    nombre: 'Auriculares inalámbricos',
                    descripcion: 'Auriculares Bluetooth con cancelación de ruido',
                    precio: 89.99,
                    stock: 12,
                    categoria: 'gadgets',
                    imagenUrl: 'https://example.com/auriculares.jpg',
                    activo: true,
                    createdAt: '2026-01-15T10:30:00.000Z',
                    updatedAt: '2026-01-15T10:30:00.000Z',
                    __v: 0,
                  },
                },
              },
            },
          },
          400: {
            description: 'El ID no es un ObjectId válido.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'El ID del producto debe ser un ObjectId válido',
                  error: null,
                },
              },
            },
          },
          500: {
            description:
              'Error al buscar el producto, incluido el caso en que no se encuentre un producto activo con ese ID.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'Error al comprobar el estado del servidor',
                  error: 'Producto no encontrado',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ProductByIdResponse: {
        type: 'object',
        required: ['ok', 'message', 'data'],
        properties: {
          ok: {
            type: 'boolean',
            enum: [true],
          },
          message: {
            type: 'string',
            example: 'Producto encontrado',
          },
          data: {
            $ref: '#/components/schemas/Product',
          },
        },
      },
      Product: {
        type: 'object',
        required: [
          '_id',
          'nombre',
          'precio',
          'stock',
          'categoria',
          'activo',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          _id: {
            type: 'string',
            description: 'Identificador del producto en MongoDB.',
            example: '507f1f77bcf86cd799439011',
          },
          nombre: {
            type: 'string',
            example: 'Auriculares inalámbricos',
          },
          descripcion: {
            type: 'string',
            nullable: true,
            example: 'Auriculares Bluetooth con cancelación de ruido',
          },
          precio: {
            type: 'number',
            example: 89.99,
          },
          stock: {
            type: 'integer',
            example: 12,
          },
          categoria: {
            type: 'string',
            enum: ['accesorios', 'perifericos', 'gadgets'],
            example: 'gadgets',
          },
          imagenUrl: {
            type: 'string',
            nullable: true,
            example: 'https://example.com/auriculares.jpg',
          },
          activo: {
            type: 'boolean',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
          __v: {
            type: 'integer',
            description: 'Versión del documento de MongoDB.',
            example: 0,
          },
        },
      },
      ProductCategoriesResponse: {
        type: 'object',
        required: ['ok', 'message', 'data'],
        properties: {
          ok: {
            type: 'boolean',
            enum: [true],
          },
          message: {
            type: 'string',
            example: 'Categorías de productos',
          },
          data: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['accesorios', 'perifericos', 'gadgets'],
            },
            example: ['accesorios', 'perifericos', 'gadgets'],
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['nombre', 'email', 'password'],
        properties: {
          nombre: {
            type: 'string',
            minLength: 2,
            description: 'Nombre del usuario; mínimo 2 caracteres.',
            example: 'Ana Pérez',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email válido.',
            example: 'ana@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).+$',
            description:
              'Mínimo 8 caracteres, con al menos una mayúscula, una minúscula y un número.',
            example: 'ClaveSegura1',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'Email válido.',
            example: 'ana@example.com',
          },
          password: {
            type: 'string',
            description: 'Contraseña de la cuenta.',
            example: 'ClaveSegura1',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Identificador del usuario en MongoDB.',
            example: '<id>',
          },
          nombre: {
            type: 'string',
            example: 'Ana Pérez',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'ana@example.com',
          },
          rol: {
            type: 'string',
            enum: ['client', 'admin'],
            example: 'client',
          },
          carrito: {
            $ref: '#/components/schemas/Cart',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
          __v: {
            type: 'integer',
            description: 'Versión del documento de MongoDB.',
          },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: {
                  type: 'string',
                  description: 'Identificador del producto.',
                },
                cantidad: {
                  type: 'integer',
                  default: 1,
                },
              },
            },
          },
          fechaCreacion: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          fechaActualizacion: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
        },
      },
      AuthData: {
        type: 'object',
        required: ['token', 'user'],
        properties: {
          token: {
            type: 'string',
            description: 'JWT con vencimiento de 1 día.',
          },
          user: {
            $ref: '#/components/schemas/User',
          },
        },
      },
      AuthSuccessResponse: {
        type: 'object',
        required: ['ok', 'message', 'data'],
        properties: {
          ok: {
            type: 'boolean',
            enum: [true],
          },
          message: {
            type: 'string',
            example: 'Login exitoso',
          },
          data: {
            $ref: '#/components/schemas/AuthData',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['ok', 'message', 'error'],
        properties: {
          ok: {
            type: 'boolean',
            enum: [false],
          },
          message: {
            type: 'string',
          },
          error: {
            type: 'string',
            nullable: true,
          },
        },
      },
    },
  },
};

export default swaggerDocument;
