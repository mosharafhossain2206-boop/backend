const developementError = (error, res) => {
  const stausCode = error.statusCode || 500;
  return res.status(stausCode).json({
    message: error.message,
    status: error.status,
    statusCode: error.statusCode,
    isOperationalError: error.isOperationalError,
    data: error.data,
    errorTraceStack: error.stack,
  });
};

const productionError = (error, res) => {
  const stausCode = error.statusCode || 500;
  if (error.isOperationalError) {
    return res.status(stausCode).json({
      message: error.message,
      status: error.status,
    });
  } else {
    return res.status(500).json({
      message: "Server Failed Try Again!",
      status: error.status,
    });
  }
};

exports.globalErrorHanlder = (error, req, res, next) => {
  if (process.env.NODE_ENV == "developement") {
    developementError(error, res);
  } else {
    productionError(error, res);
  }
};
