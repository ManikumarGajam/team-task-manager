import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";

const router = express.Router();

// Upload file locally and attach to task
router.post("/:taskId", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Save local file path in DB
    const fileUrl = `/uploads/${req.file.filename}`;
    task.file = fileUrl;
    await task.save();

    // Log activity
    await Activity.create({
      task: task._id,
      user: req.user._id,
      action: "Uploaded an attachment",
    });

    res.json({ file: fileUrl });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
