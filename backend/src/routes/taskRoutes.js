import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTask,
  getProjectTasks,
  updateStatus,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/:projectId", protect, getProjectTasks);
router.put("/:id/status", protect, updateStatus);

export default router;
