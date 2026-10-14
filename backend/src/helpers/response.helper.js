export const successResponse = (res, data = null, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    ok: true,
    message,
    data
  });
};

export const errorResponse = (res, error, defaultMessage = 'Ha ocurrido un error en el servidor', defaultStatusCode = 500) => {
  // Si el error trae su propio statusCode, lo usamos. Si no, usamos el por defecto.
  const statusCode = error?.statusCode || defaultStatusCode;
  const message = error?.statusCode ? error.message : defaultMessage;

  console.error(`[Error de Servidor]: ${error?.message || error}`);

  return res.status(statusCode).json({
    ok: false,
    message,
    error: error?.message || error || null
  });
};
