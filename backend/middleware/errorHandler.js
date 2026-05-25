const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') console.error('[ERROR]', err.stack);

  if (err.name === 'CastError')       { statusCode = 404; message = `Resource not found: ${err.value}`; }
  if (err.code === 11000)             { statusCode = 400; message = `${Object.keys(err.keyValue)[0]} already exists`; }
  if (err.name === 'ValidationError') { statusCode = 400; message = Object.values(err.errors).map(e => e.message).join('. '); }
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token expired'; }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
