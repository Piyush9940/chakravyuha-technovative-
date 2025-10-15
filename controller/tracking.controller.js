import Tracking from "../models/tracking.model.js";
import Delivery from "../models/delivery.model.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";


export const startTracking = async (req, res) => {
  try {
    const { deliveryId, vehicleId, latitude, longitude } = req.body;

    if (!deliveryId || !vehicleId || !latitude || !longitude) {
      return errorResponse(res, "All fields are required", 400);
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return errorResponse(res, "Delivery not found", 404);

    const tracking = await Tracking.create({
      deliveryId,
      vehicleId,
      currentLocation: { latitude, longitude },
      status: "active",
      startedAt: new Date(),
    });

    delivery.status = "in-transit";
    await delivery.save();

    req.io.emit("trackingStarted", { tracking });

    return successResponse(res, tracking, "Tracking started successfully");
  } catch (error) {
    console.error("❌ Error in startTracking:", error);
    return errorResponse(res, "Failed to start tracking");
  }
};

 
export const updateLocation = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { latitude, longitude, speed } = req.body;

    if (!latitude || !longitude)
      return errorResponse(res, "Latitude and longitude are required", 400);

    const tracking = await Tracking.findById(trackingId);
    if (!tracking) return errorResponse(res, "Tracking record not found", 404);

    tracking.currentLocation = { latitude, longitude };
    if (speed) tracking.speed = speed;
    tracking.lastUpdated = new Date();
    await tracking.save();

    
    req.io.emit("locationUpdate", {
      trackingId,
      latitude,
      longitude,
      speed: speed || 0,
    });

    return successResponse(res, tracking, "Location updated successfully");
  } catch (error) {
    console.error("❌ Error in updateLocation:", error);
    return errorResponse(res, "Failed to update location");
  }
};

 
export const stopTracking = async (req, res) => {
  try {
    const { trackingId } = req.params;

    const tracking = await Tracking.findById(trackingId);
    if (!tracking) return errorResponse(res, "Tracking record not found", 404);

    tracking.status = "completed";
    tracking.endedAt = new Date();
    await tracking.save();

    const delivery = await Delivery.findById(tracking.deliveryId);
    if (delivery) {
      delivery.status = "delivered";
      await delivery.save();
    }

    req.io.emit("trackingStopped", { trackingId });

    return successResponse(res, tracking, "Tracking stopped successfully");
  } catch (error) {
    console.error("❌ Error in stopTracking:", error);
    return errorResponse(res, "Failed to stop tracking");
  }
};

 
export const getTrackingById = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const tracking = await Tracking.findById(trackingId).populate("deliveryId");

    if (!tracking) return errorResponse(res, "Tracking record not found", 404);

    return successResponse(res, tracking, "Tracking data fetched successfully");
  } catch (error) {
    console.error("❌ Error in getTrackingById:", error);
    return errorResponse(res, "Failed to fetch tracking details");
  }
};

 
export const getAllActiveTracking = async (req, res) => {
  try {
    const activeTracking = await Tracking.find({ status: "active" }).populate("deliveryId");
    return successResponse(res, activeTracking, "Active tracking records fetched successfully");
  } catch (error) {
    console.error("❌ Error in getAllActiveTracking:", error);
    return errorResponse(res, "Failed to fetch tracking records");
  }
};

 
export const deleteTracking = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const tracking = await Tracking.findById(trackingId);

    if (!tracking) return errorResponse(res, "Tracking record not found", 404);

    await tracking.deleteOne();
    return successResponse(res, null, "Tracking record deleted successfully");
  } catch (error) {
    console.error("❌ Error in deleteTracking:", error);
    return errorResponse(res, "Failed to delete tracking record");
  }
};
