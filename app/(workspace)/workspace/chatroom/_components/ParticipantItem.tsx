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

  useEffect(() => {
    setIsSilenced(initialSilencedState);
  }, [initialSilencedState]);

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
                <button
                  onClick={() => handleRemoveMember(participant.participantId)}
                  title="Remove Member"
                >
                  <UserRoundMinus className="text-red-600 cursor-pointer" />
                </button>
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
              <button title="Discharge Admin">
                <UserRoundX
                  className="cursor-pointer"
                  onClick={() =>
                    dischargeAppointAdmin(participant.participantId)
                  }
                />
              </button>
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
