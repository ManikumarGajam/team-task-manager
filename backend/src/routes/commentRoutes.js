import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Comment from "../models/Comment.js";
import Activity from "../models/Activity.js";

const router = express.Router();

// GET COMMENTS FOR A TASK
// --------------------------------------------------
router.get("/:taskId", protect, async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ADD COMMENT TO TASK
// --------------------------------------------------
router.post("/", protect, async (req, res) => {
  try {
    const { taskId, message } = req.body;

    if (!message) return res.status(400).json({ message: "Comment is empty" });

    const comment = await Comment.create({
      task: taskId,
      message,
      author: req.user._id,
    });

    // LOG ACTIVITY: Comment added
    await Activity.create({
      task: taskId,
      user: req.user._id,
      action: "Added a comment",
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
