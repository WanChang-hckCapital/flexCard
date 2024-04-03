import mongoose, { Schema } from "mongoose";
import { Card } from "../../types";


const cardSchema = new Schema<Card>({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "PUBLIC",
    },
    description: String,
    likes:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
        }
    ],
    followers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
        }
    ],
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