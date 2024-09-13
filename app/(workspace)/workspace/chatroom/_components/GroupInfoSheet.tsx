"use client";

import React, { useRef, useState, useEffect } from "react";
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
import { groupImageUpdate } from "@/lib/actions/user.actions";

interface GroupInfoProps {
  isGroupInfoSheetOpen: boolean;
  setGroupInfoSheetOpen: (open: boolean) => void;
  selectedChatroomData: any;
  authenticatedUserId: string;
  invitableUsers: any[];
  invitableUsersLoading: boolean;
  handleInvitorChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    userId: string
  ) => void;
  inviteUserHandler: () => void;
  handleAppointAdmin: (participantId: string) => void;
  dischargeAppointAdmin: (participantId: string) => void;
  silentHandler: (participantId: string) => void;
  leaveGroupHandler: () => void;
  loadInvitorList: () => void;
}

export default function GroupInfoSheet({
  isGroupInfoSheetOpen,
  setGroupInfoSheetOpen,
  selectedChatroomData,
  authenticatedUserId,
  invitableUsers,
  invitableUsersLoading,
  handleInvitorChange,
  inviteUserHandler,
  handleAppointAdmin,
  dischargeAppointAdmin,
  silentHandler,
  leaveGroupHandler,
  loadInvitorList,
}: GroupInfoProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [groupImageUrl, setGroupImageUrl] = useState<string | null>(null);
  const [groupImagePreview, setGroupImagePreview] = useState<string | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroupImage = async () => {
      if (selectedChatroomData?.groupImage) {
        try {
          const response = await fetch(
            `/api/group-image-load/${selectedChatroomData.groupImage}`
          );

          if (response.ok) {
            const data = await response.json();
            setGroupImageUrl(data.fileDataUrl);
          } else {
            console.error("Failed to load group image:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching group image:", error);
        }
      }
    };

    fetchGroupImage();
  }, [selectedChatroomData?.groupImage]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setGroupImagePreview(fileUrl);
      setSelectedFile(file);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("chatroomId", selectedChatroomData.chatroomId);

      const response = await fetch("/api/group-image-submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Group Image uploaded successfully:", result.fileId);

        const groupImageUpdateChatroom = await groupImageUpdate(
          selectedChatroomData.chatroomId,
          result.fileId
        );

        if (groupImageUpdateChatroom.success) {
          const newImageUrl = `/api/group-image-submit/${result.fileId}`;
          setGroupImageUrl(newImageUrl); // Update with new image URL after successful upload
          setGroupImagePreview(null); // Clear the preview after upload
        } else {
          console.error("Error updating chatroom with group image.");
        }
      } else {
        console.error("Error uploading image:", response.statusText);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUpload = () => {
    setGroupImagePreview(null);
    setSelectedFile(null);
  };

  return (
    <Sheet open={isGroupInfoSheetOpen} onOpenChange={setGroupInfoSheetOpen}>
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
                    groupImagePreview || groupImageUrl || "/assets/users.svg"
                  }
                  alt={selectedChatroomData?.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-5xl">
                  {selectedChatroomData?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {(selectedChatroomData?.superAdmin.includes(
                authenticatedUserId
              ) ||
                selectedChatroomData?.admin.includes(authenticatedUserId)) && (
                <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    className="text-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Pencil className="h-6 w-6" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>

            <div className="text-center mt-4">
              <SheetTitle className="text-base font-bold">
                {selectedChatroomData?.name || "Group Info"}
              </SheetTitle>
              <p className="text-sm text-gray-500">
                Created At:{" "}
                {selectedChatroomData?.createdAt
                  ? new Date(
                      selectedChatroomData.createdAt
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </SheetHeader>

        {groupImagePreview && (
          <div className="flex flex-col items-center mt-4">
            <img
              src={groupImagePreview}
              alt="Group Preview"
              className="w-32 h-32 object-cover rounded-full"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleConfirmUpload} disabled={loading}>
                Upload
              </Button>
              <Button variant="secondary" onClick={handleCancelUpload}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 flex-grow">
          <div className="flex justify-between items-center mb-4 ml-1">
            <p className="font-bold text-base mb-4 ml-1">
              {selectedChatroomData?.participants.length} Members
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button>
                  <Plus
                    onClick={loadInvitorList}
                    className="h-6 w-6 cursor-pointer text-gray-400 hover:text-white"
                  />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Invite a User</AlertDialogTitle>
                  <AlertDialogDescription>
                    Select a user to invite to the group.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="p-4">
                  {invitableUsersLoading ? (
                    <p>Loading users...</p>
                  ) : (
                    <ul className="space-y-2">
                      {invitableUsers.length > 0 ? (
                        invitableUsers.map((user) => (
                          <li
                            key={user._id}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              value={user._id}
                              onChange={(e) => handleInvitorChange(e, user._id)}
                            />
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.image || "/default-avatar.png"}
                              />
                              <AvatarFallback>
                                {user.accountname.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <p>{user.accountname}</p>
                          </li>
                        ))
                      ) : (
                        <p>No users available to invite.</p>
                      )}
                    </ul>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={inviteUserHandler}>
                    Invite
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <ul className="space-y-4">
            {selectedChatroomData?.participants.map((participant: any) => (
              <li
                key={participant.participantId}
                className="flex items-center gap-2"
              >
                <Avatar className="h-10 w-10 mr-2">
                  <AvatarImage src={participant.image || "/assets/user.svg"} />
                  <AvatarFallback>
                    {participant.accountname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 justify-between items-center">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <p className="text-base">
                        {participant.participantId === authenticatedUserId
                          ? "You"
                          : participant.accountname}
                      </p>
                    </div>
                    {selectedChatroomData?.superAdmin.includes(
                      participant.participantId
                    ) && (
                      <span className="text-xs text-blue-600">Super Admin</span>
                    )}
                    {selectedChatroomData?.admin.includes(
                      participant.participantId
                    ) && <span className="text-xs text-blue-600">Admin</span>}
                    {selectedChatroomData?.silentUser.find(
                      (silentUser: any) =>
                        silentUser.userId === participant.participantId &&
                        new Date(silentUser.silentUntil) > new Date()
                    ) && (
                      <span className="text-xs text-blue-600">
                        Silent Until{" "}
                        {new Date(
                          selectedChatroomData.silentUser.find(
                            (silentUser: any) =>
                              silentUser.userId === participant.participantId
                          )?.silentUntil
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center">
                    {!selectedChatroomData?.admin.includes(
                      participant.participantId
                    ) &&
                      !selectedChatroomData?.superAdmin.includes(
                        participant.participantId
                      ) &&
                      selectedChatroomData?.superAdmin.includes(
                        authenticatedUserId
                      ) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleAppointAdmin(participant.participantId)
                          }
                          className="text-black px-2 py-1 text-xs"
                        >
                          Admin
                        </Button>
                      )}

                    {selectedChatroomData?.admin.includes(
                      participant.participantId
                    ) &&
                      !selectedChatroomData?.superAdmin.includes(
                        participant.participantId
                      ) &&
                      selectedChatroomData?.superAdmin.includes(
                        authenticatedUserId
                      ) && (
                        <UserRoundX
                          onClick={() => {
                            dischargeAppointAdmin(participant.participantId);
                          }}
                        />
                      )}

                    {!selectedChatroomData?.superAdmin.includes(
                      participant.participantId
                    ) &&
                      !selectedChatroomData?.admin.includes(
                        participant.participantId
                      ) &&
                      !selectedChatroomData?.silentUser?.some(
                        (silentEntry: any) =>
                          silentEntry.userId === participant.participantId
                      ) && (
                        <MessageCircleX
                          className="ml-2 cursor-pointer"
                          onClick={() => {
                            silentHandler(participant.participantId);
                          }}
                        />
                      )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" variant="destructive">
                Leave Group
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. You will leave the group.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={leaveGroupHandler}>
                  Leave Group
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
