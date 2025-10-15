import otpGenerator from "otp-generator";
import crypto from "crypto";
export const generateOtp=(length=6,type="numeric")=>{
    const otp = otpGenerator.generate(length, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
    digits: true,
  });
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  return { otp, otpHash, expiresAt };
  
};
export const verifyOTP = (enteredOTP, storedHash) => {
  const enteredHash = crypto.createHash("sha256").update(enteredOTP).digest("hex");
  return enteredHash === storedHash;
};
