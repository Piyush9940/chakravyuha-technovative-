import Delivery from "../models/delivery.model.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import { scheduleCleanup } from "../jobs/cleanupJob.js";
import { scheduleDeliveryDelay } from "./jobs/delayJob.js";


export const createDelivery = async (req, res) => {
  try {
    const { packageId, sender, receiver, pickupLocation, dropLocation, eta } = req.body;

    if (!packageId || !sender || !receiver || !pickupLocation || !dropLocation || !eta) {
      return errorResponse(res, "All fields are required", 400);
    }

    const newDelivery = await Delivery.create({
      packageId,
      sender,
      receiver,
      pickupLocation,
      dropLocation,
      eta,
      status: "pending",
    });

     
    scheduleCleanup(newDelivery._id, eta);
    scheduleDeliveryDelay(newDelivery._id, eta);

    return successResponse(res, newDelivery, "Delivery created successfully");
  } catch (error) {
    console.error("❌ Error in createDelivery:", error);
    return errorResponse(res, "Failed to create delivery");
  }
};
 
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const delivery = await Delivery.findById(id);
    if (!delivery) return errorResponse(res, "Delivery not found", 404);

    delivery.status = status || delivery.status;
    await delivery.save();

    return successResponse(res, delivery, "Delivery status updated successfully");
  } catch (error) {
    console.error("❌ Error in updateDeliveryStatus:", error);
    return errorResponse(res, "Failed to update delivery status");
  }
};

 
export const updateDeliveryLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude)
      return errorResponse(res, "Latitude and longitude are required", 400);

    const delivery = await Delivery.findById(id);
    if (!delivery) return errorResponse(res, "Delivery not found", 404);

    delivery.currentLocation = { latitude, longitude };
    await delivery.save();

    
    req.io.emit("deliveryLocationUpdated", { id, latitude, longitude });

    return successResponse(res, delivery, "Delivery location updated successfully");
  } catch (error) {
    console.error("❌ Error in updateDeliveryLocation:", error);
    return errorResponse(res, "Failed to update location");
  }
};

 
export const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find();
    return successResponse(res, deliveries, "Deliveries fetched successfully");
  } catch (error) {
    console.error("❌ Error in getAllDeliveries:", error);
    return errorResponse(res, "Failed to fetch deliveries");
  }
};

 
export const getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findById(id);
    if (!delivery) return errorResponse(res, "Delivery not found", 404);

    return successResponse(res, delivery, "Delivery fetched successfully");
  } catch (error) {
    console.error("❌ Error in getDeliveryById:", error);
    return errorResponse(res, "Failed to fetch delivery");
  }
};

 
export const deleteDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findById(id);

    if (!delivery) return errorResponse(res, "Delivery not found", 404);

    await delivery.deleteOne();

    return successResponse(res, null, "Delivery deleted successfully");
  } catch (error) {
    console.error("❌ Error in deleteDelivery:", error);
    return errorResponse(res, "Failed to delete delivery");
  }
};
