'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Gift } from 'lucide-react';

interface OfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    onReject: () => void;
}

const OfferModal: React.FC<OfferModalProps> = ({ isOpen, onClose, onAccept, onReject }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-center">
                        <Gift /> &nbsp; Special Offer 
                    </DialogTitle>
                    <DialogDescription className="h-32 content-center text-center">
                        We hate to see you go! How about one month free on your current subscription plan?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="!justify-center">
                    <Button 
                        variant="outline" 
                        onClick={onReject}>
                        No, I still want to cancel
                    </Button>
                    <Button
                        variant="green"
                        onClick={onAccept}>
                        Accept Offer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OfferModal;
