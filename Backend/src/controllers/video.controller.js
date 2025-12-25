import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const matchStage = {};

  if (query) {
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (userId && isValidObjectId(userId)) {
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new ApiError(404, "User not found");
    }
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  matchStage.isPublished = true;

  const sortStage = {};
  if (sortBy) {
    sortStage[sortBy] = sortType === "desc" ? -1 : 1;
  } else {
    sortStage.createdAt = -1;
  }

  const videos = await Video.aggregate([
    {
      $match: matchStage,
    },
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
        owner: { $first: "$owner" },
      },
    },
    {
      $sort: sortStage,
    },
    {
      $skip: skip,
    },
    {
      $limit: limitNum,
    },
  ]);

  const totalVideos = await Video.countDocuments(matchStage);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        totalVideos,
        currentPage: pageNum,
        totalPages: Math.ceil(totalVideos / limitNum),
      },
      "Videos fetched successfully"
    )
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) {
    throw new ApiError(500, "Failed to upload video file");
  }

  if (!thumbnail) {
    throw new ApiError(500, "Failed to upload thumbnail");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoFile.duration || 0,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const userId = req.user?._id;

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
        isPublished: true,
      },
    },
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
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner._id",
        foreignField: "channel",
        as: "subscriptions",
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
        likesCount: { $size: "$likes" },
        subscribersCount: { $size: "$subscriptions" },
        isLiked: {
          $cond: {
            if: { $and: [userId, { $in: [userId, "$likes.likedBy"] }] },
            then: true,
            else: false,
          },
        },
        isSubscribed: {
          $cond: {
            if: { $and: [userId, { $in: [userId, "$subscriptions.subscriber"] }] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        likes: 0,
        subscriptions: 0,
      },
    },
  ]);

  if (!video || video.length === 0) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

const recordVideoView = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Increment views
  await Video.findByIdAndUpdate(videoId, {
    $inc: { views: 1 },
  });

  // Add to watch history if user is authenticated
  // Remove if exists and push to beginning (most recent)
  if (req.user?._id) {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { watchHistory: videoId },
      }
    );
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { watchHistory: { $each: [videoId], $position: 0 } },
      }
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "View recorded successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!title && !description && !req.file) {
    throw new ApiError(
      400,
      "At least one field (title, description, or thumbnail) is required"
    );
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  if (title) video.title = title;
  if (description) video.description = description;

  if (req.file) {
    const thumbnailLocalPath = req.file.path;
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
      throw new ApiError(500, "Failed to upload thumbnail");
    }

    // Delete old thumbnail from cloudinary
    if (video.thumbnail) {
      const oldThumbnailPublicId = video.thumbnail
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await deleteFromCloudinary(oldThumbnailPublicId);
    }

    video.thumbnail = thumbnail.url;
  }

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Delete video and thumbnail from cloudinary
    try {
      // Extract public_id from video URL
      const videoPublicId = video.videoFile
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await deleteFromCloudinary(videoPublicId);

      // Extract public_id from thumbnail URL
      const thumbnailPublicId = video.thumbnail
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await deleteFromCloudinary(thumbnailPublicId);
    } catch (error) {
      console.error("Error deleting files from Cloudinary:", error);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete all comments on this video
    await Comment.deleteMany({ video: videoId }).session(session);

    // Delete all likes on this video
    await Like.deleteMany({ video: videoId }).session(session);

    // Remove video from all playlists
    await Playlist.updateMany(
      { videos: videoId },
      { $pull: { videos: videoId } }
    ).session(session);

    // Remove video from watch history of all users
    await User.updateMany(
      { watchHistory: videoId },
      { $pull: { watchHistory: videoId } }
    ).session(session);

    // Finally delete the video
    await Video.findByIdAndDelete(videoId).session(session);

    // Commit the transaction
    await session.commitTransaction();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Video and all associated data deleted successfully"
        )
      );
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(
      500,
      error?.message || "Failed to delete video and associated data"
    );
  } finally {
    session.endSession();
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to toggle publish status of this video"
    );
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        `Video ${video.isPublished ? "published" : "unpublished"} successfully`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  recordVideoView,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
