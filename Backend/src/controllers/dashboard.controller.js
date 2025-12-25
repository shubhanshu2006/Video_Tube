import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  // Extract the channel owner ID from the authenticated user
  const channelId = req.user?._id;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  // Aggregate pipeline to get total video views and total videos count
  const videoStats = await Video.aggregate([
    {
      // Match all videos owned by this channel
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      // Group all videos and calculate total views and count
      $group: {
        _id: null,
        totalVideos: { $sum: 1 }, // Count total number of videos
        totalViews: { $sum: "$views" }, // Sum all video views
      },
    },
  ]);

  // Aggregate pipeline to get total subscribers count
  const subscriberStats = await Subscription.aggregate([
    {
      // Match all subscriptions where this channel is subscribed to
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      // Count total subscribers
      $group: {
        _id: null,
        totalSubscribers: { $sum: 1 },
      },
    },
  ]);

  // Aggregate pipeline to get total likes on all videos
  const likeStats = await Like.aggregate([
    {
      // First, get all videos by this channel
      $match: {
        video: { $exists: true }, // Only get likes on videos (not comments or tweets)
      },
    },
    {
      // Lookup to join with Video collection
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      // Unwind the video details array
      $unwind: "$videoDetails",
    },
    {
      // Match only videos owned by this channel
      $match: {
        "videoDetails.owner": new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      // Count total likes
      $group: {
        _id: null,
        totalLikes: { $sum: 1 },
      },
    },
  ]);

  // Aggregate pipeline to get total comments on all videos
  const commentStats = await Comment.aggregate([
    {
      // Lookup to join with Video collection
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      // Unwind the video details array
      $unwind: "$videoDetails",
    },
    {
      // Match only videos owned by this channel
      $match: {
        "videoDetails.owner": new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      // Count total comments
      $group: {
        _id: null,
        totalComments: { $sum: 1 },
      },
    },
  ]);

  // Extract values from aggregation results or set defaults
  const totalVideos = videoStats[0]?.totalVideos || 0;
  const totalViews = videoStats[0]?.totalViews || 0;
  const totalSubscribers = subscriberStats[0]?.totalSubscribers || 0;
  const totalLikes = likeStats[0]?.totalLikes || 0;
  const totalComments = commentStats[0]?.totalComments || 0;

  // Prepare the stats object
  const stats = {
    totalVideos,
    totalViews,
    totalSubscribers,
    totalLikes,
    totalComments,
  };

  // Return the channel statistics
  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // Get all the videos uploaded by the channel

  // Extract the channel owner ID from the authenticated user
  const channelId = req.user?._id;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  // Extract pagination parameters from query string
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;

  // Convert page and limit to numbers
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  // Calculate skip value for pagination
  const skip = (pageNum - 1) * limitNum;

  // Determine sort order (1 for ascending, -1 for descending)
  const sortOrder = sortType === "asc" ? 1 : -1;

  // Aggregate pipeline to get all videos with additional details
  const videos = await Video.aggregate([
    {
      // Match all videos owned by this channel
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      // Sort videos based on sortBy field and sortType
      $sort: {
        [sortBy]: sortOrder,
      },
    },
    {
      // Skip documents for pagination
      $skip: skip,
    },
    {
      // Limit the number of documents
      $limit: limitNum,
    },
    {
      // Lookup to get owner details
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            // Only select required fields from user
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      // Unwind owner details (convert array to object)
      $unwind: "$ownerDetails",
    },
    {
      // Lookup to count likes on each video
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      // Add computed fields
      $addFields: {
        likesCount: { $size: "$likes" }, // Count total likes
        owner: "$ownerDetails", // Replace owner ID with owner details
      },
    },
    {
      // Remove the likes array and ownerDetails (we only need the count)
      $project: {
        likes: 0,
        ownerDetails: 0,
      },
    },
  ]);

  // Get total count of videos for pagination info
  const totalVideos = await Video.countDocuments({ owner: channelId });

  // Calculate total pages
  const totalPages = Math.ceil(totalVideos / limitNum);

  // Check if videos exist
  if (!videos || videos.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            videos: [],
            pagination: {
              page: pageNum,
              limit: limitNum,
              totalVideos: 0,
              totalPages: 0,
            },
          },
          "No videos found for this channel"
        )
      );
  }

  // Return the channel videos with pagination info
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          currentPage: pageNum,
          limit: limitNum,
          totalVideos,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
      "Channel videos fetched successfully"
    )
  );
});

export { getChannelStats, getChannelVideos };
