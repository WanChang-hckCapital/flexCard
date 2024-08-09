import { NextResponse } from 'next/server';
import axios from 'axios';
import { generateHmacSignature } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface Order {
    amount: number;
    currency: string;
    orderId: string;
    packages: Array<{
        id: string;
        amount: number;
        products: Array<{
            name: string;
            quantity: number;
            price: number;
        }>;
    }>;
}

export async function POST(req: Request) {
    try {
        const { amount, orderId, description } = await req.json() as { amount: number; orderId: string; description: string;};

        const channelId = process.env.LINE_PAY_CHANNEL_ID!;
        const channelSecret = process.env.LINE_PAY_CHANNEL_SECRET!;
        const returnUrl = process.env.LINE_PAY_RETURN_URL!;
        const apiUrl = process.env.LINE_PAY_API_URL!;
        const uri = process.env.LINE_PAY_URI!;

        const order: Order = {
            amount: amount,
            currency: 'TWD',
            orderId: orderId,
            packages: [
                {
                    id: 'package_id',
                    amount: amount,
                    products: [
                        {
                            name: description,
                            quantity: 1,
                            price: amount,
                        },
                    ],
                },
            ],
        };

        const requestBody = {
            ...order,
            redirectUrls: {
                confirmUrl: returnUrl,
                cancelUrl: `${returnUrl}/cancel`,
            },
            //subscription
            payType: "PREAPPROVED",
            payInfo: {
                preapprovedPayment: {
                    period: "MONTH",
                    maxAmount: amount,
                }
            }
        };

        const nonce = uuidv4();
        const signature = generateHmacSignature(channelSecret, uri, JSON.stringify(requestBody), nonce);

        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'X-LINE-ChannelId': channelId,
                'X-LINE-Authorization-Nonce': nonce,
                'X-LINE-Authorization': signature,
            },
        });

        console.log("response---", response.data);

        if (response.data.returnCode === '0000') {
            return NextResponse.json({ success: true, paymentUrl: response.data.info.paymentUrl.web });
        } else {
            return NextResponse.json({ success: false, message: response.data.returnMessage, status: 400 });
        }
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message, status: 500 });
    }
}
