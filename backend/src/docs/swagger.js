import { cartTag, cartPaths, cartSchemas } from './cartDocs.js';
import { getAllOrdersOperation, orderAdminPaths, orderAdminSchemas } from './orderAdminDocs.js';
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
    {
      name: 'Órdenes',
      description: 'Creación y gestión de órdenes de compra.',
    },
    cartTag,
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
      put: {
        tags: ['Productos'],
        summary: 'Actualizar producto',
        description:
          'Actualiza uno o más campos de un producto activo. Ruta exclusiva para usuarios con rol admin. Solo hace falta enviar los campos que cambian (al menos uno). El campo activo no se puede modificar por aquí.',
        operationId: 'updateProduct',
        security: [
          {
            bearerAuth: [],
          },
        ],
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
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateProductRequest',
              },
              example: {
                precio: 79.99,
                stock: 20,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Producto actualizado correctamente.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProductByIdResponse',
                },
                example: {
                  ok: true,
                  message: 'Producto actualizado correctamente',
                  data: {
                    _id: '507f1f77bcf86cd799439011',
                    nombre: 'Auriculares inalámbricos',
                    descripcion: 'Auriculares Bluetooth con cancelación de ruido',
                    precio: 89.99,
                    stock: 12,
                    categoria: 'gadgets',
                    imagenUrl: 'https://example.com/auriculares.jpg',
                    activo: true,
                    createdAt: '2026-10-21T10:30:00.000Z',
                    updatedAt: '2026-10-21T10:30:00.000Z',
                    __v: 0,
                  },
                },
              },
            },
          },
          400: {
            description: 'El ID no es válido o el cuerpo no pasa la validación.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                examples: {
              invalidId: {
                summary: 'ID inválido',
                value: {
                  ok: false,
                  message: 'El ID del producto debe ser un ObjectId válido',
                  error: null,
                },
              },
              emptyBody: {
                summary: 'Cuerpo vacío',
                value: {
                  ok: false,
                  message: 'Debes enviar al menos un campo para actualizar',
                  error: null,
                },
              },
              invalidPrice: {
                summary: 'Precio inválido',
                value: {
                  ok: false,
                  message: 'El precio debe ser un número',
                  error: null,
                },
              },
                },
              },
            },
          },
          401: {
            description: 'Falta el token de autenticación o es inválido/expiró.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                examples: {
                  missingToken: {
                    summary: 'Token requerido',
                    value: {
                      ok: false,
                      message: 'Token requerido',
                      error: null,
                    },
                  },
                  invalidToken: {
                    summary: 'Token inválido o expirado',
                    value: {
                      ok: false,
                      message: 'Token inválido o expirado',
                      error: 'jwt malformed',
                    },
                  },
                },
              },
            },
          },
          403: {
            description: 'El usuario autenticado no tiene el rol admin.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'No tienes permisos para realizar esta acción',
                  error: null,
                },
              },
            },
          },
          404: {
            description: 'No existe un producto activo con ese ID.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'Producto no encontrado',
                  error: 'Producto no encontrado',
                },
              },
            },
          },
          500: {
            description: 'Error interno del servidor.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'Ha ocurrido un error en el servidor',
                  error: 'Error interno del servidor',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Productos'],
        summary: 'Eliminar producto (soft delete)',
        description:
          'Baja lógica de un producto: no se borra el documento, solo se establece activo en false. Ruta exclusiva para usuarios con rol admin. Después de eliminarlo, el producto deja de aparecer en el listado y en la consulta por ID.',
        operationId: 'deleteProduct',
        security: [
          {
            bearerAuth: [],
          },
        ],
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
            description: 'Producto desactivado correctamente. Devuelve el producto con activo en false.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProductByIdResponse',
                },
                example: {
                  ok: true,
                  message: 'Producto eliminado correctamente',
                  data: {
                    _id: '507f1f77bcf86cd799439011',
                    nombre: 'Auriculares inalámbricos',
                    descripcion: 'Auriculares Bluetooth con cancelación de ruido',
                    precio: 89.99,
                    stock: 12,
                    categoria: 'gadgets',
                    imagenUrl: 'https://example.com/auriculares.jpg',
                    activo: false,
                    createdAt: '2026-10-21T10:30:00.000Z',
                    updatedAt: '2026-10-21T10:30:00.000Z',
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
                examples: {
              invalidId: {
                summary: 'ID inválido',
                value: {
                  ok: false,
                  message: 'El ID del producto debe ser un ObjectId válido',
                  error: null,
                },
              },
                },
              },
            },
          },
          401: {
            description: 'Falta el token de autenticación o es inválido/expiró.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                examples: {
                  missingToken: {
                    summary: 'Token requerido',
                    value: {
                      ok: false,
                      message: 'Token requerido',
                      error: null,
                    },
                  },
                  invalidToken: {
                    summary: 'Token inválido o expirado',
                    value: {
                      ok: false,
                      message: 'Token inválido o expirado',
                      error: 'jwt malformed',
                    },
                  },
                },
              },
            },
          },
          403: {
            description: 'El usuario autenticado no tiene el rol admin.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'No tienes permisos para realizar esta acción',
                  error: null,
                },
              },
            },
          },
          404: {
            description: 'No existe un producto activo con ese ID.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'Producto no encontrado',
                  error: 'Producto no encontrado',
                },
              },
            },
          },
          500: {
            description: 'Error interno del servidor.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'Ha ocurrido un error en el servidor',
                  error: 'Error interno del servidor',
                },
              },
            },
          },
        },
      },
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
    '/products/': {
      post: {
        tags: ['Productos'],
        summary: 'Crear producto',
        description:
          'Crea un producto nuevo. Ruta exclusiva para usuarios con rol admin. El producto se crea siempre activo; el campo activo no se puede enviar.',
        operationId: 'createProduct',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateProductRequest',
              },
              example: {
                nombre: 'Auriculares inalámbricos',
                descripcion: 'Auriculares Bluetooth con cancelación de ruido',
                precio: 89.99,
                stock: 12,
                categoria: 'gadgets',
                imagenUrl: 'https://example.com/auriculares.jpg',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Producto creado correctamente.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProductByIdResponse',
                },
                example: {
                  ok: true,
                  message: 'Producto creado correctamente',
                  data: {
                    _id: '507f1f77bcf86cd799439011',
                    nombre: 'Auriculares inalámbricos',
                    descripcion: 'Auriculares Bluetooth con cancelación de ruido',
                    precio: 89.99,
                    stock: 12,
                    categoria: 'gadgets',
                    imagenUrl: 'https://example.com/auriculares.jpg',
                    activo: true,
                    createdAt: '2026-10-21T10:30:00.000Z',
                    updatedAt: '2026-10-21T10:30:00.000Z',
                    __v: 0,
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
                examples: {
              missingField: {
                summary: 'Campo requerido faltante',
                value: {
                  ok: false,
                  message: 'El nombre debe ser una cadena de texto',
                  error: null,
                },
              },
              invalidCategory: {
                summary: 'Categoría inválida',
                value: {
                  ok: false,
                  message: 'La categoría debe ser una de: accesorios, perifericos, gadgets',
                  error: null,
                },
              },
              negativePrice: {
                summary: 'Precio negativo',
                value: {
                  ok: false,
                  message: 'El precio no puede ser negativo',
                  error: null,
                },
              },
                },
              },
            },
          },
          401: {
            description: 'Falta el token de autenticación o es inválido/expiró.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                examples: {
                  missingToken: {
                    summary: 'Token requerido',
                    value: {
                      ok: false,
                      message: 'Token requerido',
                      error: null,
                    },
                  },
                  invalidToken: {
                    summary: 'Token inválido o expirado',
                    value: {
                      ok: false,
                      message: 'Token inválido o expirado',
                      error: 'jwt malformed',
                    },
                  },
                },
              },
            },
          },
          403: {
            description: 'El usuario autenticado no tiene el rol admin.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'No tienes permisos para realizar esta acción',
                  error: null,
                },
              },
            },
          },
          500: {
            description: 'Error interno del servidor.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'Ha ocurrido un error en el servidor',
                  error: 'Error interno del servidor',
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Productos'],
        summary: 'Listar productos',
        description:
          'Devuelve productos activos con filtros opcionales, paginación y ordenamiento.',
        operationId: 'getAllProducts',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Cantidad máxima de productos por página. Por defecto: 10.',
            schema: {
              type: 'integer',
              default: 10,
              example: 10,
            },
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            description: 'Número de página, comenzando desde 1. Por defecto: 1.',
            schema: {
              type: 'integer',
              default: 1,
              example: 1,
            },
          },
          {
            name: 'category',
            in: 'query',
            required: false,
            description: 'Filtra por categoría del producto.',
            schema: {
              type: 'string',
              enum: ['accesorios', 'perifericos', 'gadgets'],
            },
          },
          {
            name: 'name',
            in: 'query',
            required: false,
            description: 'Busca por nombre del producto, sin distinguir mayúsculas.',
            schema: {
              type: 'string',
              example: 'auriculares',
            },
          },
          {
            name: 'minPrice',
            in: 'query',
            required: false,
            description: 'Precio mínimo inclusivo.',
            schema: {
              type: 'integer',
              minimum: 0,
              example: 10,
            },
          },
          {
            name: 'maxPrice',
            in: 'query',
            required: false,
            description: 'Precio máximo inclusivo.',
            schema: {
              type: 'integer',
              minimum: 0,
              example: 100,
            },
          },
          {
            name: 'sortByPrice',
            in: 'query',
            required: false,
            description: 'Ordena por precio.',
            schema: {
              type: 'string',
              enum: ['asc', 'desc'],
            },
          },
          {
            name: 'sortByDate',
            in: 'query',
            required: false,
            description: 'Ordena por fecha de creación.',
            schema: {
              type: 'string',
              enum: ['asc', 'desc'],
            },
          },
        ],
        responses: {
          200: {
            description: 'Productos encontrados.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProductsListResponse',
                },
                example: {
                  ok: true,
                  message: 'Productos encontrados',
                  data: {
                    products: [
                      {
                        _id: '507f1f77bcf86cd799439011',
                        nombre: 'Auriculares inalámbricos',
                        descripcion: 'Auriculares Bluetooth con cancelación de ruido',
                        precio: 89,
                        stock: 12,
                        categoria: 'gadgets',
                        imagenUrl: 'https://example.com/auriculares.jpg',
                        createdAt: '2026-01-15T10:30:00.000Z',
                        updatedAt: '2026-01-15T10:30:00.000Z',
                      },
                    ],
                    totalProducts: 1,
                  },
                },
              },
            },
          },
          500: {
            description: 'Error interno al obtener los productos.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'Ha ocurrido un error en el servidor',
                  error: 'Error interno del servidor',
                },
              },
            },
          },
        },
      },
    },
    '/orders/': {
  get: getAllOrdersOperation,
      post: {
        tags: ['Órdenes'],
        summary: 'Crear una orden de compra',
        description:
          'Crea una orden para el usuario autenticado con rol client. Verifica los productos y el stock, calcula el total usando los precios vigentes y descuenta el stock dentro de una transacción. El total enviado debe coincidir exactamente con el total calculado.',
        operationId: 'createOrder',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateOrderRequest',
              },
              example: {
                items: [
                  {
                    productId: '507f1f77bcf86cd799439011',
                    cantidad: 2,
                  },
                ],
                total: 100,
                direccionEnvio: {
                  calle: 'Av. Corrientes 1234',
                  ciudad: 'Buenos Aires',
                  provincia: 'Buenos Aires',
                  codigoPostal: 'C1043',
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Orden creada correctamente.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateOrderResponse',
                },
                example: {
                  ok: true,
                  message: 'Compra realizada correctamente',
                  data: {
                    _id: '507f1f77bcf86cd799439020',
                    userId: '507f1f77bcf86cd799439099',
                    items: [
                      {
                        _id: '507f1f77bcf86cd799439021',
                        productId: '507f1f77bcf86cd799439011',
                        nombre: 'Auriculares inalámbricos',
                        cantidad: 2,
                        precioHistorico: 50,
                      },
                    ],
                    total: 100,
                    estado: 'pendiente',
                    direccionEnvio: {
                      calle: 'Av. Corrientes 1234',
                      ciudad: 'Buenos Aires',
                      provincia: 'Buenos Aires',
                      codigoPostal: 'C1043',
                    },
                    createdAt: '2026-10-21T20:39:26.000Z',
                    updatedAt: '2026-10-21T20:39:26.000Z',
                    __v: 0,
                  },
                },
              },
            },
          },
          400: {
            description:
              'El cuerpo no cumple las validaciones o el total enviado no coincide con el total calculado.',
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
                      message: 'items array cannot be empty',
                      error: null,
                    },
                  },
                  totalMismatch: {
                    summary: 'El total enviado no coincide',
                    value: {
                      ok: false,
                      message: 'El total dado es distinto al total final',
                      error: 'El total dado es distinto al total final',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Falta el token de autenticación o es inválido/expiró.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                examples: {
                  missingToken: {
                    summary: 'Token requerido',
                    value: {
                      ok: false,
                      message: 'Token requerido',
                      error: null,
                    },
                  },
                  invalidToken: {
                    summary: 'Token inválido o expirado',
                    value: {
                      ok: false,
                      message: 'Token inválido o expirado',
                      error: 'jwt malformed',
                    },
                  },
                },
              },
            },
          },
          403: {
            description: 'El usuario autenticado no tiene el rol client.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'No tienes permisos para realizar esta acción',
                  error: null,
                },
              },
            },
          },
          404: {
            description: 'Uno de los productos indicados no existe.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'El producto con ID 507f1f77bcf86cd799439011 no existe.',
                  error: 'El producto con ID 507f1f77bcf86cd799439011 no existe.',
                },
              },
            },
          },
          409: {
            description: 'El stock disponible no alcanza para la cantidad solicitada.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'Stock insuficiente para Auriculares inalámbricos. Disponibles: 1',
                  error: 'Stock insuficiente para Auriculares inalámbricos. Disponibles: 1',
                },
              },
            },
          },
          500: {
            description: 'Error interno al crear la orden.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'Ha ocurrido un error en el servidor',
                  error: 'Error interno del servidor',
                },
              },
            },
          },
        },
      },
    },
    '/orders/my': {
      get: {
        tags: ['Órdenes'],
        summary: 'Obtener mis órdenes',
        description:
          'Devuelve las órdenes asociadas al usuario autenticado. Cada producto de los ítems se incluye poblado con sus datos actuales.',
        operationId: 'getOrdersByUserId',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description:
              'Órdenes del usuario obtenidas correctamente. Si todavía no tiene órdenes, data es un array vacío.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserOrdersResponse',
                },
                example: {
                  ok: true,
                  message: 'Ordenes obtenidas correctamente',
                  data: [
                    {
                      _id: '507f1f77bcf86cd799439020',
                      userId: '507f1f77bcf86cd799439099',
                      items: [
                        {
                          _id: '507f1f77bcf86cd799439021',
                          productId: {
                            _id: '507f1f77bcf86cd799439011',
                            nombre: 'Auriculares inalámbricos',
                            descripcion: 'Auriculares Bluetooth con cancelación de ruido',
                            precio: 55,
                            stock: 10,
                            categoria: 'gadgets',
                            imagenUrl: 'https://example.com/auriculares.jpg',
                            activo: true,
                            createdAt: '2026-10-20T10:30:00.000Z',
                            updatedAt: '2026-10-21T10:30:00.000Z',
                            __v: 0,
                          },
                          nombre: 'Auriculares inalámbricos',
                          cantidad: 2,
                          precioHistorico: 50,
                        },
                      ],
                      total: 100,
                      estado: 'pendiente',
                      direccionEnvio: {
                        calle: 'Av. Corrientes 1234',
                        ciudad: 'Buenos Aires',
                        provincia: 'Buenos Aires',
                        codigoPostal: 'C1043',
                      },
                      createdAt: '2026-10-21T20:39:26.000Z',
                      updatedAt: '2026-10-21T20:39:26.000Z',
                      __v: 0,
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Falta el token de autenticación o es inválido/expiró.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                examples: {
                  missingToken: {
                    summary: 'Token requerido',
                    value: {
                      ok: false,
                      message: 'Token requerido',
                      error: null,
                    },
                  },
                  invalidToken: {
                    summary: 'Token inválido o expirado',
                    value: {
                      ok: false,
                      message: 'Token inválido o expirado',
                      error: 'jwt malformed',
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Error interno al obtener las órdenes del usuario.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  ok: false,
                  message: 'Ha ocurrido un error en el servidor',
                  error: 'Error interno del servidor',
                },
              },
            },
          },
        },
      },
    },
    ...orderAdminPaths,
    ...cartPaths,
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido al iniciar sesión.',
      },
    },
    schemas: {
      ...cartSchemas,
      ...orderAdminSchemas,
      CreateProductRequest: {
        type: 'object',
        required: ['nombre', 'precio', 'categoria'],
        properties: {
          nombre: {
            type: 'string',
            minLength: 1,
            example: 'Auriculares inalámbricos',
          },
          descripcion: {
            type: 'string',
            example: 'Auriculares Bluetooth con cancelación de ruido',
          },
          precio: {
            type: 'number',
            minimum: 0,
            example: 89.99,
          },
          stock: {
            type: 'integer',
            minimum: 0,
            default: 0,
            example: 12,
          },
          categoria: {
            type: 'string',
            enum: ['accesorios', 'perifericos', 'gadgets'],
            example: 'gadgets',
          },
          imagenUrl: {
            type: 'string',
            example: 'https://example.com/auriculares.jpg',
          },
        },
      },
      UpdateProductRequest: {
        type: 'object',
        minProperties: 1,
        description: 'Se envían solo los campos a modificar; al menos uno.',
        properties: {
          nombre: {
            type: 'string',
            minLength: 1,
            example: 'Auriculares inalámbricos Pro',
          },
          descripcion: {
            type: 'string',
            example: 'Auriculares Bluetooth con cancelación de ruido',
          },
          precio: {
            type: 'number',
            minimum: 0,
            example: 79.99,
          },
          stock: {
            type: 'integer',
            minimum: 0,
            example: 20,
          },
          categoria: {
            type: 'string',
            enum: ['accesorios', 'perifericos', 'gadgets'],
            example: 'gadgets',
          },
          imagenUrl: {
            type: 'string',
            example: 'https://example.com/auriculares.jpg',
          },
        },
      },
      UserOrdersResponse: {
        type: 'object',
        required: ['ok', 'message', 'data'],
        properties: {
          ok: {
            type: 'boolean',
            enum: [true],
          },
          message: {
            type: 'string',
            example: 'Ordenes obtenidas correctamente',
          },
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/UserOrder',
            },
          },
        },
      },
      UserOrder: {
        type: 'object',
        required: [
          '_id',
          'userId',
          'items',
          'total',
          'estado',
          'direccionEnvio',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          _id: {
            type: 'string',
            description: 'Identificador de la orden en MongoDB.',
            example: '507f1f77bcf86cd799439020',
          },
          userId: {
            type: 'string',
            description: 'Identificador del usuario autenticado propietario de la orden.',
            example: '507f1f77bcf86cd799439099',
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['productId', 'nombre', 'cantidad', 'precioHistorico'],
              properties: {
                _id: {
                  type: 'string',
                  description: 'Identificador del subdocumento del ítem.',
                },
                productId: {
                  description: 'Producto asociado, poblado con sus datos actuales.',
                  nullable: true,
                  allOf: [
                    {
                      $ref: '#/components/schemas/Product',
                    },
                  ],
                },
                nombre: {
                  type: 'string',
                  description: 'Nombre del producto al momento de la compra.',
                  example: 'Auriculares inalámbricos',
                },
                cantidad: {
                  type: 'integer',
                  example: 2,
                },
                precioHistorico: {
                  type: 'number',
                  description: 'Precio unitario al momento de la compra.',
                  example: 50,
                },
              },
            },
          },
          total: {
            type: 'number',
            example: 100,
          },
          estado: {
            type: 'string',
            enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado', 'confirmado'],
            example: 'pendiente',
          },
          direccionEnvio: {
            type: 'object',
            required: ['calle', 'ciudad', 'provincia', 'codigoPostal'],
            properties: {
              calle: {
                type: 'string',
                example: 'Av. Corrientes 1234',
              },
              ciudad: {
                type: 'string',
                example: 'Buenos Aires',
              },
              provincia: {
                type: 'string',
                example: 'Buenos Aires',
              },
              codigoPostal: {
                type: 'string',
                example: 'C1043',
              },
            },
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
      CreateOrderRequest: {
        type: 'object',
        required: ['items', 'total', 'direccionEnvio'],
        properties: {
          items: {
            type: 'array',
            minItems: 1,
            description:
              'Productos solicitados. No se permiten IDs de producto duplicados; agrupa las unidades en cantidad.',
            items: {
              type: 'object',
              required: ['productId', 'cantidad'],
              properties: {
                productId: {
                  type: 'string',
                  minLength: 1,
                  description: 'ID del producto existente.',
                  example: '507f1f77bcf86cd799439011',
                },
                cantidad: {
                  type: 'integer',
                  minimum: 1,
                  example: 2,
                },
              },
            },
          },
          total: {
            type: 'number',
            minimum: 0,
            description:
              'Total declarado de la compra; debe coincidir exactamente con la suma de los precios vigentes por cantidad.',
            example: 100,
          },
          direccionEnvio: {
            type: 'object',
            required: ['calle', 'ciudad', 'provincia', 'codigoPostal'],
            properties: {
              calle: {
                type: 'string',
                minLength: 1,
                example: 'Av. Corrientes 1234',
              },
              ciudad: {
                type: 'string',
                minLength: 1,
                example: 'Buenos Aires',
              },
              provincia: {
                type: 'string',
                minLength: 1,
                example: 'Buenos Aires',
              },
              codigoPostal: {
                type: 'string',
                minLength: 1,
                example: 'C1043',
              },
            },
          },
        },
      },
      CreateOrderResponse: {
        type: 'object',
        required: ['ok', 'message', 'data'],
        properties: {
          ok: {
            type: 'boolean',
            enum: [true],
          },
          message: {
            type: 'string',
            example: 'Compra realizada correctamente',
          },
          data: {
            $ref: '#/components/schemas/Order',
          },
        },
      },
      Order: {
        type: 'object',
        required: [
          '_id',
          'userId',
          'items',
          'total',
          'estado',
          'direccionEnvio',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          _id: {
            type: 'string',
            description: 'Identificador de la orden en MongoDB.',
            example: '507f1f77bcf86cd799439020',
          },
          userId: {
            type: 'string',
            description: 'ID del usuario autenticado que creó la orden.',
            example: '507f1f77bcf86cd799439099',
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['productId', 'nombre', 'cantidad', 'precioHistorico'],
              properties: {
                _id: {
                  type: 'string',
                  description: 'Identificador del subdocumento de producto dentro de la orden.',
                  example: '507f1f77bcf86cd799439021',
                },
                productId: {
                  type: 'string',
                  description: 'ID del producto comprado.',
                  example: '507f1f77bcf86cd799439011',
                },
                nombre: {
                  type: 'string',
                  description: 'Nombre del producto al momento de la compra.',
                  example: 'Auriculares inalámbricos',
                },
                cantidad: {
                  type: 'integer',
                  example: 2,
                },
                precioHistorico: {
                  type: 'number',
                  description: 'Precio unitario al momento de la compra.',
                  example: 50,
                },
              },
            },
          },
          total: {
            type: 'number',
            example: 100,
          },
          estado: {
            type: 'string',
            enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado', 'confirmado'],
            example: 'pendiente',
          },
          direccionEnvio: {
            type: 'object',
            required: ['calle', 'ciudad', 'provincia', 'codigoPostal'],
            properties: {
              calle: {
                type: 'string',
                example: 'Av. Corrientes 1234',
              },
              ciudad: {
                type: 'string',
                example: 'Buenos Aires',
              },
              provincia: {
                type: 'string',
                example: 'Buenos Aires',
              },
              codigoPostal: {
                type: 'string',
                example: 'C1043',
              },
            },
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
      ProductsListResponse: {
        type: 'object',
        required: ['ok', 'message', 'data'],
        properties: {
          ok: {
            type: 'boolean',
            enum: [true],
          },
          message: {
            type: 'string',
            example: 'Productos encontrados',
          },
          data: {
            type: 'object',
            required: ['products', 'totalProducts'],
            properties: {
              products: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/ProductListItem',
                },
              },
              totalProducts: {
                type: 'integer',
                description: 'Cantidad total de productos que coinciden con los filtros.',
                example: 1,
              },
            },
          },
        },
      },
      ProductListItem: {
        type: 'object',
        required: ['_id', 'nombre', 'precio', 'stock', 'categoria', 'createdAt', 'updatedAt'],
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
            example: 89,
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
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
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
