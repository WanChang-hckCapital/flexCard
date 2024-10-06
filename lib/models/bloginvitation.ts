import mongoose, { Schema } from "mongoose";
import { BlogInvitation } from "../../types";

const BlogInvitationSchema = new Schema<BlogInvitation>(
  {
    inviter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    invitee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined"],
      default: "Pending",
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    declinedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const BlogInvitationModel =
  mongoose.models.BlogInvitation ||
  mongoose.model<BlogInvitation>("BlogInvitation", BlogInvitationSchema);

export default BlogInvitationModel;
