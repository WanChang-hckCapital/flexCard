'use client';

import React, { useState } from 'react';
import { cancelUserSubscription, fetchUserSubscription, pauseUserSubscription } from "@/lib/actions/stripe.actions";
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Box, CalendarClock, Crown, User, User2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import OfferModal from '@/components/modal/offer-modal';
import FeedbackModal from '@/components/modal/feedback-modal';
import { submitFeedback } from '@/lib/actions/user.actions';
import axios from 'axios';

interface SubscriptionComponentProps {
    subscription: any;
    limitedCard: number;
    cardsCount: number;
    authActiveProfileId: string;
}

const SubscriptionComponent: React.FC<SubscriptionComponentProps> = ({ subscription, limitedCard, cardsCount, authActiveProfileId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSubscription, setCurrentSubscription] = useState(subscription);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    const fetchUpdatedSubscription = async () => {
        const updatedSubscription = await fetchUserSubscription(authActiveProfileId);
        if (updatedSubscription.success) {
            setCurrentSubscription(updatedSubscription.subscription);
        } else {
            toast.error(updatedSubscription.message);
        }
    };

    const handleUnsubscribe = async () => {
        setLoading(true);
        console.log('currentSubscription', currentSubscription);

        if (subscription && subscription.unsubscribeOffer !== false) {
            setIsOfferModalOpen(true);
        }else{
            setIsFeedbackModalOpen(true);
        }
        setLoading(false);
    };

    const handleAcceptOffer = async () => {
        setIsOfferModalOpen(false);
        setLoading(true);

        try {
            const result = await pauseUserSubscription(currentSubscription.id, authActiveProfileId);
            if (result.success) {
                await fetchUpdatedSubscription();
                toast.success('You have accepted the offer. Your subscription has been paused for one month.');
            } else {
                setError(result.message);
            }
        } catch (error) {
            toast.error('An error occurred while processing your request.');
            console.error('Error pausing subscription:', error);
        }

        setLoading(false);
    };

    const handleRejectOffer = async () => {
        setIsOfferModalOpen(false);
        setIsFeedbackModalOpen(true);
    };

    const handleSubmitFeedback = async (feedbackData: any) => {
        setLoading(true);
        const resultFeedback = await submitFeedback({
            ...feedbackData,
            profileId: authActiveProfileId,
        });

        if (resultFeedback.success) {
            const result = await cancelUserSubscription(currentSubscription.id);
            if (result.success) {
                await fetchUpdatedSubscription();
                toast.success('Subscription canceled successfully');
            } else {
                setError(result.message);
            }
        } else {
            toast.error(resultFeedback.message);
        }
        setLoading(false);
    };

    const calculateCardUsagePercentage = () => {
        return (cardsCount / limitedCard) * 100;
    };

    const calculateDaysRemaining = () => {
        const today = new Date();
        const endDate = new Date(currentSubscription.estimatedEndDate);
        const diffTime = Math.abs(endDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    const calculateDaysStarted = () => {
        const today = new Date();
        const startDate = new Date(currentSubscription.planStarted);
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    const convertPaidTermsToDays = () => {
        if (currentSubscription.paidTerms === 1) {
            return currentSubscription.paidTerms * 30;
        } else if (currentSubscription.paidTerms === 12) {
            return currentSubscription.paidTerms * 365;
        } else {
            return 0;
        }
    }

    const cardUsagePercentage = calculateCardUsagePercentage();
    const daysRemaining = calculateDaysRemaining();
    const daysStarted = calculateDaysStarted();
    const paidTermsInDays = convertPaidTermsToDays();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {currentSubscription.status !== "canceled" && currentSubscription.status !== "pending" ? (
                <div>
                    <div className="pb-6 text-right">
                        {currentSubscription.status === "cancel_at_period_end" ? (
                            <div>
                                Estimate End Date:&nbsp;
                                <Badge variant="bgRed">
                                    {new Date(currentSubscription.estimatedEndDate).toLocaleDateString()}
                                </Badge>
                            </div>
                        ) : currentSubscription.status === "active" ? (
                            <Badge variant="bgGreen">
                                Active
                            </Badge>
                        ) : currentSubscription.status === "on offering" ? (
                            <Badge variant="bgOrange">
                                On Offering
                            </Badge>
                        ): (
                            <Badge variant="bgIndigo">
                                Pending
                            </Badge>
                        )}
                    </div>
                    {error && (
                        toast.error(error)
                    )}
                    <Card className='flex flex-row py-2 rounded-b-none'>
                        <CardContent className="flex-1 pt-6">
                            <CardDescription className="text-slate-300">Plan</CardDescription>
                            <CardDescription className="text-[24px] font-bold">{currentSubscription.plan.name}</CardDescription>
                        </CardContent>
                        <CardContent className="flex-1 pt-6">
                            <CardDescription className="text-slate-300">Payment</CardDescription>
                            <CardDescription className="flex items-center">
                                <div className="text-[24px] font-bold">
                                    ${currentSubscription.totalAmount}
                                </div>
                                <div className="text-slate-300 ml-2">
                                    per&nbsp;
                                    {currentSubscription.paidTerms === 1 ? (
                                        <span>month</span>
                                    ) : (
                                        <span>year</span>
                                    )}
                                </div>
                            </CardDescription>
                        </CardContent>
                        <CardFooter className="flex-1 pt-6 justify-end">
                            <div>
                                <Button variant="outline">
                                    Upgrade
                                    <Crown className="ml-2" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                    <Card className="flex flex-row py-2 rounded-t-none">
                        <CardContent className="flex-1 pt-6">
                            <CardDescription className="text-slate-300 mb-4">flexCard Created</CardDescription>
                            <Progress value={cardUsagePercentage} />
                            <CardDescription className="text-slate-300 mt-3 flex items-center h-[32px]">
                                <Box className="mr-2 w-8 h-8" />{cardsCount}
                                <div>
                                    ({cardUsagePercentage.toFixed(2)}%)
                                </div>
                                <div className="text-right w-full">
                                    {limitedCard}
                                </div>
                            </CardDescription>
                        </CardContent>
                        <CardContent className="flex-1 pt-6">
                            <CardDescription className="text-slate-300 mb-4">Plans Renew Remain</CardDescription>
                            <Progress value={(daysStarted / paidTermsInDays) * 100} />
                            <CardDescription className="text-slate-300 mt-3 flex items-center h-[32px]">
                                <CalendarClock className="mr-2 w-6 h-6" />{daysRemaining}
                                <div>
                                    &nbsp;days
                                </div>
                                <div className="text-right w-full">
                                    {new Date(currentSubscription.estimatedEndDate).toLocaleDateString()}
                                </div>
                            </CardDescription>
                        </CardContent>
                        <CardFooter className="flex-1 pt-6 justify-end">
                            {currentSubscription.status === "active" && (
                                <Button
                                    variant="destructive"
                                    onClick={handleUnsubscribe}
                                    className="py-2 px-4"
                                >
                                    Unsubscribe
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                    <OfferModal
                        isOpen={isOfferModalOpen}
                        onClose={() => setIsOfferModalOpen(false)}
                        onAccept={handleAcceptOffer}
                        onReject={handleRejectOffer}
                    />
                    <FeedbackModal
                        isOpen={isFeedbackModalOpen}
                        onClose={() => setIsFeedbackModalOpen(false)}
                        onSubmit={handleSubmitFeedback}
                    />
                </div>
            ) : (
                // modify here
                <div>You do not have an active subscription.</div>
            )}
        </div>
    );
};

export default SubscriptionComponent;
