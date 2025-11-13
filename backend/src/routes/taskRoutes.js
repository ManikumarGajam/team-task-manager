import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTask,
  getProjectTasks,
  updateStatus,
} from "../controllers/taskController.js";

import Task from "../models/Task.js";
import Comment from "../models/Comment.js";
import Activity from "../models/Activity.js";

const router = express.Router();



// Task Detail Route (for TaskDetailsModal)
router.get("/detail/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignee",
      "name email"
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    const comments = await Comment.find({ task: req.params.id }).populate(
      "author",
      "name email"
    );

    const activities = await Activity.find({ task: req.params.id }).populate(
      "user",
      "name email"
    );

    return res.json({
      ...task._doc,
      comments,
      activities,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE TASK
router.post("/", protect, createTask);

// GET TASKS BY PROJECT
router.get("/:projectId", protect, getProjectTasks);

// UPDATE STATUS
router.put("/:id/status", protect, updateStatus);

export default router;
