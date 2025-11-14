import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createProject,
  getMyProjects,
  addMember,
  getProjectMembers,
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/", protect, createProject);
router.get("/", protect, getMyProjects);
router.put("/:id/add-member", protect, addMember);

// NEW: get project members
router.get("/:id/members", protect, getProjectMembers);

export default router;
