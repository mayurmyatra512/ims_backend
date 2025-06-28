import multer from "multer";
import path from "path";
import fs from "fs";

// Multer disk storage setup for multi-tenant user images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Always take companyId from params for multi-tenant logic
    const companyId = req.params.companyId;
    if (!companyId) {
      return cb(new Error("companyId is required for file upload"));
    }
    const uploadPath = path.resolve(process.cwd(), "public", "user_images", companyId.toString());
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".jpg";
    const fileName = `user_${req.params.id || Date.now()}${ext}`;
    cb(null, fileName);
  }
});

const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/svg+xml"];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid image format. Allowed: jpeg, jpg, png, webp, svg"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

export default upload;
