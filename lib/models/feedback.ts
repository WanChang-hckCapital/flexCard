import mongoose, { Schema } from "mongoose";
import { Feedback } from "../../types";


const feedbackSchema = new Schema<Feedback>({
    selectedReasons: {
        type: [String],
        required: true,
    },
    otherReason: {
        type: String,
    },
    hasUsedSimilar: {
        type: Boolean,
        required: true,
    },
    similarAppName: {
        type: String,
    },
    feedbackComment: {
        type: String,
    },
    isSkip: {
        type: Boolean,
        default: false,
    },
    feedbackDate: {
        type: Date,
        required: true,
    },
    feedbackBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        required: true,
    },
}, {
    timestamps: true
})

const FeedbackModel = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

export default FeedbackModel;