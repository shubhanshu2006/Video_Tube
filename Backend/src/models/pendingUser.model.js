import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

import crypto from "crypto";

const pendingUserSchema = new Schema(
  {
    fullName: String,
    email: { type: String, unique: true },
    username: { type: String, unique: true },
    password: String,
    avatar: String,
    avatarPublicId: String,
    coverImage: {
      type: String,
      default: "",
    },
    coverImagePublicId: {
      type: String,
      default: "",
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
  },
  { timestamps: true }
);

pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

pendingUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

pendingUserSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

  return token;
};

export const PendingUser = mongoose.model("PendingUser", pendingUserSchema);
