import mongoose, { Schema } from "mongoose";
import { Friend } from "../../types";

const friendSchema = new Schema<Friend>(
  {
    generatedId: {
      type: String,
    },
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const FriendModel =
  mongoose.models.Friend || mongoose.model("Friend", friendSchema);

export default FriendModel;
