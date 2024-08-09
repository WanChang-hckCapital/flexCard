import mongoose, { Schema } from "mongoose";
import { FriendRequest } from "../../types";

const friendRequestSchema = new Schema<FriendRequest>(
  {
    // _id: {
    //   type: String,
    // },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: Number,
    },
  },
  { timestamps: true }
);

// time here
const FriendRequestModel =
  mongoose.models.FriendRequest ||
  mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequestModel;
