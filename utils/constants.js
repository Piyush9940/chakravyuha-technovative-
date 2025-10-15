/**
 * ✅ Global Constants File
 * Centralized constants for roles, delivery statuses, messages, and configuration values.
 */

// ========================
// USER ROLES
// ========================
export const USER_ROLES = {
  MANAGER: "manager",
  DRIVER: "driver",
  OPERATOR: "operator",
  CUSTOMER: "customer",
};

// ========================
// DELIVERY STATUS
// ========================
export const DELIVERY_STATUS = {
  PENDING: "Pending",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  FAILED: "Failed",
};

// ========================
// OTP CONFIGURATION
// ========================
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRES_IN_MINUTES: 10, // OTP validity duration
};

// ========================
// TRACKING SETTINGS
// ========================
export const TRACKING_CONFIG = {
  CUSTOMER_DELAY_MINUTES: 30, // Customer view delay
  GEO_RADIUS_METERS: 100, // Allowed radius for geofence validation
  UPDATE_INTERVAL_SECONDS: 10, // GPS update interval
};

// ========================
// RESPONSE MESSAGES
// ========================
export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: "Login successful",
    LOGOUT_SUCCESS: "Logout successful",
    REGISTER_SUCCESS: "User registered successfully",
    INVALID_CREDENTIALS: "Invalid email or password",
    UNAUTHORIZED: "Access denied. Unauthorized user.",
    TOKEN_MISSING: "Authentication token is missing",
    TOKEN_INVALID: "Invalid or expired token",
  },
  DELIVERY: {
    CREATED: "Delivery created successfully",
    UPDATED: "Delivery updated successfully",
    DELETED: "Delivery deleted successfully",
    NOT_FOUND: "Delivery not found",
    ASSIGNED: "Driver assigned successfully",
    COMPLETED: "Delivery marked as completed",
    OTP_SENT: "OTP sent successfully",
    OTP_VERIFIED: "OTP verified successfully",
    OTP_INVALID: "Invalid or expired OTP",
    GEOFENCE_FAILED: "Delivery not within allowed geofence area",
  },
  GENERAL: {
    SERVER_ERROR: "Something went wrong on the server",
    VALIDATION_ERROR: "Missing or invalid input fields",
  },
};

// ========================
// CLOUDINARY SETTINGS (OPTIONAL)
// ========================
export const CLOUDINARY_CONFIG = {
  FOLDER: "pod_images",
  ALLOWED_FORMATS: ["jpg", "jpeg", "png"],
};

// ========================
// LOGGING TAGS
// ========================
export const LOG_TAGS = {
  AUTH: "[AUTH]",
  DELIVERY: "[DELIVERY]",
  GPS: "[GPS]",
  SYSTEM: "[SYSTEM]",
};
