"use client";

import React from "react";
import ParticipantItem from "./ParticipantItem";

interface ParticipantListProps {
  participants: any[];
  authenticatedUserId: string;
  superAdmins: string[];
  admins: string[];
  silentUsers: { userId: string; silentUntil: string | null }[];
  handleAppointAdmin: (participantId: string) => void;
  dischargeAppointAdmin: (participantId: string) => void;
  handleSilentClick: (participantId: string) => void;
  unsilentHandler: (participantId: string) => void;
  handleRemoveMember: (participantId: string) => void;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  authenticatedUserId,
  superAdmins,
  admins,
  silentUsers,
  handleAppointAdmin,
  dischargeAppointAdmin,
  handleSilentClick,
  unsilentHandler,
  handleRemoveMember,
}) => {
  return (
    <ul className="space-y-4">
      {participants.map((participant: any) => {
        const isSilenced = silentUsers.some(
          (silentUser) => silentUser.userId === participant.participantId
        );
        const silentUntil =
          silentUsers.find((user) => user.userId === participant.participantId)
            ?.silentUntil ?? null;

        const isSuperAdmin = superAdmins.includes(participant.participantId);
        const isAdmin = admins.includes(participant.participantId);
        const isCurrentUserSuperAdmin =
          superAdmins.includes(authenticatedUserId);
        const isCurrentUserAdmin = admins.includes(authenticatedUserId);

        return (
          <ParticipantItem
            key={participant.participantId}
            participant={participant}
            authenticatedUserId={authenticatedUserId}
            isSuperAdmin={isSuperAdmin}
            isAdmin={isAdmin}
            isCurrentUserSuperAdmin={isCurrentUserSuperAdmin}
            isCurrentUserAdmin={isCurrentUserAdmin}
            isSilenced={isSilenced}
            silentUntil={silentUntil}
            handleAppointAdmin={handleAppointAdmin}
            dischargeAppointAdmin={dischargeAppointAdmin}
            handleSilentClick={handleSilentClick}
            unsilentHandler={unsilentHandler}
            handleRemoveMember={handleRemoveMember}
          />
        );
      })}
    </ul>
  );
};

export default ParticipantList;
