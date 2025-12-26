import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";
import { PendingUser } from "../models/pendingUser.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Playlist } from "../models/playlist.model.js";
import { Subscription } from "../models/subscription.model.js";

dotenv.config();

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  //  Validate input
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Email format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Please enter a valid email address");
  }

  // Disposable email block
  const blockedDomains = [
    "mailinator.com",
    "10minutemail.com",
    "tempmail.com",
    "guerrillamail.com",
  ];

  const emailDomain = email.split("@")[1]?.toLowerCase();

  if (blockedDomains.includes(emailDomain)) {
    throw new ApiError(400, "Disposable email addresses are not allowed");
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$/;

  if (!passwordRegex.test(password)) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
    );
  }

  // Check REAL users
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // Check pending users
  const existedPendingUser = await PendingUser.findOne({
    $or: [{ username }, { email }],
  });

  if (existedPendingUser) {
    throw new ApiError(
      409,
      "Verification already sent. Please check your email."
    );
  }

  // Handle files
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  let coverImageLocalPath;
  if (req.files?.coverImage?.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload avatar
  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  } catch (error) {
    throw new ApiError(500, "Error while uploading avatar image");
  }

  // Upload cover image
  let coverImage;
  try {
    if (coverImageLocalPath) {
      coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }
  } catch (error) {
    throw new ApiError(500, "Error while uploading cover image");
  }

  let pendingUser;
  try {
    pendingUser = await PendingUser.create({
      fullName,
      email,
      username: username.toLowerCase(),
      password,
      avatar: avatar.url,
      avatarPublicId: avatar.public_id,
      coverImage: coverImage?.url || "",
      coverImagePublicId: coverImage?.public_id || "",
    });
  } catch (error) {
    if (avatar?.public_id) await deleteFromCloudinary(avatar.public_id);
    if (coverImage?.public_id) await deleteFromCloudinary(coverImage.public_id);
    throw error;
  }

  // Generate verification token
  const verificationToken = pendingUser.generateVerificationToken();
  await pendingUser.save({ validateBeforeSave: false });

  // Send verification email
  try {
    await sendVerificationEmail(
      pendingUser.email,
      pendingUser.fullName,
      verificationToken
    );
  } catch (err) {
    await PendingUser.deleteOne({ _id: pendingUser._id });
    throw new ApiError(500, "Failed to send verification email");
  }

  // Final response
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        null,
        "Verification email sent. Please verify to complete registration."
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  let user;

  if (email) {
    user = await User.findOne({ email });
  } else if (username) {
    user = await User.findOne({ username });
  }

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const normalizePassword = password.trim();

  const isPasswordValid = await user.isPasswordCorrect(normalizePassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(500, "Something went wrong while logging in the user");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName && !email) {
    throw new ApiError(400, "At least one field is required");
  }

  const updateFields = {};

  if (fullName) updateFields.fullName = fullName;
  if (email) updateFields.email = email;

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "At least one field is required");
  }

  if (email) {
    const exists = await User.findOne({
      email,
      _id: { $ne: req.user._id },
    });

    if (exists) {
      throw new ApiError(400, "Email already exists");
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url || !avatar?.public_id) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  if (req.user?.avatarPublicId) {
    await deleteFromCloudinary(req.user.avatarPublicId);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
        avatarPublicId: avatar.public_id,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage?.url || !coverImage?.public_id) {
    throw new ApiError(400, "Error while uploading cover image");
  }

  if (req.user?.coverImagePublicId) {
    await deleteFromCloudinary(req.user.coverImagePublicId);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
        coverImagePublicId: coverImage.public_id,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

const removeFromWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid video ID is required");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { watchHistory: videoId },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Video removed from watch history successfully")
    );
});

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find user to get their cloud resources
    const user = await User.findById(userId).session(session);

    if (!user) {
      await session.abortTransaction();
      throw new ApiError(404, "User not found");
    }

    // Delete user's avatar and cover image from cloudinary
    if (user.avatar) {
      await deleteFromCloudinary(user.avatar);
    }
    if (user.coverImage) {
      await deleteFromCloudinary(user.coverImage);
    }

    // Get all user's videos to delete from cloudinary
    const userVideos = await Video.find({ owner: userId }).session(session);

    // Delete all video files and thumbnails from cloudinary
    for (const video of userVideos) {
      if (video.videoFile) {
        await deleteFromCloudinary(video.videoFile);
      }
      if (video.thumbnail) {
        await deleteFromCloudinary(video.thumbnail);
      }
    }

    // Delete all videos created by the user
    await Video.deleteMany({ owner: userId }).session(session);

    // Delete all comments made by the user
    await Comment.deleteMany({ owner: userId }).session(session);

    // Delete all likes made by the user
    await Like.deleteMany({ likedBy: userId }).session(session);

    // Delete all tweets made by the user
    await Tweet.deleteMany({ owner: userId }).session(session);

    // Delete all playlists created by the user
    await Playlist.deleteMany({ owner: userId }).session(session);

    // Delete all subscriptions where user is subscriber or channel
    await Subscription.deleteMany({
      $or: [{ subscriber: userId }, { channel: userId }],
    }).session(session);

    // Delete all likes on user's content (videos, comments, tweets)
    const userVideoIds = userVideos.map((video) => video._id);
    await Like.deleteMany({
      $or: [
        { video: { $in: userVideoIds } },
        {
          comment: {
            $in: await Comment.find({ owner: userId }).distinct("_id"),
          },
        },
        { tweet: { $in: await Tweet.find({ owner: userId }).distinct("_id") } },
      ],
    }).session(session);

    // Delete all comments on user's videos
    await Comment.deleteMany({
      video: { $in: userVideoIds },
    }).session(session);

    // Finally, delete the user
    await User.findByIdAndDelete(userId).session(session);

    // Commit the transaction
    await session.commitTransaction();

    // Clear cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(
        new ApiResponse(
          200,
          {},
          "User account and all associated data deleted successfully"
        )
      );
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(500, error?.message || "Failed to delete user account");
  } finally {
    session.endSession();
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  removeFromWatchHistory,
  deleteUser,
};
