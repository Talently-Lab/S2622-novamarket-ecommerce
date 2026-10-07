export const successResponse = (res, data = null, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    ok: true,
    message,
    data
  });
};

export const errorResponse = (res, error, message = 'Ha ocurrido un error en el servidor', statusCode = 500) => {
  console.error(`[Error de Servidor]: ${error?.message || error}, message: ${message}`);

  return res.status(statusCode).json({
    ok: false,
    message,
    error: error?.message || error || null
  });
};
