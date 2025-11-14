import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Activity from "../models/Activity.js";

// create Task (existing)
export const createTask = async (req, res) => {
  try {
    const { projectId, title, description, assignee, dueDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // only project members can create tasks
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // if assignee provided, ensure they are project member
    if (assignee && !project.members.includes(assignee)) {
      return res.status(400).json({ message: "Assignee must be a project member" });
    }

    const task = await Task.create({
      project: projectId,
      title,
      description,
      assignee: assignee || null,
      dueDate,
      createdBy: req.user._id,
      projectOwner: project.owner,
    });

    await Activity.create({
      task: task._id,
      user: req.user._id,
      action: "Task created",
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET TASKS BY PROJECT (existing)
export const getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignee", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE TASK STATUS (existing)
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

// NEW: Assign a task to a member
export const assignTask = async (req, res) => {
  try {
    const { userId } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // only project members can assign (and assignee must be project member)
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (userId && !project.members.includes(userId)) {
      return res.status(400).json({ message: "Assignee must be a project member" });
    }

    task.assignee = userId || null;
    await task.save();

    await Activity.create({
      task: task._id,
      user: req.user._id,
      action: userId ? "Assigned task to member" : "Unassigned task",
    });

    // populate assignee for response
    const populated = await Task.findById(task._id).populate("assignee", "name email");
    res.json(populated);
  } catch (err) {
    console.error("ASSIGN TASK ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
