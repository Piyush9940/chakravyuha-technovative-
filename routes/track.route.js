import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";
import {
  startTracking,
  updateLocation,
  stopTracking,
  getTrackingById,
  getAllActiveTracking,
  deleteTracking,
} from "../controller/tracking.controller.js"; // changed "controllers" → "controller"

const router = express.Router();

/**
 * 🛰️ Start tracking a delivery
 * Access: Driver
 */
router.post(
  "/start",
  authMiddleware,
  roleMiddleware("driver"),
  startTracking
);

/**
 * 📍 Update live location
 * Access: Driver
 */
router.put(
  "/update/:trackingId",
  authMiddleware,
  roleMiddleware("driver"),
  updateLocation
);

/**
 * 🛑 Stop tracking (delivery completed)
 * Access: Driver
 */
router.put(
  "/stop/:trackingId",
  authMiddleware,
  roleMiddleware("driver"),
  stopTracking
);

/**
 * 🔍 Get tracking by ID
 * Access: Admin / Dispatcher / Driver
 */
router.get(
  "/:trackingId",
  authMiddleware,
  roleMiddleware("admin", "dispatcher", "driver"),
  getTrackingById
);

/**
 * 📄 Get all active tracking records
 * Access: Admin / Dispatcher / Operator
 */
router.get(
  "/active",
  authMiddleware,
  roleMiddleware("admin", "dispatcher", "operator"),
  getAllActiveTracking
);

/**
 * 🗑️ Delete tracking record
 * Access: Admin
 */
router.delete(
  "/:trackingId",
  authMiddleware,
  roleMiddleware("admin"),
  deleteTracking
);

const trackingRouter = router;
export default trackingRouter;

 
