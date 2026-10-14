import { errorResponse } from "../helpers/response.helper.js";

export const validateBody = (schema) => {
  return (req, res, next) => {

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return errorResponse(res,null,result.error.issues[0].message,400);
    }
    req.body = result.data;
    next();
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return errorResponse(res,null,result.error.issues[0].message,400);
    }
    req.params = result.data;
    next();
  }
}