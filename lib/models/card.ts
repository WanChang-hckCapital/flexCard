import mongoose, { Schema } from "mongoose";
import { Card } from "../../types";


const cardSchema = new Schema<Card>({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "public",
    },
    description: String,
    categories: [
        {
            type: String,
        }
    ],
    components: [
        {
            type: String,
        }
    ],
}, {
    timestamps: true
})

const Card = mongoose.models.Card || mongoose.model("Card", cardSchema);

export default Card;