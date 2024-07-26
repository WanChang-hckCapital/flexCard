import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { fetchSubsriptionTotalAmountById, generateTransactionAndUpdateSubscription } from '@/lib/actions/admin.actions';
import { getIPCountryInfo } from '@/lib/actions/user.actions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { amount, orderId, description } = await req.json() as { amount: number; orderId: string; description: string };

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: { orderId, description },
    });

    return NextResponse.json({ client_secret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error('Error creating payment intent:', err);
    return NextResponse.json({ message: err.message, status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const transactionId = url.searchParams.get('transactionId');
    const orderId = url.searchParams.get('orderId');
    const subscriptionId = url.searchParams.get('subscriptionId')
    const envUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!transactionId || !orderId) {
      return NextResponse.json({ message: 'Missing transactionId or orderId', status: 400 });
    }

    const date = new Date();
    const currentIP = await getIPCountryInfo();
    const productAmount = await fetchSubsriptionTotalAmountById(orderId);
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

    let updateSubscription;
    console.log("subscriptionId", subscriptionId);

    if (paymentIntent.status === 'succeeded') {
      console.log({ message: 'Payment successful', orderId, transactionId });
      if (subscriptionId) {
        updateSubscription = await generateTransactionAndUpdateSubscription({
          orderId: orderId,
          transactionId: transactionId,
          transactionDate: date,
          transactionFees: productAmount,
          payment_types: 'Stripe',
          currency: 'USD',
          ip_address: currentIP.ip,
          transactionStatus: true,
          stripeSubscriptionId: subscriptionId,
          status: 'active',
        });
      } else {
        updateSubscription = await generateTransactionAndUpdateSubscription({
          orderId: orderId,
          transactionId: transactionId,
          transactionDate: date,
          transactionFees: productAmount,
          payment_types: 'Stripe',
          currency: 'USD',
          ip_address: currentIP.ip,
          transactionStatus: true,
          status: 'active',
        });
      }

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
