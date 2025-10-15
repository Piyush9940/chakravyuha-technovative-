import cron from "node-cron";
import moment from "moment";
import Delivery from "../models/delivery.model.js";
import User from "../models/user.model.js";
import { CLOUDINARY_CONFIG } from "../utils/constants.js";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config(CLOUDINARY_CONFIG);

// 🧹 Scheduled Cleanup Job (runs every day at midnight)
export const initCleanupJob = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("🧹 Running daily cleanup job at", new Date().toISOString());

      const cutoff = moment().subtract(30, "days").toDate();

      // 1️⃣ Delete old completed deliveries (older than 30 days)
      const oldDeliveries = await Delivery.deleteMany({
        status: "Delivered",
        updatedAt: { $lt: cutoff },
      });

      // 2️⃣ Clear expired OTPs (older than 10 minutes)
      const expiredUsers = await User.updateMany(
        { "otp.timestamp": { $lt: moment().subtract(10, "minutes").toDate() } },
        { $unset: { otp: 1 } }
      );

      // 3️⃣ (Optional) Remove old proof images from Cloudinary
      const imagesToDelete = []; // Push image public_ids here if needed
      for (const imageId of imagesToDelete) {
        await cloudinary.uploader.destroy(imageId);
      }

      // 4️⃣ Log cleanup summary
      console.log(`✅ Cleanup completed:
      • ${oldDeliveries.deletedCount} old deliveries removed
      • ${expiredUsers.modifiedCount} expired OTPs cleared
      • ${imagesToDelete.length} Cloudinary images deleted`);
    },
    {
      timezone: "UTC",
    }
  );
};
