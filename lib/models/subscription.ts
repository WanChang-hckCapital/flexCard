import mongoose, { Schema } from "mongoose";
import { Subscription } from "../../types";


const subscriptionSchema = new Schema<Subscription>({
    id: {
        type: String,
        required: true,
    },
    planStarted: {
        type: Date,
        required: true,
    },
    estimatedEndDate: {
        type: Date,
        required: true,
    },
    autoRenew: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidTerms: {
        type: Number,
        required: true,
        default: 1,
    },
    plan: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
    ],
    transaction: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
        },
    ],
}, {
    timestamps: true
})

const SubscriptionModel = mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);

export default SubscriptionModel;