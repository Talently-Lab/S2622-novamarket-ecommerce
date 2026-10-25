// Documentación Swagger de los endpoints de pedidos para ADMIN (/api/orders).
// Se importa en swagger.js:
//   - getAllOrdersOperation se agrega como "get" dentro del path '/orders/' (que ya tiene el "post").
//   - orderAdminPaths y orderAdminSchemas se "esparcen" en paths y schemas.
// El tag 'Órdenes' ya existe en swagger.js, no hace falta uno nuevo.

import { ORDER_STATUSES } from '../models/Order.js';

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

const forbidden = jsonError('El usuario autenticado no tiene el rol admin.', {
  ok: false,
  message: 'No tienes permisos para realizar esta acción',
  error: null,
});

const serverError = jsonError('Error interno del servidor.', {
  ok: false,
  message: 'Ha ocurrido un error en el servidor',
  error: 'Error interno del servidor',
});

const security = [{ bearerAuth: [] }];

const orderIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Identificador del pedido. Debe ser un ObjectId de 24 caracteres hexadecimales.',
  schema: {
    type: 'string',
    pattern: '^[0-9a-fA-F]{24}$',
    example: '507f1f77bcf86cd799439020',
  },
};

const adminOrderExample = (estado = 'pendiente') => ({
  _id: '507f1f77bcf86cd799439020',
  userId: {
    _id: '507f1f77bcf86cd799439099',
    nombre: 'Ana Pérez',
    email: 'ana@example.com',
  },
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
  estado,
  direccionEnvio: {
    calle: 'Av. Corrientes 1234',
    ciudad: 'Buenos Aires',
    provincia: 'Buenos Aires',
    codigoPostal: 'C1043',
  },
  createdAt: '2026-10-21T20:39:26.000Z',
  updatedAt: '2026-10-21T20:39:26.000Z',
  __v: 0,
});

// GET /api/orders  -> se agrega como "get" dentro del path '/orders/' de swagger.js
export const getAllOrdersOperation = {
  tags: ['Órdenes'],
  summary: 'Listar todos los pedidos (admin)',
  description:
    'Devuelve TODOS los pedidos de la tienda, del más nuevo al más viejo. Ruta exclusiva para usuarios con rol admin. Cada pedido incluye en userId el nombre y el email del cliente. Si todavía no hay pedidos, data es un array vacío.',
  operationId: 'getAllOrders',
  security,
  responses: {
    200: {
      description: 'Pedidos obtenidos correctamente.',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/AdminOrdersResponse' },
          example: {
            ok: true,
            message: 'Pedidos obtenidos correctamente',
            data: [adminOrderExample('pendiente')],
          },
        },
      },
    },
    401: unauthorized,
    403: forbidden,
    500: serverError,
  },
};

// PUT /api/orders/{id}/status  y  GET /api/formdata/order-status
export const orderAdminPaths = {
  '/formdata/order-status': {
    get: {
      tags: ['Formularios'],
      summary: 'Obtener estados de pedidos',
      description:
        'Devuelve los estados posibles de un pedido en formato { value, label }, listo para armar el select del panel admin. Se leen del enum del modelo Order, por lo que el back es la única fuente de verdad. Ruta pública.',
      operationId: 'getOrderStatusOptions',
      responses: {
        200: {
          description: 'Estados de pedidos obtenidos correctamente.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrderStatusOptionsResponse' },
              example: {
                ok: true,
                message: 'Estados de pedidos',
                data: ORDER_STATUSES.map((value) => ({
                  value,
                  label: value.charAt(0).toUpperCase() + value.slice(1),
                })),
              },
            },
          },
        },
        500: serverError,
      },
    },
  },
  '/orders/{id}/status': {
    put: {
      tags: ['Órdenes'],
      summary: 'Actualizar el estado de un pedido (admin)',
      description: `Cambia el estado de un pedido. Ruta exclusiva para usuarios con rol admin. Estados válidos: ${ORDER_STATUSES.join(', ')}. Devuelve el pedido actualizado, con nombre y email del cliente en userId.`,
      operationId: 'updateOrderStatus',
      security,
      parameters: [orderIdParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateOrderStatusRequest' },
            example: { estado: 'enviado' },
          },
        },
      },
      responses: {
        200: {
          description: 'Estado del pedido actualizado correctamente.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateOrderStatusResponse' },
              example: {
                ok: true,
                message: 'Estado del pedido actualizado correctamente',
                data: adminOrderExample('enviado'),
              },
            },
          },
        },
        400: {
          description: 'El ID o el cuerpo no pasan la validación.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              examples: {
                invalidId: {
                  summary: 'ID inválido',
                  value: {
                    ok: false,
                    message: 'El ID del pedido debe ser un ObjectId válido',
                    error: null,
                  },
                },
                invalidStatus: {
                  summary: 'Estado inválido o faltante',
                  value: {
                    ok: false,
                    message: `El estado es requerido y debe ser uno de: ${ORDER_STATUSES.join(', ')}`,
                    error: null,
                  },
                },
              },
            },
          },
        },
        401: unauthorized,
        403: forbidden,
        404: jsonError('No existe un pedido con ese ID.', {
          ok: false,
          message: 'Pedido no encontrado',
          error: 'Pedido no encontrado',
        }),
        500: serverError,
      },
    },
  },
};

const direccionEnvioSchema = {
  type: 'object',
  required: ['calle', 'ciudad', 'provincia', 'codigoPostal'],
  properties: {
    calle: { type: 'string', example: 'Av. Corrientes 1234' },
    ciudad: { type: 'string', example: 'Buenos Aires' },
    provincia: { type: 'string', example: 'Buenos Aires' },
    codigoPostal: { type: 'string', example: 'C1043' },
  },
};

export const orderAdminSchemas = {
  OrderStatusOption: {
    type: 'object',
    required: ['value', 'label'],
    properties: {
      value: {
        type: 'string',
        enum: ORDER_STATUSES,
        description: 'Valor que el front debe enviar en el body de PUT /orders/{id}/status.',
        example: 'pendiente',
      },
      label: {
        type: 'string',
        description: 'Texto para mostrar en el select.',
        example: 'Pendiente',
      },
    },
  },
  OrderStatusOptionsResponse: {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
      ok: { type: 'boolean', enum: [true] },
      message: { type: 'string', example: 'Estados de pedidos' },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/OrderStatusOption' },
      },
    },
  },
  UpdateOrderStatusRequest: {
    type: 'object',
    required: ['estado'],
    properties: {
      estado: {
        type: 'string',
        enum: ORDER_STATUSES,
        description: 'Nuevo estado del pedido.',
        example: 'enviado',
      },
    },
  },
  AdminOrderUser: {
    type: 'object',
    description: 'Datos del cliente que hizo el pedido (userId poblado).',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439099' },
      nombre: { type: 'string', example: 'Ana Pérez' },
      email: { type: 'string', format: 'email', example: 'ana@example.com' },
    },
  },
  AdminOrderItem: {
    type: 'object',
    required: ['productId', 'nombre', 'cantidad', 'precioHistorico'],
    properties: {
      _id: {
        type: 'string',
        description: 'Identificador del subdocumento del ítem.',
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
      cantidad: { type: 'integer', example: 2 },
      precioHistorico: {
        type: 'number',
        description: 'Precio unitario al momento de la compra.',
        example: 50,
      },
    },
  },
  AdminOrder: {
    type: 'object',
    required: ['_id', 'userId', 'items', 'total', 'estado', 'direccionEnvio', 'createdAt', 'updatedAt'],
    properties: {
      _id: {
        type: 'string',
        description: 'Identificador del pedido en MongoDB.',
        example: '507f1f77bcf86cd799439020',
      },
      userId: {
        description: 'Cliente que hizo el pedido, poblado con nombre y email.',
        nullable: true,
        allOf: [{ $ref: '#/components/schemas/AdminOrderUser' }],
      },
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/AdminOrderItem' },
      },
      total: { type: 'number', example: 100 },
      estado: {
        type: 'string',
        enum: ORDER_STATUSES,
        example: 'pendiente',
      },
      direccionEnvio: direccionEnvioSchema,
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      __v: {
        type: 'integer',
        description: 'Versión del documento de MongoDB.',
        example: 0,
      },
    },
  },
  AdminOrdersResponse: {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
      ok: { type: 'boolean', enum: [true] },
      message: { type: 'string', example: 'Pedidos obtenidos correctamente' },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/AdminOrder' },
      },
    },
  },
  UpdateOrderStatusResponse: {
    type: 'object',
    required: ['ok', 'message', 'data'],
    properties: {
      ok: { type: 'boolean', enum: [true] },
      message: { type: 'string', example: 'Estado del pedido actualizado correctamente' },
      data: { $ref: '#/components/schemas/AdminOrder' },
    },
  },
};