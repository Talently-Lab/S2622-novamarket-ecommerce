// Documentación Swagger de los endpoints del carrito (/api/cart).
// Se importa y se "esparce" dentro de swagger.js (paths, schemas y tag).

const jsonError = (description, example, schemaRef = '#/components/schemas/ErrorResponse') => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: schemaRef },
      example,
    },
  },
});

const unauthorized = {
  description: 'Falta el token de autenticación o es inválido/expiró.',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        missingToken: {
          summary: 'Token requerido',
          value: { ok: false, message: 'Token requerido', error: null },
        },
        invalidToken: {
          summary: 'Token inválido o expirado',
          value: { ok: false, message: 'Token inválido o expirado', error: 'jwt malformed' },
        },
      },
    },
  },
};

const serverError = jsonError('Error interno del servidor.', {
  ok: false,
  message: 'Ha ocurrido un error en el servidor',
  error: 'Error interno del servidor',
});

const security = [{ bearerAuth: [] }];

const productIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  description:
    'ID del PRODUCTO dentro del carrito (no el ID del ítem). Debe ser un ObjectId de 24 caracteres hexadecimales.',
  schema: {
    type: 'string',
    pattern: '^[0-9a-fA-F]{24}$',
    example: '507f1f77bcf86cd799439011',
  },
};

const cartExample = (message) => ({
  ok: true,
  message,
  data: {
    items: [
      {
        productId: '507f1f77bcf86cd799439011',
        nombre: 'Auriculares inalámbricos',
        precio: 50,
        imagenUrl: 'https://example.com/auriculares.jpg',
        stock: 12,
        cantidad: 2,
        subtotal: 100,
      },
    ],
    totalUnidades: 2,
    total: 100,
    fechaCreacion: '2026-10-22T14:00:00.000Z',
    fechaActualizacion: '2026-10-22T14:05:00.000Z',
  },
});

const cartOk = (description, message) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/CartResponse' },
      example: cartExample(message),
    },
  },
});

export const cartTag = {
  name: 'Carrito',
  description: 'Gestión del carrito de compras del usuario autenticado.',
};

export const cartPaths = {
  '/cart/': {
    get: {
      tags: ['Carrito'],
      summary: 'Obtener productos del carrito',
      description:
        'Devuelve el carrito del usuario autenticado con los datos actuales de cada producto, el subtotal por ítem y el total. Los productos que fueron eliminados o desactivados no se incluyen. Si el carrito está vacío, items es un array vacío.',
      operationId: 'getCart',
      security,
      responses: {
        200: cartOk('Carrito obtenido correctamente.', 'Carrito obtenido correctamente'),
        401: unauthorized,
        404: jsonError('El usuario del token ya no existe.', {
          ok: false,
          message: 'Usuario no encontrado',
          error: 'Usuario no encontrado',
        }),
        500: serverError,
      },
    },
    post: {
      tags: ['Carrito'],
      summary: 'Agregar producto al carrito',
      description:
        'Suma un producto al carrito. Si el producto ya estaba en el carrito, se suma la cantidad enviada a la existente. Valida que el producto exista y esté activo, y que la cantidad total no supere el stock disponible. Si el carrito estaba vacío, se registra fechaCreacion y un CartEvent de tipo "creado". Devuelve el carrito actualizado.',
      operationId: 'addToCart',
      security,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddToCartRequest' },
            example: { productId: '507f1f77bcf86cd799439011', cantidad: 2 },
          },
        },
      },
      responses: {
        201: cartOk('Producto agregado al carrito.', 'Producto agregado al carrito'),
        400: {
          description: 'El cuerpo no pasa la validación.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              examples: {
                invalidId: {
                  summary: 'productId inválido',
                  value: { ok: false, message: 'El productId debe ser un ObjectId válido', error: null },
                },
                invalidQuantity: {
                  summary: 'Cantidad inválida',
                  value: { ok: false, message: 'La cantidad debe ser mayor a 0', error: null },
                },
              },
            },
          },
        },
        401: unauthorized,
        404: jsonError('No existe un producto activo con ese ID.', {
          ok: false,
          message: 'Producto no encontrado',
          error: 'Producto no encontrado',
        }),
        409: jsonError('La cantidad total en el carrito supera el stock disponible.', {
          ok: false,
          message: 'Stock insuficiente para Auriculares inalámbricos. Disponibles: 1',
          error: 'Stock insuficiente para Auriculares inalámbricos. Disponibles: 1',
        }),
        500: serverError,
      },
    },
    delete: {
      tags: ['Carrito'],
      summary: 'Vaciar el carrito completo',
      description:
        'Elimina todos los productos del carrito del usuario autenticado y reinicia fechaCreacion. Devuelve el carrito vacío.',
      operationId: 'clearCart',
      security,
      responses: {
        200: jsonError(
          'Carrito vaciado correctamente.',
          {
            ok: true,
            message: 'Carrito vaciado correctamente',
            data: {
              items: [],
              totalUnidades: 0,
              total: 0,
              fechaCreacion: null,
              fechaActualizacion: '2026-10-22T14:10:00.000Z',
            },
          },
          '#/components/schemas/CartResponse'
        ),
        401: unauthorized,
        404: jsonError('El usuario del token ya no existe.', {
          ok: false,
          message: 'Usuario no encontrado',
          error: 'Usuario no encontrado',
        }),
        500: serverError,
      },
    },
  },
  '/cart/{id}': {
    patch: {
      tags: ['Carrito'],
      summary: 'Actualizar cantidad de un producto del carrito',
      description:
        'Reemplaza la cantidad de un producto que ya está en el carrito (no la suma). Valida que la nueva cantidad no supere el stock. Devuelve el carrito actualizado.',
      operationId: 'updateCartItem',
      security,
      parameters: [productIdParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateCartItemRequest' },
            example: { cantidad: 3 },
          },
        },
      },
      responses: {
        200: cartOk('Producto del carrito actualizado.', 'Producto del carrito actualizado correctamente'),
        400: {
          description: 'El ID o el cuerpo no pasan la validación.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              examples: {
                invalidId: {
                  summary: 'ID inválido',
                  value: { ok: false, message: 'El ID del producto debe ser un ObjectId válido', error: null },
                },
                invalidQuantity: {
                  summary: 'Cantidad inválida',
                  value: { ok: false, message: 'La cantidad debe ser mayor a 0', error: null },
                },
              },
            },
          },
        },
        401: unauthorized,
        404: {
          description: 'El producto no está en el carrito o ya no existe/está inactivo.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              examples: {
                notInCart: {
                  summary: 'No está en el carrito',
                  value: {
                    ok: false,
                    message: 'El producto no está en el carrito',
                    error: 'El producto no está en el carrito',
                  },
                },
                productNotFound: {
                  summary: 'Producto inexistente o inactivo',
                  value: { ok: false, message: 'Producto no encontrado', error: 'Producto no encontrado' },
                },
              },
            },
          },
        },
        409: jsonError('La cantidad solicitada supera el stock disponible.', {
          ok: false,
          message: 'Stock insuficiente para Auriculares inalámbricos. Disponibles: 5',
          error: 'Stock insuficiente para Auriculares inalámbricos. Disponibles: 5',
        }),
        500: serverError,
      },
    },
    delete: {
      tags: ['Carrito'],
      summary: 'Borrar un producto del carrito',
      description:
        'Elimina un producto del carrito del usuario autenticado. Si el carrito queda vacío, se reinicia fechaCreacion. Devuelve el carrito actualizado.',
      operationId: 'removeCartItem',
      security,
      parameters: [productIdParam],
      responses: {
        200: cartOk('Producto eliminado del carrito.', 'Producto eliminado del carrito'),
        400: jsonError('El ID no es un ObjectId válido.', {
          ok: false,
          message: 'El ID del producto debe ser un ObjectId válido',
          error: null,
        }),
        401: unauthorized,
        404: jsonError('El producto no está en el carrito.', {
          ok: false,
          message: 'El producto no está en el carrito',
          error: 'El producto no está en el carrito',
        }),
        500: serverError,
      },
    },
  },
};

export const cartSchemas = {
  AddToCartRequest: {
    type: 'object',
    required: ['productId'],
    properties: {
      productId: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
        description: 'ID del producto a agregar.',
        example: '507f1f77bcf86cd799439011',
      },
      cantidad: {
        type: 'integer',
        minimum: 1,
        default: 1,
        description: 'Unidades a sumar. Por defecto: 1.',
        example: 2,
      },
    },
  },
  UpdateCartItemRequest: {
    type: 'object',
    required: ['cantidad'],
    properties: {
      cantidad: {
        type: 'integer',
        minimum: 1,
        description: 'Nueva cantidad (reemplaza la anterior).',
        example: 3,
      },
    },
  },
  CartItemDetail: {
    type: 'object',
    properties: {
      productId: { type: 'string', example: '507f1f77bcf86cd799439011' },
      nombre: { type: 'string', example: 'Auriculares inalámbricos' },
      precio: { type: 'number', description: 'Precio unitario vigente.', example: 50 },
      imagenUrl: { type: 'string', nullable: true, example: 'https://example.com/auriculares.jpg' },
      stock: { type: 'integer', description: 'Stock disponible actual.', example: 12 },
      cantidad: { type: 'integer', example: 2 },
      subtotal: { type: 'number', description: 'precio × cantidad.', example: 100 },
    },
  },
  CartDetail: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/CartItemDetail' },
      },
      totalUnidades: { type: 'integer', example: 2 },
      total: { type: 'number', example: 100 },
      fechaCreacion: { type: 'string', format: 'date-time', nullable: true },
      fechaActualizacion: { type: 'string', format: 'date-time', nullable: true },
    },
  },
  CartResponse: {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
      ok: { type: 'boolean', enum: [true] },
      message: { type: 'string', example: 'Carrito obtenido correctamente' },
      data: { $ref: '#/components/schemas/CartDetail' },
    },
  },
};
