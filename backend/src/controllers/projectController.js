import Project from "../models/Project.js";
import User from "../models/User.js";

// Create Project (existing)
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id], // owner is auto-member
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get projects for current user (existing)
export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user._id,
    }).populate("members", "name email");

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add member to project (existing)
export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // only owner can add members
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can add members" });
    }

    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
    }

    // return populated project
    const populated = await Project.findById(projectId).populate(
      "members",
      "_id name email"
    );

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW: Get members of a project
export const getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "members",
      "_id name email"
    );

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project.members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
