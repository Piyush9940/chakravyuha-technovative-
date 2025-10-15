import { TRACKING_CONFIG } from "../utils/constants.js";

export const initTrackingSocket = (io) => {
  
  const trackingNamespace = io.of("/tracking");

  trackingNamespace.on("connection", (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

     
    socket.on("joinDeliveryRoom", ({ deliveryId, role }) => {
      socket.join(deliveryId);
      console.log(`[SOCKET] ${role} joined room: ${deliveryId}`);
    });

    
    socket.on("driverLocationUpdate", ({ deliveryId, latitude, longitude }) => {
      if (!deliveryId || !latitude || !longitude) return;

      const payload = { deliveryId, latitude, longitude, timestamp: new Date() };

      
      trackingNamespace.to(deliveryId).emit("liveTracking", payload);

       
      setTimeout(() => {
        trackingNamespace.to(deliveryId).emit("customerTracking", payload);
      }, TRACKING_CONFIG.CUSTOMER_DELAY_MINUTES * 60 * 1000); // e.g., 30 minutes
    });

    socket.on("disconnect", () => {
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
  });
};
