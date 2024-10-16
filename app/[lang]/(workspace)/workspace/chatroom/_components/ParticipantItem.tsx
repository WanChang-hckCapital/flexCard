"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  UserRoundX,
  MessageCircleXIcon,
  MessageCircle,
  User,
  UserRoundMinus,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ParticipantItemProps {
  participant: any;
  authenticatedUserId: string;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isCurrentUserSuperAdmin: boolean;
  isCurrentUserAdmin: boolean;
  isSilenced: boolean;
  silentUntil: string | null;
  handleAppointAdmin: (participantId: string) => void;
  dischargeAppointAdmin: (participantId: string) => void;
  handleSilentClick: (participantId: string) => void;
  unsilentHandler: (participantId: string) => void;
  handleRemoveMember: (participantId: string) => void;
  dict: any;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  authenticatedUserId,
  isSuperAdmin,
  isAdmin,
  isCurrentUserSuperAdmin,
  isCurrentUserAdmin,
  isSilenced: initialSilencedState,
  silentUntil,
  handleAppointAdmin,
  dischargeAppointAdmin,
  handleSilentClick,
  unsilentHandler,
  handleRemoveMember,
  dict,
}) => {
  const [isSilenced, setIsSilenced] = useState<boolean>(initialSilencedState);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState<boolean>(false);
  const [isDischargeDialogOpen, setIsDischargeDialogOpen] =
    useState<boolean>(false);

  useEffect(() => {
    setIsSilenced(initialSilencedState);
  }, [initialSilencedState]);

  const handleConfirmRemove = () => {
    handleRemoveMember(participant.participantId);
    setIsRemoveDialogOpen(false);
  };

  const handleConfirmDischarge = () => {
    dischargeAppointAdmin(participant.participantId);
    setIsDischargeDialogOpen(false);
  };

  return (
    <ul>
      <li className="flex items-center gap-2">
        <Avatar className="h-10 w-10 mr-2">
          <AvatarImage src={participant.image || "/assets/user.svg"} />
          <AvatarFallback>{participant.accountname?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 justify-between items-center">
          <div className="flex flex-col">
            <p className="text-base">
              {participant.participantId === authenticatedUserId
                ? "You"
                : participant.accountname}
            </p>
            {isSuperAdmin && (
              <span className="text-xs text-blue-600">
                {dict.chatroom.groupchat.manage.owner}
              </span>
            )}
            {isAdmin && !isSuperAdmin && (
              <span className="text-xs text-blue-600">
                {dict.chatroom.groupchat.manage.admin}
              </span>
            )}
            {isSilenced && (
              <span className="text-xs text-red-600">
                {dict.chatroom.groupchat.manage.silentuntil}{" "}
                {silentUntil
                  ? new Date(silentUntil).toLocaleString()
                  : "Indefinitely"}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!isSuperAdmin &&
              participant.participantId !== authenticatedUserId &&
              (isCurrentUserSuperAdmin || isCurrentUserAdmin) && (
                <>
                  <Dialog
                    open={isRemoveDialogOpen}
                    onOpenChange={setIsRemoveDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <button
                        onClick={() => setIsRemoveDialogOpen(true)}
                        title="Remove Member"
                      >
                        <UserRoundMinus className="text-red-600 cursor-pointer" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="z-[1100]">
                      <DialogHeader>
                        <DialogTitle>
                          {dict.chatroom.groupchat.manage.removeparticipant}
                        </DialogTitle>
                        <DialogDescription>
                          {
                            dict.chatroom.groupchat.manage
                              .removeparticipantmessage_1
                          }{" "}
                          {participant.accountname}{" "}
                          {
                            dict.chatroom.groupchat.manage
                              .removeparticipantmessage_2
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsRemoveDialogOpen(false)}
                        >
                          {dict.chatroom.groupchat.manage.removecancel}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleConfirmRemove}
                        >
                          {dict.chatroom.groupchat.manage.removeconfirm}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}

            {!isAdmin && !isSuperAdmin && isCurrentUserSuperAdmin && (
              <button
                onClick={() => handleAppointAdmin(participant.participantId)}
                title="Appoint as Admin"
              >
                <User />
              </button>
            )}

            {isAdmin && !isSuperAdmin && isCurrentUserSuperAdmin && (
              <>
                <Dialog
                  open={isDischargeDialogOpen}
                  onOpenChange={setIsDischargeDialogOpen}
                >
                  <DialogTrigger asChild>
                    <button title="Discharge Admin">
                      <UserRoundX
                        className="cursor-pointer"
                        onClick={() => setIsDischargeDialogOpen(true)}
                      />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="z-[1100]">
                    <DialogHeader>
                      <DialogTitle>
                        {dict.chatroom.groupchat.manage.dischargeadmin}
                      </DialogTitle>
                      <DialogDescription>
                        {dict.chatroom.groupchat.manage.dischargeadminmessage_1}{" "}
                        {participant.accountname}{" "}
                        {dict.chatroom.groupchat.manage.dischargeadminmessage_2}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDischargeDialogOpen(false)}
                      >
                        {dict.chatroom.groupchat.manage.dischargecancel}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleConfirmDischarge}
                      >
                        {dict.chatroom.groupchat.manage.dischargeconfirm}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {(isCurrentUserSuperAdmin || isCurrentUserAdmin) &&
              !isSuperAdmin &&
              !isAdmin && (
                <>
                  {!isSilenced ? (
                    <button title="Silence User">
                      <MessageCircleXIcon
                        className="cursor-pointer"
                        onClick={() =>
                          handleSilentClick(participant.participantId)
                        }
                      />
                    </button>
                  ) : (
                    <button
                      onClick={() => unsilentHandler(participant.participantId)}
                      title="Unsilence User"
                    >
                      <MessageCircle />
                    </button>
                  )}
                </>
              )}
          </div>
        </div>
      </li>
    </ul>
  );
};

export default ParticipantItem;
