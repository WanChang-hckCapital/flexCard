import { NextResponse } from 'next/server';
import axios from 'axios';
import { generateHmacSignature } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { fetchSubsriptionTotalAmountById, generateTransactionAndUpdateSubscription } from '@/lib/actions/admin.actions';
import { getIPCountryInfo } from '@/lib/actions/user.actions';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const transactionId = url.searchParams.get('transactionId');
    const orderId = url.searchParams.get('orderId');
    const envUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!transactionId || !orderId) {
      return NextResponse.json({ message: 'Missing transactionId or orderId', status: 400 });
    }

    const channelId = process.env.LINE_PAY_CHANNEL_ID!;
    const channelSecret = process.env.LINE_PAY_CHANNEL_SECRET!;
    const apiUrl = process.env.LINE_PAY_API_URL!.replace('/request', `/${transactionId}/confirm`);
    const uri = `/v3/payments/${transactionId}/confirm`;
    const date = new Date();
    const currentIP = await getIPCountryInfo();

    const productAmount = await fetchSubsriptionTotalAmountById(orderId);

    const requestBody = {
      amount: productAmount,
      currency: 'TWD',
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

    console.log("callback response---", response.data);

    if (response.data.returnCode === '0000') {
      console.log({ message: 'Payment successful', orderId, transactionId });
      const updateSubscription = await generateTransactionAndUpdateSubscription({ orderId: orderId, transactionId: transactionId, transactionDate: date, transactionFees: productAmount, payment_types: 'LinePay', currency: 'TWD', ip_address: currentIP.ip, transactionStatus: true, status: 'active' });
      if (updateSubscription.success) {
        return NextResponse.redirect(`${envUrl}/checkout/redirect/${orderId}?transactionId=${transactionId}`);
      }else{
        return NextResponse.json({ message: updateSubscription.message, status: 500 });
      }
    } else {
      return NextResponse.json({ message: response.data.returnMessage, status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ message: err.message, status: 500 });
  }
}
