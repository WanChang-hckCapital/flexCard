import mongoose, { Schema } from "mongoose";
import { Offer } from "../../types";


const offerSchema = new Schema<Offer>({
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        required: true,
    
    },
}, {
    timestamps: true
})

const OfferModel = mongoose.models.Offer || mongoose.model("Offer", offerSchema);

export default OfferModel;