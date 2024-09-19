"use client";

import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { checkBlockedStatus } from "@/lib/actions/user.actions";

interface PersonalInfoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChatroomData: any;
  authenticatedUserId: string;
  blockUserHandler: (blockedUserId: string) => void;
  unblockUserHandler: (unblockUserId: string) => void;
}

export default function PersonalInfoSheet({
  isOpen,
  onClose,
  selectedChatroomData,
  authenticatedUserId,
  blockUserHandler,
  unblockUserHandler,
}: PersonalInfoSheetProps) {
  const [isUserBlocked, setIsUserBlocked] = useState(false);

  const otherParticipant = selectedChatroomData?.participants.find(
    (participant: any) => participant.participantId !== authenticatedUserId
  );

  useEffect(() => {
    const fetchBlockedAccounts = async () => {
      try {
        const response = await checkBlockedStatus(authenticatedUserId);
        if (response.success) {
          const blockedAccounts = response.blockedAccounts || [];

          const isBlocked = blockedAccounts.some(
            (blockacc: any) => blockacc._id === otherParticipant?.participantId
          );
          setIsUserBlocked(isBlocked);
        } else {
          console.error("Failed to fetch blocked accounts:", response.message);
        }
      } catch (error) {
        console.error("Error fetching blocked accounts:", error);
      }
    };

    if (otherParticipant) {
      fetchBlockedAccounts();
    }
  }, [authenticatedUserId, otherParticipant]);

  const handleBlockUser = async () => {
    try {
      await blockUserHandler(otherParticipant.participantId);
      setIsUserBlocked(true);
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const handleUnblockUser = async () => {
    try {
      await unblockUserHandler(otherParticipant.participantId);
      setIsUserBlocked(false);
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="flex flex-col justify-between h-full z-[1000]"
      >
        <SheetHeader>
          <div className="w-full flex flex-col items-center relative">
            <div className="relative group w-24 h-24">
              <Avatar className="w-full h-full">
                <AvatarImage
                  src={
                    selectedChatroomData?.participants.find(
                      (participant: any) =>
                        participant.participantId !== authenticatedUserId
                    )?.image || "/assets/users.svg"
                  }
                  alt={selectedChatroomData?.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-5xl">
                  {selectedChatroomData?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center mt-4">
              <SheetTitle className="text-xl font-bold">
                {selectedChatroomData?.participants.find(
                  (participant: any) =>
                    participant.participantId !== authenticatedUserId
                )?.accountname || "/assets/users.svg"}
              </SheetTitle>
            </div>
          </div>
        </SheetHeader>
        <div className="p-4">
          {isUserBlocked ? (
            <Button
              className="w-full"
              variant="destructive"
              onClick={handleUnblockUser}
            >
              Unblock User
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full" variant="destructive">
                  Block User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Block</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to block this user? You will not be
                    able to receive messages from them anymore.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBlockUser}>
                    Block User
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
