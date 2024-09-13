"use client";

import React from "react";
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
import { Plus, UserRoundX, MessageCircleX, Pencil } from "lucide-react";

interface PersonalInfoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChatroomData: any;
  authenticatedUserId: string;
  blockUserHandler: () => void;
}

export default function PersonalInfoSheet({
  isOpen,
  onClose,
  selectedChatroomData,
  authenticatedUserId,
  blockUserHandler,
}: PersonalInfoSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="flex flex-col justify-between h-full"
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
          <Button
            className="w-full"
            variant="destructive"
            onClick={blockUserHandler}
          >
            Block User
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
