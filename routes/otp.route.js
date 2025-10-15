import express from "express";
import { authMiddleware} from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";
import {
  generateOTP,
  verifyOTP,
  resendOTP,
} from "../controller/otp.controller.js";

const router = express.Router();

/**
 * 📩 Generate and send OTP to customer
 * Access: Driver
 */
router.post(
  "/generate",
  authMiddleware,
  roleMiddleware("driver"),
  generateOTP
);

/**
 * ✅ Verify OTP entered by customer
 * Access: Customer
 */
router.post(
  "/verify",
  authMiddleware,
  roleMiddleware("customer"),
  verifyOTP
);

/**
 * 🔄 Resend OTP (if expired or lost)
 * Access: Customer
 */
router.post(
  "/resend",
  authMiddleware,
  roleMiddleware("customer"),
  resendOTP
);

const otpRouter = router;
export default otpRouter;

 
