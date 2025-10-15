import otpGenerator from "otp-generator";
import Delivery from "../model/delivery.model.js";

import { successResponse, errorResponse } from "../utils/responseHandler.js";

/**
 * 📩 Generate and send OTP to customer (for Proof of Delivery)
 */
export const generateOTP = async (req, res) => {
  try {
    const { deliveryId, contactMethod } = req.body; // contactMethod = 'email' or 'sms'

    if (!deliveryId || !contactMethod) {
      return errorResponse(res, "Delivery ID and contact method are required", 400);
    }

    const delivery = await Delivery.findById(deliveryId).populate("customerId");
    if (!delivery) return errorResponse(res, "Delivery not found", 404);

    // Generate 6-digit numeric OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      alphabets: false,
    });

    // Save OTP with expiration (5 min)
    delivery.otp = otp;
    delivery.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await delivery.save();

    // Send OTP via preferred contact method
    const customer = delivery.customerId;
    if (contactMethod === "email" && customer?.email) {
      await sendEmail({
        to: customer.email,
        subject: "Your Delivery OTP - Proof of Delivery Verification",
        text: `Your OTP for delivery ID ${delivery.deliveryId} is: ${otp}. It is valid for 5 minutes.`,
      });
    } else if (contactMethod === "sms" && customer?.phone) {
      await sendSMS(
        customer.phone,
        `Your OTP for delivery ID ${delivery.deliveryId} is: ${otp}. It is valid for 5 minutes.`
      );
    } else {
      return errorResponse(res, "Customer contact information not available", 400);
    }

    return successResponse(res, { deliveryId, otp }, "OTP sent successfully");
  } catch (error) {
    console.error("❌ Error in generateOTP:", error);
    return errorResponse(res, "Failed to generate and send OTP");
  }
};

/**
 * ✅ Verify OTP entered by customer
 */
export const verifyOTP = async (req, res) => {
  try {
    const { deliveryId, enteredOTP } = req.body;

    if (!deliveryId || !enteredOTP)
      return errorResponse(res, "Delivery ID and OTP are required", 400);

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return errorResponse(res, "Delivery not found", 404);

    // Check OTP validity
    if (!delivery.otp || !delivery.otpExpiresAt)
      return errorResponse(res, "No OTP generated for this delivery", 400);

    if (Date.now() > delivery.otpExpiresAt.getTime()) {
      return errorResponse(res, "OTP expired. Please request a new one.", 400);
    }

    if (enteredOTP !== delivery.otp) {
      return errorResponse(res, "Invalid OTP. Please try again.", 400);
    }

    // OTP verified successfully
    delivery.otpVerified = true;
    await delivery.save();

    return successResponse(res, { deliveryId }, "OTP verified successfully");
  } catch (error) {
    console.error("❌ Error in verifyOTP:", error);
    return errorResponse(res, "Failed to verify OTP");
  }
};

/**
 * 🧹 Resend OTP (if expired or lost)
 */
export const resendOTP = async (req, res) => {
  try {
    const { deliveryId, contactMethod } = req.body;
    if (!deliveryId || !contactMethod)
      return errorResponse(res, "Delivery ID and contact method are required", 400);

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return errorResponse(res, "Delivery not found", 404);

    // Generate new OTP
    const newOtp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      alphabets: false,
    });

    delivery.otp = newOtp;
    delivery.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await delivery.save();

    // Send OTP via preferred method
    const customer = await delivery.populate("customerId");
    if (contactMethod === "email" && customer?.customerId?.email) {
      await sendEmail({
        to: customer.customerId.email,
        subject: "Resent Delivery OTP",
        text: `Your new OTP for delivery ID ${delivery.deliveryId} is: ${newOtp}. It is valid for 5 minutes.`,
      });
    } else if (contactMethod === "sms" && customer?.customerId?.phone) {
      await sendSMS(
        customer.customerId.phone,
        `Your new OTP for delivery ID ${delivery.deliveryId} is: ${newOtp}. It is valid for 5 minutes.`
      );
    } else {
      return errorResponse(res, "Customer contact information not available", 400);
    }

    return successResponse(res, { deliveryId }, "OTP resent successfully");
  } catch (error) {
    console.error("❌ Error in resendOTP:", error);
    return errorResponse(res, "Failed to resend OTP");
  }
};
  