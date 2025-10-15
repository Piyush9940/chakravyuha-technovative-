import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

// 🛠️ Initialize Twilio Client
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * 📤 Send SMS using Twilio
 * @param {string} to - Recipient phone number (with country code)
 * @param {string} message - Message content
 */
export const sendSMS = async (to, message) => {
  try {
    if (!to || !message) throw new Error("Phone number and message are required");

    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio registered number
      to,
    });

    console.log(`✅ SMS sent successfully to ${to}. SID: ${sms.sid}`);
    return sms;
  } catch (error) {
    console.error("❌ Error sending SMS via Twilio:", error.message);
    throw new Error("Failed to send SMS");
  }
};
