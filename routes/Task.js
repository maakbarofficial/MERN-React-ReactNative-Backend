import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  addTaskController,
  removeTaskController,
  updateTaskController,
} from "../controllers/Task.js";

const router = express.Router();

router.route("/addtask").post(isAuthenticated, addTaskController);

router.route("/updatetask/:taskId").get(isAuthenticated, updateTaskController);

router
  .route("/deletetask/:taskId")
  .delete(isAuthenticated, removeTaskController);

export default router;
