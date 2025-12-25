import { Notification } from "../models/notification.model.js";

export const createNotification = async ({
  recipient,
  sender,
  type,
  video = null,
  comment = null,
  message,
}) => {
  try {
    // Don't create notification if sender and recipient are the same
    if (recipient.toString() === sender.toString()) {
      return null;
    }

    await Notification.create({
      recipient,
      sender,
      type,
      video,
      comment,
      message,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
