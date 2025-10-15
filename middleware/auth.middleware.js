import jwt from "jsonwebtoken";

/**
 * ✅ Middleware: Authenticate JWT Token
 * Ensures the user is logged in before accessing protected routes.
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info (id, role) to request object

    next();
  } catch (err) {
    console.error("JWT Authentication Error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

 
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized access" });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Requires one of [${allowedRoles.join(", ")}] roles`,
        });
      }

      next();
    } catch (err) {
      console.error("Role Authorization Error:", err.message);
      res.status(500).json({ success: false, message: "Server error during authorization" });
    }
  };
};

 