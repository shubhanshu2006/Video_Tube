import crypto from "crypto";
import { User } from "../models/user.model.js";
import { PendingUser } from "../models/pendingUser.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const pendingUser = await PendingUser.findOne({
    verificationToken: hashedToken,
    verificationTokenExpiry: { $gt: Date.now() },
  });

  if (!pendingUser) {
    throw new ApiError(400, "Invalid or expired verification link");
  }

  // Create REAL user
  const user = new User({
    fullName: pendingUser.fullName,
    email: pendingUser.email,
    username: pendingUser.username,
    password: pendingUser.password,
    avatar: pendingUser.avatar,
    avatarPublicId: pendingUser.avatarPublicId,
    coverImage: pendingUser.coverImage || "",
    coverImagePublicId: pendingUser.coverImagePublicId || "",
    isEmailVerified: true,
  });

  await user.save();

  await PendingUser.deleteOne({ _id: pendingUser._id });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Email verified successfully. Account created."
      )
    );
});
