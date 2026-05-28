export function notFound(request, response, next) {
  const error = new Error(`Route not found: ${request.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _request, response, _next) {
  const isValidationError = error.name === "ValidationError" || error.name === "CastError";
  const isDuplicateKeyError = error.code === 11000;
  const statusCode = error.statusCode || (isValidationError ? 400 : isDuplicateKeyError ? 409 : 500);
  const message = isDuplicateKeyError
    ? "Duplicate value already exists."
    : error.message || "Server error.";

  response.status(statusCode).json({
    message,
  });
}
