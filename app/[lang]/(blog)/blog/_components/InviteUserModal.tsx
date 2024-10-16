"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getBlogWriterList,
  sendCreatorInvitation,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface InviteUserModalProps {
  currentProfileId: string;
  onClose: () => void;
  dict: any;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  currentProfileId,
  onClose,
  dict,
}) => {
  const [profiles, setProfiles] = useState<
    { accountname: string; email: string; _id: string; image: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedProfile, setSelectedProfile] = useState<{
    accountname: string;
    email: string;
    _id: string;
  } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getBlogWriterList(currentProfileId);

      if (result.success) {
        setProfiles(result.profiles);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      setError("An error occurred while fetching users.");
      toast.error("An error occurred while fetching users.");
    } finally {
      setIsLoading(false);
    }
  }, [currentProfileId]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const inviteCreator = async (invitorId: string) => {
    if (!currentProfileId) {
      toast.error("You have to login to do so.");
      setError("You have to login to do so.");
      return;
    }

    try {
      const invitationRes = await sendCreatorInvitation(
        currentProfileId,
        invitorId
      );

      if (invitationRes.success) {
        toast.success(invitationRes.message);
        onClose();
      } else {
        toast.error(invitationRes.message);
      }
    } catch (error: any) {
      toast.error("Error when sending the invitation.");
    }
  };

  const handleInviteClick = (profile: {
    accountname: string;
    email: string;
    _id: string;
  }) => {
    setSelectedProfile(profile);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmInvite = () => {
    if (selectedProfile) {
      inviteCreator(selectedProfile._id);
    }
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="dark:bg-black dark:text-white bg-white text-black max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dict.blog.adminOrInviteCreator.invitecreatormodeltitle}
            </DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ul
              className="space-y-2 overflow-y-scroll"
              style={{ maxHeight: "300px" }}
            >
              {profiles.length > 0 ? (
                profiles.map((profile, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                  >
                    <span className="text-black">
                      {profile.accountname}{" "}
                      {profile.email && ` (${profile.email})`}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleInviteClick(profile)}
                    >
                      {dict.blog.adminOrInviteCreator.invitebutton}
                    </Button>
                  </li>
                ))
              ) : (
                <p>No users available to invite.</p>
              )}
            </ul>
          )}
          <div className="mt-4 flex justify-end">
            <Button onClick={onClose}>
              {dict.blog.adminOrInviteCreator.invitationmodalclose}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedProfile && (
        <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
          <DialogContent className="dark:bg-black dark:text-white bg-white text-black max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {" "}
                {dict.blog.adminOrInviteCreator.invitationconfirmationtitle}
              </DialogTitle>
            </DialogHeader>
            <p>
              {dict.blog.adminOrInviteCreator.invitationmessage_1}{" "}
              <strong>{selectedProfile.accountname}</strong>{" "}
              {dict.blog.adminOrInviteCreator.invitationmessage_2}
            </p>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setIsConfirmModalOpen(false)}>
                {dict.blog.adminOrInviteCreator.invitationconfirmationclose}
              </Button>
              <Button className="ml-2" onClick={handleConfirmInvite}>
                {dict.blog.adminOrInviteCreator.invitationconfirmationbutton}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default InviteUserModal;
