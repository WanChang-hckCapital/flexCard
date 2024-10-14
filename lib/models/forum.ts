import mongoose, { Schema } from "mongoose";
import { Forum } from "../../types";

const forumSchema = new Schema<Forum>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    forumType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumType",
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ForumModel =
  mongoose.models.Forum || mongoose.model<Forum>("Forum", forumSchema);

export default ForumModel;
