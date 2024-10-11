import mongoose, { Schema } from "mongoose";
import { ForumType } from "../../types";

const forumTypeSchema = new Schema<ForumType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ForumTypeModel =
  mongoose.models.ForumType ||
  mongoose.model<ForumType>("ForumType", forumTypeSchema);

export default ForumTypeModel;
