import mongoose, { Schema } from "mongoose";
import { Chatroom } from "../../types";

const chatroomSchema = new Schema<Chatroom>(
  {
    name: {
      type: String,
    },
    type: {
      type: String,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
      },
    ],
    superAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: "Profile" }],
    admin: [{ type: mongoose.Schema.Types.ObjectId, ref: "Profile" }],
    silentUser: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
        silentUntil: { type: Date, default: Date.now },
      },
    ],
    groupImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "groupchat.files",
    },
  },
  {
    timestamps: true,
  }
);

const ChatroomModel =
  mongoose.models.Chatroom || mongoose.model("Chatroom", chatroomSchema);

export default ChatroomModel;
