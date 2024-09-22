import { NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { fetchSubsriptionTotalAmountById, generateTransactionAndUpdateSubscription } from '@/lib/actions/admin.actions';
import { getIPCountryInfo } from '@/lib/actions/user.actions';
import { fetchECpayTransactionStatus } from '@/lib/actions/ecpay.actions';

// interface TradeInfo {
//     MerchantID: string;
//     MerchantTradeNo: string;
//     MerchantTradeDate: string;
//     PaymentType: string;
//     TotalAmount: number;
//     TradeDesc: string;
//     ItemName: string;
//     ReturnURL: string;
//     ClientBackURL: string;
//     ChoosePayment: string;
//     EncryptType: number;
// }

interface TradeInfo {
    MerchantID: string;
    MerchantTradeNo: string;
    MerchantTradeDate: string;
    PaymentType: string;
    TotalAmount: number;
    PeriodAmount: number;
    PeriodType: string;
    Frequency: number;
    ExecTimes: number;
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
        const { amount, orderId, description, interval } = await req.json() as { amount: number; orderId: string; description: string; interval: string };

        const merchantID = process.env.ECPAY_MERCHANT_ID!;
        const hashKey = process.env.ECPAY_HASH_KEY!;
        const hashIV = process.env.ECPAY_HASH_IV!;

        // const tradeInfo: TradeInfo = {
        //     MerchantID: merchantID,
        //     MerchantTradeNo: orderId,
        //     MerchantTradeDate: formatDate(new Date()),
        //     PaymentType: 'aio',
        //     TotalAmount: amount,
        //     TradeDesc: 'Test Transaction',
        //     ItemName: description,
        //     ReturnURL: 'http://localhost:3000/api/ecpay/callback',
        //     ClientBackURL: 'http://localhost:3000/order-complete',
        //     ChoosePayment: 'ALL',
        //     EncryptType: 1,
        // };

        const tradeInfo: TradeInfo = {
            MerchantID: merchantID,
            MerchantTradeNo: orderId,
            MerchantTradeDate: formatDate(new Date()),
            PaymentType: 'aio',
            TotalAmount: amount,
            PeriodAmount: amount,
            PeriodType: interval === "1" ? 'M' : 'Y',
            Frequency: 1,
            ExecTimes: interval === "1" ? 99 : 9,
            TradeDesc: 'Test Transaction',
            ItemName: description,
            ReturnURL: 'http://localhost:3000/api/ecpay/callback',
            ClientBackURL: 'http://localhost:3000/order-complete',
            ChoosePayment: 'Credit',
            EncryptType: 1,
        };

        console.log("Trade Info: ", tradeInfo);

        const sortedQueryString = Object.keys(tradeInfo)
            .sort()
            .map(key => `${key}=${tradeInfo[key as keyof TradeInfo]}`)
            .join('&');

        const hashString = `HashKey=${hashKey}&${sortedQueryString}&HashIV=${hashIV}`;
        const checkMacValue = crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();

        // return NextResponse.json({ success: true, orderId, tradeInfo, checkMacValue });
        return NextResponse.json({ success: true, orderId, tradeInfo, checkMacValue});
    } catch (err: any) {
        console.error("Error in createPayment: ", err.message);
        return NextResponse.json({ success: false, message: err.message, status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const transactionId = url.searchParams.get('transactionId');
        const orderId = url.searchParams.get('orderId');
        const subscriptionId = url.searchParams.get('subscriptionId');
        const envUrl = process.env.NEXT_PUBLIC_BASE_URL;

        if (!transactionId || !orderId) {
            return NextResponse.json({ message: 'Missing transactionId or orderId', status: 400 });
        }

        const date = new Date();
        const currentIP = await getIPCountryInfo();
        const productAmount = await fetchSubsriptionTotalAmountById(orderId);
        const ecpayTransactionStatus = await fetchECpayTransactionStatus(transactionId);

        if (ecpayTransactionStatus === 'SUCCESS') {
            const updateSubscription = await generateTransactionAndUpdateSubscription({
                orderId,
                transactionId,
                transactionDate: date,
                transactionFees: productAmount,
                ip_address: currentIP.ip,
                payment_types: 'ECPay',
                currency: 'TWD',
                transactionStatus: true,
                status: 'active',
            });

            if (updateSubscription.success) {
                return NextResponse.redirect(`${envUrl}/checkout/redirect/${orderId}?transactionId=${transactionId}`);
            } else {
                return NextResponse.json({ message: updateSubscription.message, status: 500 });
            }
        } else {
            return NextResponse.json({ message: 'Payment not successful', status: 400 });
        }
    } catch (err: any) {
        return NextResponse.json({ message: err.message, status: 500 });
    }
}
