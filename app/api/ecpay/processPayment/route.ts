import { NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const { cardNumber, cardExpiry, cardCVV, totalAmount, orderId, description, interval } = await req.json();

        const merchantID = process.env.ECPAY_MERCHANT_ID!;
        const hashKey = process.env.ECPAY_HASH_KEY!;
        const hashIV = process.env.ECPAY_HASH_IV!;

        const tradeInfo = {
            MerchantID: merchantID,
            MerchantTradeNo: orderId,
            MerchantTradeDate: formatDate(new Date()),
            PaymentType: 'aio',
            TotalAmount: totalAmount,
            CardNo: cardNumber,
            ExpireDate: cardExpiry,
            CVV2: cardCVV,
            TradeDesc: description,
            ItemName: `Subscription for ${interval} month(s)`,
            ReturnURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/ecpay/callback`,
            ClientBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/order-complete`,
            ChoosePayment: 'Credit',
            EncryptType: 1,
        };

        const sortedQueryString = Object.keys(tradeInfo)
            .sort()
            .map(key => `${key}=${tradeInfo[key as keyof typeof tradeInfo]}`)
            .join('&');
        const hashString = `HashKey=${hashKey}&${sortedQueryString}&HashIV=${hashIV}`;
        const checkMacValue = crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();

        const response = await axios.post('https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5', {
            ...tradeInfo,
            CheckMacValue: checkMacValue,
        });

        console.log("ECPay response: ", response.data);

        if (response.data.RtnCode === 1) {
            return NextResponse.json({
                success: true,
                transactionId: response.data.TradeNo,
                orderId: orderId,
            });
        } else {
            throw new Error(`Payment failed: ${response.data.RtnMsg}`);
        }
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message,
        });
    }
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}
