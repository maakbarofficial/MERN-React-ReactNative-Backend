import express from "express";
import {
  forgetPasswordController,
  getProfileController,
  loginController,
  logoutController,
  registerController,
  resetPasswordController,
  updatePasswordController,
  updateProfileController,
  verifyController,
} from "../controllers/User.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.route("/register").post(registerController);

router.route("/verify").post(isAuthenticated, verifyController);

router.route("/login").post(loginController);

router.route("/profile").get(isAuthenticated, getProfileController);

router.route("/updateprofile").put(isAuthenticated, updateProfileController);

router.route("/updatepassword").put(isAuthenticated, updatePasswordController);

router.route("/forgetpassword").post(forgetPasswordController);

router.route("/resetpassword").put(resetPasswordController);

router.route("/logout").get(logoutController);

export default router;
