export class AppError extends Error {
  constructor(message, code = "APP_ERROR", status = 500) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "AppError";
  }
}
export class ValidationError extends AppError {
  constructor(message) { super(message, "VALIDATION_ERROR", 400); this.name = "ValidationError"; }
}
export class AuthenticationError extends AppError {
  constructor(message = "Unauthorized") { super(message, "AUTH_ERROR", 401); this.name = "AuthenticationError"; }
}
export class AuthorizationError extends AppError {
  constructor(message = "Forbidden") { super(message, "FORBIDDEN", 403); this.name = "AuthorizationError"; }
}
export class NotFoundError extends AppError {
  constructor(message = "Not found") { super(message, "NOT_FOUND", 404); this.name = "NotFoundError"; }
}
export class DatabaseError extends AppError {
  constructor(message = "Database error") { super(message, "DB_ERROR", 500); this.name = "DatabaseError"; }
}
export function toErrorResponse(err, requestId) {
  const status = err.status || 500;
  const code = err.code || "INTERNAL";
  const message = status >= 500 ? "An internal error occurred" : err.message || "Error";
  return { success: false, error: { code, message, requestId: requestId || null } };
}
