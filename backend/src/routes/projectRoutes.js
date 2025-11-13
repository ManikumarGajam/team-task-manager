import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createProject,
  getMyProjects,
  addMember,
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/", protect, createProject);
router.get("/", protect, getMyProjects);
router.put("/:id/add-member", protect, addMember);

export default router;
