// class AppError inherits from built in Error
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // calling super means calling the parent class in this case the built in Error class
    this.statusCode = statusCode;
    this.success = false;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
