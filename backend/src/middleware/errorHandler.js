export function notFoundHandler(_req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
}
