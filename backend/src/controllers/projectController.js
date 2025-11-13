import Project from "../models/Project.js";

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

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
