import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";
import Task from "../models/Task.js";

const router = express.Router();

// Upload a file and attach it to a task
router.post("/:taskId", protect, upload.single("file"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Cloudinary returns file URL at req.file.path
    task.file = req.file.path;
    await task.save();

    res.json({ file: req.file.path });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
