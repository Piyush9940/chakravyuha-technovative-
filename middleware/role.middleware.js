 
export const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Check if user data exists (from auth.middleware.js)
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Missing user or role information",
        });
      }

      
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access Denied: Requires one of the following roles: [${allowedRoles.join(", ")}]`,
        });
      }

       
      next();
    } catch (err) {
      console.error("Role Middleware Error:", err.message);
      res.status(500).json({ success: false, message: "Server error in role middleware" });
    }
  };
};
