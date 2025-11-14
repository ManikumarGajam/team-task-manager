import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads folder exists
const uploads = "uploads";
if (!fs.existsSync(uploads)) {
  fs.mkdirSync(uploads);
}

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

export default upload;
