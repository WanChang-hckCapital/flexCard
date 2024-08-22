import mongoose, { Schema } from "mongoose";
import { Message } from "../../types";

const messageSchema = new Schema<Message>(
  {
    chatroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chatroom",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    readStatus: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Member",
          required: true,
        },
        readAt: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const MessageModel =
  mongoose.models.Message || mongoose.model<Message>("Message", messageSchema);

export default MessageModel;
