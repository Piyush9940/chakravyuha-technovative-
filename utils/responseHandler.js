/**
 * ✅ Response Handler Utility
 * Provides a consistent structure for success and error responses
 * throughout the backend.
 */

/**
 * Send success response
 * 
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Success message
 * @param {object} [data] - Optional data payload
 */
export const successResponse = (res, statusCode = 200, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send error response
 * 
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Error message
 * @param {object} [error] - Optional error details
 */
export const errorResponse = (res, statusCode = 500, message, error = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

/**
 * Handle validation or missing fields
 * 
 * @param {object} res - Express response object
 * @param {string[]} fields - Array of missing or invalid fields
 */
export const validationError = (res, fields = []) => {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    missingFields: fields,
  });
};
