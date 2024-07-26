import mongoose, { Schema } from "mongoose";
import { Product } from "../../types";


const productSchema = new Schema<Product>({
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
    availablePromo: {
        type: String,
    },
    stripeProductId: {
        type: String,
        required: true,
    },
    monthlyDiscount: {
        type: Number,
        default: 0,
    },
    annualDiscount: {
        type: Number,
        default: 0,
    },
    features: [
        {
            name: {
                type: String,
                required: true,
            }
        }
    ],
    limitedCard: {
        type: Number,
        required: true,
        default: 10,
    },
    limitedIP: {
        type: Number,
        required: true,
        default: 9999,
    },
}, {
    timestamps: true
})

const ProductModel = mongoose.models.Product || mongoose.model("Product", productSchema);

export default ProductModel;