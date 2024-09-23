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
              <span className="text-xs text-blue-600">Owner</span>
            )}
            {isAdmin && !isSuperAdmin && (
              <span className="text-xs text-blue-600">Admin</span>
            )}
            {isSilenced && (
              <span className="text-xs text-red-600">
                Silent Until{" "}
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
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove Participant</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove{" "}
                          {participant.accountname} from the chatroom?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsRemoveDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleConfirmRemove}
                        >
                          Remove
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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Discharge Admin</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to discharge{" "}
                        {participant.accountname} from being an admin?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDischargeDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleConfirmDischarge}
                      >
                        Discharge
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
