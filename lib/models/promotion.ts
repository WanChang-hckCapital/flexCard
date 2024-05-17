import mongoose, { Schema } from "mongoose";
import { Promotion } from "../../types";


const promotionSchema = new Schema<Promotion>({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    dateRange: {
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    limitedQuantity: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true
})

const PromotionModel = mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema);

export default PromotionModel;