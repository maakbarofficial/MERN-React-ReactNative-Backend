import { User } from "../models/users.js";
import { sendMail } from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";
import cloudinary from "cloudinary";
import fs from "fs";

export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const avatar = req.files.avatar.tempFilePath;

    // console.log(avatar);

    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const otp = Math.floor(Math.random() * 1000000);

    const mycloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "React and React Native Backend",
    });

    fs.rmSync("./tmp", {
      recursive: true,
    });

    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
      otp,
      otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000),
    });

    await sendMail(email, "Verify Your Account", `Your OTP is ${otp}`);

    sendToken(
      res,
      user,
      201,
      "OTP sent to your Email, Please verify your Account"
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyController = async (req, res) => {
  try {
    const otp = Number(req.body.otp);

    const user = await User.findById(req.user._id);

    if (user.otp !== otp || user.otp_expiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or OTP has been expired",
      });
    }

    user.verified = true;
    user.otp = null;
    user.otp_expiry = null;

    await user.save();

    sendToken(res, user, 200, "Account Verified");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter all fields" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email OR Password" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email OR Password" });
    }

    sendToken(res, user, 200, "Login Successfully");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json({ success: true, message: "Logged out Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfileController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    sendToken(res, user, 201, `Welcome Back ${user.name}`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfileController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { name } = req.body;

    const avatar = req.files.avatar.tempFilePath;

    if (name) user.name = name;

    if (avatar) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);

      const mycloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: "React and React Native Backend",
      });

      fs.rmSync("./tmp", {
        recursive: true,
      });

      user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      };
    }

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePasswordController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter all fields" });
    }

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Old Password" });
    }

    user.password = newPassword;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgetPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exist with this Email",
      });
    }

    const otp = Math.floor(Math.random() * 1000000);

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = Date.now() * 10 * 60; // 10 min

    await user.save();

    const message = `Your OTP for Reseting Password is ${otp}. If you did not request for this, Please ignore this email.`;

    await sendMail(email, "Request to Reset Passowrd", message);

    res.status(200).json({ success: true, message: `OTP sent to ${email}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "OTP Invalid or Has been Expired",
      });
    }

    user.password = newPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpire = null;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
