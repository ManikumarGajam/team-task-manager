import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Activity from "../models/Activity.js";   // New

// CREATE TASK
export const createTask = async (req, res) => {
  try {
    const { projectId, title, description, assignee, dueDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // user must be a member
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const task = await Task.create({
      project: projectId,
      title,
      description,
      assignee,
      dueDate,
    });

    // LOG ACTIVITY: Task created
    await Activity.create({
      task: task._id,
      user: req.user._id,
      action: "Task created",
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET TASKS BY PROJECT
// --------------------------------------------------
export const getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate(
      "assignee",
      "name email"
    );

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// UPDATE TASK STATUS
// --------------------------------------------------
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status;
    await task.save();

    // LOG ACTIVITY: Status updated
    await Activity.create({
      task: task._id,
      user: req.user._id,
      action: `Status changed to ${status}`,
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
