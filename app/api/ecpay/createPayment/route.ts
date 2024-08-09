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
    EncryptType: number;
}

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

export async function POST(req: Request) {
    try {
        const { amount, orderId, description } = await req.json() as { amount: number; orderId: string; description: string };

        const merchantID = process.env.ECPAY_MERCHANT_ID!;
        const hashKey = process.env.ECPAY_HASH_KEY!;
        const hashIV = process.env.ECPAY_HASH_IV!;

        const tradeInfo: TradeInfo = {
            MerchantID: merchantID,
            MerchantTradeNo: orderId,
            MerchantTradeDate: formatDate(new Date()),
            PaymentType: 'aio',
            TotalAmount: amount,
            TradeDesc: 'Test Transaction',
            ItemName: description,
            ReturnURL: 'http://localhost:3000/api/ecpay/callback',
            ClientBackURL: 'http://localhost:3000/order-complete',
            ChoosePayment: 'ALL',
            EncryptType: 1,
        };

        const sortedQueryString = Object.keys(tradeInfo)
            .sort()
            .map(key => `${key}=${tradeInfo[key as keyof TradeInfo]}`)
            .join('&');

        const hashString = `HashKey=${hashKey}&${sortedQueryString}&HashIV=${hashIV}`;
        const checkMacValue = crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();
        // const checkMacValue = "BF918798400BE5318E94E95EEE5DEDDABB07140480D55D228E76D7784F0EAC54";

        return NextResponse.json({ success: true, tradeInfo, checkMacValue });
    } catch (err: any) {
        console.error("Error in createPayment: ", err.message);
        return NextResponse.json({ success: false, message: err.message, status: 500 });
    }
}
