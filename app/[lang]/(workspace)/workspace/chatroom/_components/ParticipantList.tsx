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
  dict: any;
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
  dict,
}) => {
  return (
    <ul className="space-y-4">
      {participants.map((participant: any) => {
        const silentEntries = silentUsers
          .filter(
            (silentUser) => silentUser.userId === participant.participantId
          )
          .filter(
            (silentUser) =>
              silentUser.silentUntil === null ||
              new Date(silentUser.silentUntil) > new Date()
          );

        const latestSilentUntil = silentEntries.length
          ? new Date(
              silentEntries
                .map((entry) => new Date(entry.silentUntil as string))
                .sort((a, b) => b.getTime() - a.getTime())[0]
            )
          : null;

        const isSilenced = latestSilentUntil !== null;

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
            silentUntil={
              latestSilentUntil ? latestSilentUntil.toISOString() : null
            }
            handleAppointAdmin={handleAppointAdmin}
            dischargeAppointAdmin={dischargeAppointAdmin}
            handleSilentClick={handleSilentClick}
            unsilentHandler={unsilentHandler}
            handleRemoveMember={handleRemoveMember}
            dict={dict}
          />
        );
      })}
    </ul>
  );
};

export default ParticipantList;
