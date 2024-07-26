'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '../ui/input';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (feedbackData: any) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [otherReason, setOtherReason] = useState('');
    const [hasUsedSimilar, setHasUsedSimilar] = useState(false);
    const [similarAppName, setSimilarAppName] = useState('');
    const [feedbackComment, setFeedbackComment] = useState('');
    const [error, setError] = useState('');

    const handleSkip = () => {
        onSubmit({ isSkip: true });
        onClose();
    };

    const handleSubmit = () => {
        if (selectedReasons.includes('other') && !otherReason.trim()) {
            setError('Please specify your reason for "Other".');
            return;
        }
        
        if (hasUsedSimilar && !similarAppName.trim()) {
            setError('Please provide the name of the similar application.');
            return;
        }

        onSubmit({
            selectedReasons,
            otherReason,
            hasUsedSimilar,
            similarAppName,
            feedbackComment,
            isSkip: false,
        });
        onClose();
    };

    const toggleReason = (reason: string) => {
        setSelectedReasons((prevSelectedReasons) =>
            prevSelectedReasons.includes(reason)
                ? prevSelectedReasons.filter((r) => r !== reason)
                : [...prevSelectedReasons, reason]
        );
    };

    const reasons = [
        { value: 'ui_issue', label: "The UI of the application isn't meeting my requirements" },
        { value: 'complex_usage', label: 'The complexity of the usage of the application' },
        { value: 'high_fees', label: 'The subscription fees are too high' },
        { value: 'other', label: 'Other' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-center mb-4">
                        <Star /> &nbsp; Feedback
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Before you go, we would love to hear your feedback on our product.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 my-6">
                    <div className="flex flex-col">
                        <label className="mb-2">What makes you decide to unsubscribe from our service? (Can be multiple)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {reasons.map((reason) => (
                                <Card
                                    key={reason.value}
                                    className={`cursor-pointer content-center h-[145px] ${selectedReasons.includes(reason.value) ? 'border-blue' : 'border-gray-200'}`}
                                    onClick={() => toggleReason(reason.value)}
                                >
                                    <CardContent className="pt-6">
                                        <CardDescription className="text-center text-white">{reason.label}</CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {selectedReasons.includes('other') && (
                            <Textarea
                                placeholder="Please specify your reason..."
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                                className="mt-4 w-full text-gray-800"
                            />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2">Have you used any application similar to ours? If yes, please name the application(s).</label>
                        <div className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                checked={hasUsedSimilar}
                                onChange={(e) => setHasUsedSimilar(e.target.checked)}
                                className="mr-2"
                            />
                            <span>Yes</span>
                        </div>
                        {hasUsedSimilar && (
                            <Input
                                placeholder="Please name the application(s)..."
                                value={similarAppName}
                                onChange={(e) => setSimilarAppName(e.target.value)}
                                className="w-full bg-gray-100 text-gray-800"
                            />
                        )}
                    </div>
                    <div className="mt-6">
                        <label className="mb-2">Additional Feedback</label>
                        <Textarea
                            placeholder="Please provide your feedback here to help us improve..."
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            className="mt-1 w-full bg-gray-100 text-gray-800"
                        />
                    </div>
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <DialogFooter className="!justify-center">
                    <Button
                        className="w-[100px]"
                        variant="outline"
                        onClick={handleSkip}>
                        Skip
                    </Button>
                    <Button
                        className="w-[100px]"
                        variant="green"
                        onClick={handleSubmit}>
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FeedbackModal;
