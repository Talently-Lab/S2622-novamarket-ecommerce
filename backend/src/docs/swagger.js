const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'NovaMarket API',
    version: '1.0.0',
    description: 'Documentación de los endpoints de autenticación de NovaMarket.',
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
  },
  components: {
    schemas: {
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
