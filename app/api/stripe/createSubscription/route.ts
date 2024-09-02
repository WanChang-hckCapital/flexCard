
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createStripeCustomerIfNotExists, getPriceIdByProductId } from '@/lib/actions/stripe.actions';
import axios from 'axios';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    try {
        const { profileId, stripeProductId, interval } = await req.json() as { profileId: string; stripeProductId: string; interval: 'month' | 'year'; };

        const result = await createStripeCustomerIfNotExists(profileId);
        const priceId = await getPriceIdByProductId(stripeProductId, interval);

        console.log("customerId", result.stripeCustomerId);
        console.log("priceId", priceId);

        const subscription = await stripe.subscriptions.create({
            customer: result.stripeCustomerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
        });

        let client_secret;
        if (typeof subscription.latest_invoice !== 'string' && subscription.latest_invoice?.payment_intent) {
            client_secret = (subscription.latest_invoice.payment_intent as Stripe.PaymentIntent).client_secret;
        }

        const mailResult = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mail/sendEmail`, {
            email: result.email,
            subject: 'Subscription Invoice',
            text: `
                Dear Customer,

                Thank you for subscribing to our service. Here are the details of your subscription:

                Subscription ID: ${subscription.id}
                Plan: ${stripeProductId}
                Payment terms: ${interval}
                
                If you have any questions, please feel free to contact us.
                
                Best regards,
                HCK Capital Technology`
        });

        if (mailResult.data.success) {
            return NextResponse.json({ subscriptionId: subscription.id, client_secret });
        }else{
            console.log("Failed to send email", mailResult.data.message);
            return NextResponse.json({ message: 'Failed to send email', status: 500 });
        }
    } catch (err: any) {
        return NextResponse.json({ message: err.message, status: 500 });
    }
}
