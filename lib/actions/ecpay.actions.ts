"use server";

import axios from "axios";

export async function fetchECpayTransactionStatus(transactionId: string): Promise<string> {
    try {
        const response = await axios.post('https://payment.ecpay.com.tw/Cashier/QueryTradeInfo', {
            MerchantID: process.env.ECPAY_MERCHANT_ID,
            MerchantTradeNo: transactionId,
        });

        if (response.data.RtnCode === 1) {
            return 'SUCCESS';
        } else {
            return 'FAILURE';
        }
    } catch (error) {
        console.error("Error fetching EC Pay transaction status", error);
        throw new Error("Failed to fetch transaction status from EC Pay.");
    }
}
