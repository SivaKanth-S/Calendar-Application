export function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
}

export function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

export function validateRange(startTime, endTime) {
  if (startTime && !isTime(startTime)) throw badRequest('start_time is invalid');
  if (endTime && !isTime(endTime)) throw badRequest('end_time is invalid');
  if (startTime && endTime && endTime <= startTime) throw badRequest('end_time must be after start_time');
}
