import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getNotifications);
router.route("/unread-count").get(getUnreadCount);
router.route("/mark-all-read").patch(markAllAsRead);
router.route("/:notificationId/read").patch(markAsRead);
router.route("/:notificationId").delete(deleteNotification);

export default router;
