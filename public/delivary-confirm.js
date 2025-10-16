/**
 * 📸 Upload Proof of Delivery with OTP verification
 * Access: Driver
 */
export const uploadPODWithVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp, location, customerPhone } = req.body;
    
    // Validate delivery exists
    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return errorResponse(res, "Delivery not found", 404);
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      phone: customerPhone,
      code: otp,
      deliveryId: id,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return errorResponse(res, "Invalid or expired OTP", 400);
    }

    // Handle image upload
    let podImage = null;
    if (req.file) {
      podImage = {
        url: req.file.path,
        filename: req.file.filename,
        uploadedAt: new Date()
      };
    }

    // Update delivery record
    delivery.status = "Delivered";
    delivery.deliveredAt = new Date();
    delivery.proofOfDelivery = {
      image: podImage,
      location: {
        coordinates: [location.lng, location.lat],
        address: location.address,
        timestamp: new Date()
      },
      otpVerified: true,
      verifiedAt: new Date(),
      deliveryNotes: req.body.notes || ""
    };

    await delivery.save();

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // Update tracking
    await Tracking.findOneAndUpdate(
      { deliveryId: id },
      { 
        status: "completed",
        endedAt: new Date()
      }
    );

    return successResponse(res, delivery, "Delivery completed successfully");
  } catch (error) {
    console.error("❌ Error in uploadPODWithVerification:", error);
    return errorResponse(res, "Failed to complete delivery");
  }
};

/**
 * 📱 Send OTP to customer
 * Access: Driver
 */
export const sendOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone } = req.body;

    const delivery = await Delivery.findById(id).populate('customer');
    if (!delivery) {
      return errorResponse(res, "Delivery not found", 404);
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    const otp = new OTP({
      phone: phone || delivery.customer.phone,
      code: otpCode,
      deliveryId: id,
      expiresAt,
      purpose: "delivery_verification"
    });

    await otp.save();

    // In production, integrate with SMS service like Twilio
    console.log(`OTP for delivery ${id}: ${otpCode}`);

    // Simulate SMS sending
    // await sendSMS(phone, `Your delivery verification code is: ${otpCode}`);

    return successResponse(res, { 
      message: "OTP sent successfully",
      expiresAt 
    }, "OTP sent to customer");
  } catch (error) {
    console.error("❌ Error in sendOTP:", error);
    return errorResponse(res, "Failed to send OTP");
  }
};

/**
 * 📍 Capture delivery location
 * Access: Driver
 */
export const captureLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, address } = req.body;

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return errorResponse(res, "Delivery not found", 404);
    }

    // Update delivery with location
    delivery.currentLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
      address: address,
      timestamp: new Date()
    };

    await delivery.save();

    return successResponse(res, delivery.currentLocation, "Location captured successfully");
  } catch (error) {
    console.error("❌ Error in captureLocation:", error);
    return errorResponse(res, "Failed to capture location");
  }
};