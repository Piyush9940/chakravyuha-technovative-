import Delivery from "../model/delivery.model.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";

/**
 * 🚚 Create a new delivery
 */
export const createDelivery = async (req, res) => {
  try {
    const {
      deliveryId,
      driverId,
      customerName,
      customerPhone,
      customerLocation,
      deliveryAddress,
      geoFenceArea,
    } = req.body;

    if (
      !deliveryId ||
      !driverId ||
      !customerName ||
      !customerPhone ||
      !customerLocation ||
      !deliveryAddress
    ) {
      return errorResponse(res, "All fields are required", 400);
    }

    const existingDelivery = await Delivery.findOne({ deliveryId });
    if (existingDelivery) {
      return errorResponse(res, "Delivery ID already exists", 400);
    }

    const newDelivery = await Delivery.create({
      deliveryId,
      driverId,
      customerName,
      customerPhone,
      customerLocation,
      deliveryAddress,
      geoFenceArea,
      deliveryStatus: "Pending",
    });

    return successResponse(res, newDelivery, "Delivery created successfully");
  } catch (error) {
    console.error("❌ Error in createDelivery:", error);
    return errorResponse(res, `Failed to create delivery: ${error.message}`);
  }
};

/**
 * 🔄 Update delivery status
 */
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;

    const delivery = await Delivery.findById(id);
    if (!delivery) return errorResponse(res, "Delivery not found", 404);

    delivery.deliveryStatus = deliveryStatus || delivery.deliveryStatus;

    if (deliveryStatus === "In Transit" && !delivery.tripStartedAt)
      delivery.tripStartedAt = new Date();

    if (deliveryStatus === "Delivered" && !delivery.deliveredAt)
      delivery.deliveredAt = new Date();

    await delivery.save();

    return successResponse(res, delivery, "Delivery status updated successfully");
  } catch (error) {
    console.error("❌ Error in updateDeliveryStatus:", error);
    return errorResponse(res, `Failed to update delivery status: ${error.message}`);
  }
};

/**
 * 👷 Assign a driver to a delivery
 */
export const assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    if (!driverId) return errorResponse(res, "Driver ID is required", 400);

    const delivery = await Delivery.findById(id);
    if (!delivery) return errorResponse(res, "Delivery not found", 404);

    delivery.driverId = driverId;
    await delivery.save();

    return successResponse(res, delivery, "Driver assigned successfully");
  } catch (error) {
    console.error("❌ Error in assignDriver:", error);
    return errorResponse(res, `Failed to assign driver: ${error.message}`);
  }
};

/**
 * ✅ Mark delivery as completed
 */
export const completeDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await Delivery.findById(id);
    if (!delivery) return errorResponse(res, "Delivery not found", 404);

    if (!req.geoFenceValidated) {
      return errorResponse(res, "Driver is outside the geofence area", 403);
    }

    delivery.deliveryStatus = "Delivered";
    delivery.deliveredAt = new Date();
    delivery.isWithinGeoFence = true;
    await delivery.save();

    return successResponse(res, delivery, "Delivery marked as completed");
  } catch (error) {
    console.error("❌ Error in completeDelivery:", error);
    return errorResponse(res, `Failed to complete delivery: ${error.message}`);
  }
};

/**
 * 📸 Upload Proof of Delivery (POD)
 */
export const uploadPOD = async (req, res) => {
  try {
    const { id } = req.params;
    const podImage = req.file?.path;

    if (!podImage) return errorResponse(res, "No image uploaded", 400);

    const delivery = await Delivery.findById(id);
    if (!delivery) return errorResponse(res, "Delivery not found", 404);

    delivery.podImage = podImage;
    delivery.deliveryStatus = "Delivered";
    delivery.deliveredAt = new Date();
    await delivery.save();

    return successResponse(res, delivery, "Proof of Delivery uploaded successfully");
  } catch (error) {
    console.error("❌ Error in uploadPOD:", error);
    return errorResponse(res, `Failed to upload POD: ${error.message}`);
  }
};

/**
 * 📦 Get all deliveries
 */
export const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find().populate("driverId", "name email role");
    return successResponse(res, deliveries, "Deliveries fetched successfully");
  } catch (error) {
    console.error("❌ Error in getAllDeliveries:", error);
    return errorResponse(res, `Failed to fetch deliveries: ${error.message}`);
  }
};

/**
 * 🔍 Get delivery by ID
 */
export const getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findById(id).populate("driverId", "name email role");

    if (!delivery) return errorResponse(res, "Delivery not found", 404);

    return successResponse(res, delivery, "Delivery fetched successfully");
  } catch (error) {
    console.error("❌ Error in getDeliveryById:", error);
    return errorResponse(res, `Failed to fetch delivery: ${error.message}`);
  }
};
