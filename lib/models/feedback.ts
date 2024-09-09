import mongoose, { Schema } from "mongoose";
import { Feedback } from "../../types";


const feedbackSchema = new Schema<Feedback>({
    selectedReasons: {
        type: [String],
    },
    otherReason: {
        type: String,
    },
    hasUsedSimilar: {
        type: Boolean,
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
        ref: "Profile",
    },
}, {
    timestamps: true
})

const FeedbackModel = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

export default FeedbackModel;