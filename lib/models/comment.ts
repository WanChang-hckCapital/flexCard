import mongoose, { Schema } from "mongoose";
import { Comment } from "../../types";


const commentSchema = new Schema<Comment>({
    commentID: {
        type: String,
        required: true,
        unique: true,
    },
    comment: {
        type: String,
        required: true,
    },
    commentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
    },
    commentDate: {
        type: Date,
        default: Date.now,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile',
        }
    ],
    replies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile',
        }
    ]
}, {
    timestamps: true
})

const CommentModel = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default CommentModel;