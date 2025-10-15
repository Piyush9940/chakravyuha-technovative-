import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";
import { geoFenceMiddleware } from "../middleware/geofence.middleware.js";
import {uploadImage} from "../middleware/upload.middleware.js";

import {
  createDelivery,
  updateDeliveryStatus,
  getAllDeliveries,
  getDeliveryById,
  assignDriver,
  completeDelivery,
  uploadPOD,
} from "../controller/delivery.controller.js";

const router = express.Router();

/**
 * 🚚 Create a new delivery
 * Access: Admin / Dispatcher
 */
router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["admin", "dispatcher"]),
  createDelivery
);

/**
 * 📦 Get all deliveries
 * Access: Admin / Dispatcher
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "dispatcher"]),
  getAllDeliveries
);

/**
 * 🔍 Get delivery by ID
 * Access: Admin / Dispatcher / Driver
 */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "dispatcher", "driver"]),
  getDeliveryById
);

/**
 * 👷 Assign a driver to a delivery
 * Access: Admin / Dispatcher
 */
router.put(
  "/assign/:id",
  authMiddleware,
  roleMiddleware(["admin", "dispatcher"]),
  assignDriver
);

/**
 * 🚦 Update delivery status (In Transit, Delayed, Failed, etc.)
 * Access: Driver
 */
router.put(
  "/status/:id",
  authMiddleware,
  roleMiddleware(["driver"]),
  geoFenceMiddleware,
  updateDeliveryStatus
);

/**
 * ✅ Mark delivery as completed
 * Access: Driver
 */
router.put(
  "/complete/:id",
  authMiddleware,
  roleMiddleware(["driver"]),
  geoFenceMiddleware,
  completeDelivery
);

/**
 * 📸 Upload Proof of Delivery (POD)
 * Access: Driver
 */
router.post(
  "/pod/:id",
  authMiddleware,
  roleMiddleware(["driver"]),
  uploadImage.single("podImage"),
  uploadPOD
);

const deliveryRouter = router;
export default deliveryRouter;

