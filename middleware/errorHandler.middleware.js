export const errorHandler = (err, req, res, next) => {
  console.error("🔥 ERROR:", err.stack || err.message);
  res.status(500).json({ success: false, message: "Internal Server Error" });
};
const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
 (process.env.NODE_ENV === "development" && { stack: err.stack })
 export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};