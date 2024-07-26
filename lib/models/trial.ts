import mongoose, { Schema } from "mongoose";
import { Trial } from "../../types";


const trialSchema = new Schema<Trial>({
    trialPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    trialStartDate: {
        type: Date,
        required: true,
    },
    trialEndDate: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true
})

const TrialModel = mongoose.models.Trial || mongoose.model("Trial", trialSchema);

export default TrialModel;