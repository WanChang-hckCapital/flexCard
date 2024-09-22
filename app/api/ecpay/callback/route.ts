import { NextResponse } from 'next/server';
import axios from 'axios';
import { generateTransactionAndUpdateSubscription } from '@/lib/actions/admin.actions';
import { fetchECpayTransactionStatus } from '@/lib/actions/ecpay.actions';
import { getIPCountryInfo } from '@/lib/actions/user.actions';
import { fetchSubsriptionTotalAmountById } from '@/lib/actions/admin.actions';

export async function POST(req: Request) {
    try {
        const { RtnCode, RtnMsg, TradeNo, MerchantTradeNo } = await req.json() as {
            RtnCode: number;
            RtnMsg: string;
            TradeNo: string;
            MerchantTradeNo: string;
        };

        console.log("EC Pay callback received: ", { RtnCode, RtnMsg, TradeNo, MerchantTradeNo });

        if (RtnCode === 1) {
            const date = new Date();
            const currentIP = await getIPCountryInfo();
            const productAmount = await fetchSubsriptionTotalAmountById(MerchantTradeNo);

            const updateSubscription = await generateTransactionAndUpdateSubscription({
                orderId: MerchantTradeNo,
                transactionId: TradeNo,
                transactionDate: date,
                transactionFees: productAmount,
                ip_address: currentIP.ip,
                payment_types: 'ECPay',
                currency: 'TWD',
                transactionStatus: true,
                status: 'active', 
            });

            if (updateSubscription.success) {
                const mailResult = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mail/sendEmail`, {
                    email: 'adreanchong88@gmail.com',
                    subject: 'Subscription Invoice',
                    text: `
                        Dear Customer,

                        Thank you for subscribing to our service.

                        Subscription ID: ${MerchantTradeNo}
                        Plan: Test Transaction
                        Payment terms: 1 month

                        If you have any questions, feel free to contact us.
                        
                        Best regards,
                        HCK Capital Technology
                    `
                });

                if (mailResult.data.success) {
                    console.log("Email sent successfully");
                } else {
                    console.log("Failed to send email", mailResult.data.message);
                }

                return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout/redirect/${MerchantTradeNo}?transactionId=${TradeNo}`);
            } else {
                return NextResponse.json({ status: 'fail', message: 'Failed to update subscription' });
            }
        } else {
            return NextResponse.json({ status: 'fail', message: `Payment failed: ${RtnMsg}` });
        }
    } catch (err: any) {
        console.error("Error in EC Pay callback: ", err.message);
        return NextResponse.json({ status: 'fail', message: err.message });
    }
}
