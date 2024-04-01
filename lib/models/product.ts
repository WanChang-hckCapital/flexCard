import mongoose, { Schema } from "mongoose";
import { Product } from "../../types";


const productSchema = new Schema<Product>({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    limitedCard: {
        type: Number,
        required: true,
        default: 10,
    },
}, {
    timestamps: true
})

const Product = mongoose.models.User || mongoose.model("Product", productSchema);

export default Product;