"use server";

import Stripe from 'stripe';
import { connectToDB } from '../mongodb';
import MemberModel from '../models/member';
import SubscriptionModel from '../models/subscription';
import TrialModel from '../models/trial';
import ProductModel from '../models/product';
import { revalidatePath } from 'next/cache';
import { getIPCountryInfo } from './user.actions';
import { v4 as uuidv4 } from 'uuid';
import { generateTransactionAndUpdateSubscription } from './admin.actions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createStripeCustomerIfNotExists(memberId: string) {
  await connectToDB();

  const member = await MemberModel.findOne({ user: memberId }).select('stripeCustomerId email');

  if (!member) {
    throw new Error('Member not found');
  }

  if (!member.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: member.email,
    });

    member.stripeCustomerId = customer.id;
    await member.save();
  }

  return { stripeCustomerId: member.stripeCustomerId, email: member.email };
}

export async function getPriceIdByProductId(stripeProductId: string, interval: 'month' | 'year') {
  const prices = await stripe.prices.list({
    product: stripeProductId,
    active: true,
    recurring: { interval: interval },
  });

  if (!prices.data.length) {
    throw new Error('No prices found for this product');
  }

  return prices.data[0].id;
}

export async function fetchUserSubscription(userId: string) {
  try {
    await connectToDB();

    const member = await MemberModel.findOne({ user: userId }).populate('subscription trial');

    if (!member || !member.subscription) {
      throw new Error('No subscription found for the user.');
    }

    const trialId = member.trial.slice(-1)[0];
    const trial = await TrialModel.findById(trialId);

    const planId = trial.trialPlan;
    const trialPlanDetails = await ProductModel.findById(planId).select('name price limitedCard');

    const subscriptionId = member.subscription.slice(-1)[0];
    const subscription = await SubscriptionModel.findById(subscriptionId).populate('plan transaction');

    console.log('subscription in stripe: ', subscription);

    const plainSubscription = {
      id: subscription.id,
      planStarted: subscription.planStarted,
      estimatedEndDate: subscription.estimatedEndDate,
      paidTerms: subscription.paidTerms,
      totalAmount: subscription.totalAmount,
      plan: {
        id: subscription.plan._id,
        name: subscription.plan.name,
        price: subscription.plan.price,
      },
      transaction: subscription.transaction.map((trans: any) => ({
        id: trans.id,
        transactionDate: trans.transactionDate,
        transactionFees: trans.transactionFees,
        ip_address: trans.ip_address,
        currency: trans.currency,
        payment_types: trans.payment_types,
        transactionStatus: trans.transactionStatus,
      })),
      trial: trial && trialPlanDetails ? {
        trialPlan: {
          id: trialPlanDetails._id,
          name: trialPlanDetails.name,
          price: trialPlanDetails.price,
          limitedCard: trialPlanDetails.limitedCard,
        },
        trialStarted: trial.trialStartDate,
        trialEnded: trial.trialEndDate,
      } : null,
      status: subscription.status,
    };

    console.log('plainSubscription: ', plainSubscription);

    return {
      success: true,
      subscription: plainSubscription,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function cancelUserSubscription(subscriptionId: string) {
  try {
    await connectToDB();

    console.log('subscriptionId', subscriptionId);

    const subscription = await SubscriptionModel.findOne({ id: subscriptionId });

    if (!subscription) {
      throw new Error('No subscription found.');
    }

    const updatedSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    updatedSubscription.current_period_end * 1000;

    subscription.status = 'cancel_at_period_end';
    subscription.estimatedEndDate = new Date(updatedSubscription.current_period_end * 1000);
    await subscription.save();

    revalidatePath('/dashboard/subscription');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function pauseUserSubscription(subscriptionId: string) {
  try {
    await connectToDB();

    console.log('subscriptionId in pause: ', subscriptionId);

    const subscription = await SubscriptionModel.findOne({ id: subscriptionId });

    if (!subscription) {
      throw new Error('No subscription found.');
    }

    const subscriptionInStripe = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

    const currentEndDate = new Date(subscriptionInStripe.current_period_end * 1000);
    const resumeDate = new Date(currentEndDate);
    resumeDate.setMonth(resumeDate.getMonth() + 1);

    const updatedSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      pause_collection: {
        behavior: 'mark_uncollectible',
        resumes_at: Math.floor(resumeDate.getTime() / 1000),
      }
    });

    updatedSubscription.current_period_end * 1000;

    const date = new Date();
    const currentIP = await getIPCountryInfo();

    const freeTransaction = await generateTransactionAndUpdateSubscription({
      orderId: subscription._id,
      transactionId: uuidv4(),
      transactionDate: date,
      transactionFees: 0,
      payment_types: 'stripe_pause_subscription',
      currency: 'USD',
      ip_address: currentIP.ip,
      transactionStatus: true,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      status: 'on offering',
    });

    if (freeTransaction.success){
      subscription.estimatedEndDate = resumeDate;
      await subscription.save();
    }else{
      return { success: false, message: freeTransaction.message + " on offering free plan." };
    }

    revalidatePath('/dashboard/subscription');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}