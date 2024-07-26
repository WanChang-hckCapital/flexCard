import { NextResponse } from 'next/server';
import crypto from 'crypto';

interface TradeInfo {
    MerchantID: string;
    MerchantTradeNo: string;
    MerchantTradeDate: string;
    PaymentType: string;
    TotalAmount: number;
    TradeDesc: string;
    ItemName: string;
    ReturnURL: string;
    ClientBackURL: string;
    ChoosePayment: string;
    // EncryptType: number;
}

export async function POST(req: Request) {
    try {
        console.log("called createPayment.ts api");

        const { amount, orderId, description } = await req.json() as { amount: number; orderId: string; description: string };

        const merchantID = process.env.ECPAY_MERCHANT_ID!;
        const hashKey = process.env.ECPAY_HASH_KEY!;
        const hashIV = process.env.ECPAY_HASH_IV!;
        const baseURL = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';

        const tradeInfo: TradeInfo = {
            MerchantID: merchantID,
            MerchantTradeNo: orderId,
            MerchantTradeDate: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            PaymentType: 'aio',
            TotalAmount: amount,
            TradeDesc: 'Test Transaction',
            ItemName: description,
            ReturnURL: 'http://localhost:3000/api/ecpay/callback',
            ClientBackURL: 'http://localhost:3000/order-complete',
            ChoosePayment: 'ALL',
            // EncryptType: 1,
        };

        const sortedQueryString = Object.keys(tradeInfo)
            .sort()
            .map(key => `${key}=${tradeInfo[key as keyof TradeInfo]}`)
            .join('&');

        const hashString = `HashKey=${hashKey}&${sortedQueryString}&HashIV=${hashIV}`;
        const tradeSha = crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();

        const paymentUrl = `${baseURL}?${sortedQueryString}&CheckMacValue=${tradeSha}`;

        return NextResponse.json({ paymentUrl });
    } catch (err: any) {
        return NextResponse.json({ message: err.message, status: 500 });
    }
}
