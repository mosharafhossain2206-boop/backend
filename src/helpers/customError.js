class customError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.message = message || "Error Occured Try Again !!";
    this.status =
      statusCode >= 400 && statusCode < 500 ? "Client Error" : "server Error";
    this.statusCode = statusCode || 500;
    this.isOperationalError =
      statusCode >= 400 && statusCode < 500 ? false : true;
    this.data = null;
    this.stack;
  }
}
module.exports = { customError };
