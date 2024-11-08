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
      // required: true,
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
    imageAttach: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Image", default: null },
    ],
    fileAttach: [{ type: mongoose.Schema.Types.ObjectId, default: null }],
    locationLink: { type: String },
    shopName: { type: String },
    pictureLink: { type: String },
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
    },
  },
  {
    timestamps: true,
  }
);

const MessageModel =
  mongoose.models.Message || mongoose.model<Message>("Message", messageSchema);

export default MessageModel;
