/**
 * ✅ Delay Job for Customer Tracking Updates
 * 
 * Sends location updates to customers after a configured delay.
 * Uses Node.js setTimeout or node-cron for scheduling.
 */

import { TRACKING_CONFIG } from "../utils/constants.js";

/**
 * Schedule delayed tracking update for customer
 * 
 * @param {object} io - Socket.IO server instance
 * @param {string} deliveryId - Delivery room ID
 * @param {object} payload - { latitude, longitude, timestamp }
 */
export const scheduleCustomerTracking = (io, deliveryId, payload) => {
  // Delay in milliseconds
  const delayMs = TRACKING_CONFIG.CUSTOMER_DELAY_MINUTES * 60 * 1000;

  setTimeout(() => {
    io.of("/tracking").to(deliveryId).emit("customerTracking", payload);
    console.log(
      `[DELAY JOB] Sent delayed tracking for delivery ${deliveryId} at ${new Date().toISOString()}`
    );
  }, delayMs);
};
