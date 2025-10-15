import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// ✅ Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "delivery",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

// ✅ File filter to restrict uploads
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only .jpg, .jpeg, .png, or .pdf files are allowed"), false);
  }
  cb(null, true);
};

// ✅ Multer upload middleware
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// ✅ Error handler for uploads
export const uploadErrorHandler = (err, req, res, next) => {
  console.error("Upload Error:", err.message);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  next();
};
