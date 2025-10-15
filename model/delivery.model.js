import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  deliveryId: {
    type: String,
    required: true,
    unique: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // assuming User model stores driver info
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  customerLocation: {
    type: {
      latitude: Number,
      longitude: Number,
    },
    required: true,
  },
  delayedCustomerLocation: {
    type: {
      latitude: Number,
      longitude: Number,
    },
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
  },
  isOtpVerified: {
    type: Boolean,
    default: false,
  },
  podImage: {
    type: String, // Cloudinary image URL
  },
  geoFenceArea: {
    type: {
      latitude: Number,
      longitude: Number,
      radius: Number, // in meters
    },
  },
  isWithinGeoFence: {
    type: Boolean,
    default: false,
  },
  deliveryStatus: {
    type: String,
    enum: ["Pending", "In Transit", "Delivered", "Failed"],
    default: "Pending",
  },
  driverLocation: {
    type: {
      latitude: Number,
      longitude: Number,
    },
  },
  tripStartedAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
}, { timestamps: true });

export default mongoose.model("Delivery", deliverySchema);
