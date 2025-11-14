import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";
import { uploadToSupabase, deleteFromSupabase } from "../utils/supabase.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// CHECK PERMISSIONS
function canDeleteFile(task, userId, file) {
  return (
    task.createdBy.toString() === userId.toString() ||
    file.uploadedBy.toString() === userId.toString() ||
    task.projectOwner?.toString() === userId.toString()
  );
}
// UPLOAD MULTIPLE FILES
// ----------------------------
router.post("/:taskId", protect, upload.array("files", 10), async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    let uploadedFiles = [];

    for (const file of req.files) {
      const uploadData = await uploadToSupabase(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      task.files.push({
        url: uploadData.url,
        fileName: file.originalname,
        uploadedBy: req.user._id,
      });

      uploadedFiles.push(uploadData.url);

      await Activity.create({
        task: task._id,
        user: req.user._id,
        action: `Uploaded file ${file.originalname}`,
      });
    }

    await task.save();

    res.json({ files: uploadedFiles });
  } catch (err) {
  console.error("FILE UPLOAD ERROR:", err);  // <-- ADD THIS
  res.status(500).json({ message: err.message });
}

});

// DELETE FILE
// ----------------------------
router.delete("/:taskId/:fileIndex", protect, async (req, res) => {
  try {
    const { taskId, fileIndex } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const file = task.files[fileIndex];
    if (!file) return res.status(404).json({ message: "File not found" });

    // PERMISSION CHECK
    if (!canDeleteFile(task, req.user._id, file)) {
      return res.status(403).json({ message: "You cannot delete this file" });
    }

    const filePath = file.url.split("/").pop();
    await deleteFromSupabase(filePath);

    task.files.splice(fileIndex, 1);
    await task.save();

    await Activity.create({
      task: task._id,
      user: req.user._id,
      action: `Deleted file ${file.fileName}`,
    });

    res.json({ message: "File deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
