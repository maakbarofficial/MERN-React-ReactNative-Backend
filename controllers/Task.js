import { User } from "../models/users.js";

export const addTaskController = async (req, res) => {
  try {
    const { title, description } = req.body;

    const user = await User.findById(req.user._id);

    user.tasks.push({
      title,
      description,
      completed: false,
      createdAt: new Date(Date.now()),
    });

    await user.save();

    res
      .status(200)
      .json({ success: false, message: "Task added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeTaskController = async (req, res) => {
  try {
    const { taskId } = req.params;

    const user = await User.findById(req.user._id);

    user.tasks = user.tasks.filter((task) => task._id.toString() !== taskId);

    await user.save();

    res
      .status(200)
      .json({ success: false, message: "Task removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTaskController = async (req, res) => {
  try {
    const { taskId } = req.params;

    const user = await User.findById(req.user._id);

    user.task = user.tasks.find((task) => task._id.toString() === taskId);

    user.task.completed = !user.task.completed;

    await user.save();

    res
      .status(200)
      .json({ success: false, message: "Task updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
