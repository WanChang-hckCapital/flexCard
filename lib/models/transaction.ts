import mongoose, { Schema } from "mongoose";
import { Transaction } from "../../types";


const transactionSchema = new Schema<Transaction>({
    id: {
        type: String,
        required: true,
    },
    transactionDate: {
        type: Date,
        required: true,
    },
    transactionFees: {
        type: Number,
        required: true,
    },
    ip_address: {
        type: String,
        required: true,
    },
    payment_types: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
})

const TransactionModel = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

export default TransactionModel;