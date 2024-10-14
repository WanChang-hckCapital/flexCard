"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getProfileImage } from "@/lib/actions/user.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import {
  acceptInvitation,
  declineInvitation,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface invitationResponse {
  _id: string;
  inviter: { _id: string; accountname: string; image: string };
  invitor: string;
  status: string;
  acceptedAt: Date;
  declinedAt: Date;
  sentAt: Date;
}

interface InvitationModalProps {
  invitationMessage: string;
  invitation?: invitationResponse;
  onClose: () => void;
  onInvitationResponded: () => void;
}

const InvitationModal: React.FC<InvitationModalProps> = ({
  invitationMessage,
  invitation,
  onClose,
  onInvitationResponded,
}) => {
  const [inviterImage, setInviterImage] = useState<string | null>(null);

  useEffect(() => {
    if (!invitation || !invitation.inviter._id) return;

    async function fetchImage() {
      if (!invitation) return;
      try {
        const imageResponse = await getProfileImage(invitation.inviter._id);

        if (imageResponse?.imageUrl) {
          setInviterImage(imageResponse.imageUrl);
        } else {
          setInviterImage(null);
        }
      } catch (error) {
        console.error("Error fetching inviter image:", error);
        setInviterImage(null);
      }
    }

    fetchImage();
  }, [invitation]);

  const handleAccept = async () => {
    if (!invitation) return;

    try {
      const response = await acceptInvitation(invitation?._id);
      if (response.success) {
        onClose();
        onInvitationResponded();
        toast.message(response.message);
      }
    } catch (error: any) {
      toast.error("Error when sending the invitation.");
      console.error("Error accepting invitation:", error);
    }
  };

  const confirmDecline = async () => {
    if (!invitation) return;

    try {
      const response = await declineInvitation(invitation?._id);
      if (response.success) {
        onClose();
        onInvitationResponded();
        // setShowDeclineAlert(false);
        toast.message(response.message);
      }
    } catch (error: any) {
      toast.error("Error when decline the invitation.");
      console.error("Error accepting invitation:", error);
    }
  };

  const formatTime = (dateString: string): string => {
    const messageDate = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - messageDate.getTime()) / 1000
    );
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"} ago`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    } else {
      const day = messageDate.getDate();
      const month = messageDate
        .toLocaleString("en-US", { month: "short" })
        .toUpperCase();
      const time = messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${day} ${month} AT ${time}`;
    }
  };

  if (!invitation) {
    return null;
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-6 rounded-lg shadow-lg">
        <DialogHeader className="border-b pb-4 mb-4">
          <DialogTitle className="text-xl font-semibold">
            Blog Invitation
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-700 mb-6">
          You have an invitation to become the creator. Once accepted, you are
          allowed to create blog in our website.
        </p>

        {invitation && (
          <div className="flex items-center space-x-4 mb-6">
            {inviterImage && (
              <Image
                src={inviterImage}
                width={50}
                height={50}
                alt={invitation.inviter.accountname}
                className="w-12 h-12 rounded-full shadow-md"
              />
            )}
            <div className="text-sm">
              <p className="font-medium text-gray-800">
                <strong>Sender:</strong> {invitation.inviter.accountname}
              </p>
              <p className="text-gray-600">
                <strong>Invitation Sent:</strong>{" "}
                {formatTime(invitation.sentAt.toISOString())}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                Decline
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Decline</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to decline this invitation? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDecline}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            onClick={handleAccept}
          >
            Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvitationModal;
