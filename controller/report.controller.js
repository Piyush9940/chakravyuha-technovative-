import Delivery from "../models/delivery.model.js";
import User from "../models/user.model.js";
import Tracking from "../models/tracking.model.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";

/**
 * 📦 Generate delivery summary report
 * - Shows total deliveries, completed, pending, failed, and success rate
 */
export const getDeliverySummary = async (req, res) => {
  try {
    const totalDeliveries = await Delivery.countDocuments();
    const completed = await Delivery.countDocuments({ status: "Delivered" });
    const inTransit = await Delivery.countDocuments({ status: "In Transit" });
    const pending = await Delivery.countDocuments({ status: "Pending" });
    const failed = await Delivery.countDocuments({ status: "Failed" });

    const successRate = totalDeliveries
      ? ((completed / totalDeliveries) * 100).toFixed(2)
      : 0;

    const summary = {
      totalDeliveries,
      completed,
      inTransit,
      pending,
      failed,
      successRate: `${successRate}%`,
      generatedAt: new Date(),
    };

    return successResponse(res, summary, "Delivery summary generated successfully");
  } catch (error) {
    console.error("❌ Error in getDeliverySummary:", error);
    return errorResponse(res, "Failed to generate delivery summary");
  }
};

/**
 * 🚚 Driver performance report
 * - Lists drivers with completed deliveries and average success rate
 */
export const getDriverPerformance = async (req, res) => {
  try {
    const drivers = await User.find({ role: "driver" });

    const report = await Promise.all(
      drivers.map(async (driver) => {
        const deliveries = await Delivery.find({ assignedDriver: driver._id });
        const total = deliveries.length;
        const completed = deliveries.filter((d) => d.status === "Delivered").length;
        const failed = deliveries.filter((d) => d.status === "Failed").length;
        const successRate = total ? ((completed / total) * 100).toFixed(2) : 0;

        return {
          driverId: driver._id,
          driverName: driver.name,
          totalDeliveries: total,
          completed,
          failed,
          successRate: `${successRate}%`,
        };
      })
    );

    return successResponse(res, report, "Driver performance report generated successfully");
  } catch (error) {
    console.error("❌ Error in getDriverPerformance:", error);
    return errorResponse(res, "Failed to generate driver performance report");
  }
};

/**
 * 🛰️ Tracking analytics report
 * - Shows currently active trips and average trip duration
 */
export const getTrackingAnalytics = async (req, res) => {
  try {
    const activeTracking = await Tracking.find({ status: "active" });
    const completedTracking = await Tracking.find({ status: "completed" });

    // Calculate average duration of completed trips
    let totalDuration = 0;
    let count = 0;
    for (const t of completedTracking) {
      if (t.startedAt && t.endedAt) {
        totalDuration += (t.endedAt - t.startedAt) / 1000 / 60; // minutes
        count++;
      }
    }

    const averageDuration = count ? (totalDuration / count).toFixed(2) : 0;

    const data = {
      activeTrips: activeTracking.length,
      completedTrips: completedTracking.length,
      averageTripDuration: `${averageDuration} mins`,
      lastUpdated: new Date(),
    };

    return successResponse(res, data, "Tracking analytics generated successfully");
  } catch (error) {
    console.error("❌ Error in getTrackingAnalytics:", error);
    return errorResponse(res, "Failed to generate tracking analytics");
  }
};

/**
 * 🧭 Comprehensive system report (for dashboard overview)
 * - Combines delivery, driver, and tracking data
 */
export const getSystemReport = async (req, res) => {
  try {
    const [deliverySummary, trackingAnalytics] = await Promise.all([
      Delivery.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Tracking.find({ status: "active" }),
    ]);

    const totalDrivers = await User.countDocuments({ role: "driver" });
    const totalCustomers = await User.countDocuments({ role: "customer" });

    const report = {
      deliveriesByStatus: deliverySummary.reduce((acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      }, {}),
      activeTracking: trackingAnalytics.length,
      totalDrivers,
      totalCustomers,
      generatedAt: new Date(),
    };

    return successResponse(res, report, "System report generated successfully");
  } catch (error) {
    console.error("❌ Error in getSystemReport:", error);
    return errorResponse(res, "Failed to generate system report");
  }
};

/**
 * 🕒 Generate report for a specific date range
 * Example: From 2025-10-01 to 2025-10-15
 */
export const getReportByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate)
      return errorResponse(res, "Start and end dates are required", 400);

    const deliveries = await Delivery.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    const summary = {
      totalDeliveries: deliveries.length,
      completed: deliveries.filter((d) => d.status === "Delivered").length,
      failed: deliveries.filter((d) => d.status === "Failed").length,
      inTransit: deliveries.filter((d) => d.status === "In Transit").length,
      pending: deliveries.filter((d) => d.status === "Pending").length,
    };

    return successResponse(res, summary, "Report generated for the selected date range");
  } catch (error) {
    console.error("❌ Error in getReportByDateRange:", error);
    return errorResponse(res, "Failed to generate report by date range");
  }
};
