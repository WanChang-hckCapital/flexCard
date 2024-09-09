"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { SendIcon, PlusIcon, UserIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import ChatRoomSearchBar from "./ChatRoomSearchBar";
import { Dialog, DialogContent, DialogOverlay } from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  createOrGetChatroom,
  createGroupChatroom,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface AllFollowerAndFollowing {
  success: boolean;
  message: string;
  followers: any[];
  following: any[];
}

interface Participant {
  _id: string;
  accountname: string;
  image: string;
  user: string;
}

interface Chatroom {
  _id: string;
  name: string;
  type: string;
  participants: Participant[];
  chatroomId: string;
  createdAt: string;
}

interface ChatroomSideBarProps {
  chatrooms: Chatroom[];
  authenticatedUserId: string;
  //   allUsers: any[];
  //   allFollowerAndFollowing: AllFollowerAndFollowing;
  onSelectChatroom: (chatroomId: string) => void;
  allUsers: any[];
  allFollowerAndFollowingForPersonal: { followers: any[]; following: any[] };
  allFollowerAndFollowingForGroup: { followers: any[]; following: any[] };
}

export default function ChatRoomSideBar({
  chatrooms,
  authenticatedUserId,
  onSelectChatroom,
  allUsers,
  allFollowerAndFollowingForPersonal,
  allFollowerAndFollowingForGroup,
}: ChatroomSideBarProps) {
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([
    authenticatedUserId,
  ]);
  const [groupChatName, setGroupChatName] = useState("");

  const showNewPersonalChat = () => {
    console.log("new chat");
    setIsPersonalModalOpen(true);
  };

  const closePersonalModal = () => {
    setIsPersonalModalOpen(false);
  };

  const createNewGroupChat = () => {
    console.log("Creating a new group chat");
    setIsGroupModalOpen(true);
  };

  const closeGroupModal = () => {
    setIsGroupModalOpen(false);
    setSelectedParticipants([authenticatedUserId]); // reset to including the current user
    // setIsConfirmingGroup(false);
  };

  const handleCheckboxChange = (participantId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    );
  };

  // create new group chatroom
  const handleCreateGroupChat = async () => {
    console.log("Creating group chat with name:", groupChatName);
    console.log("Participants:", selectedParticipants);
    closeGroupModal();

    try {
      const newGroupChatroom = await createGroupChatroom(
        authenticatedUserId,
        selectedParticipants,
        groupChatName
      );

      console.log(newGroupChatroom);

      if (newGroupChatroom.success) {
        // console.log(
        //   "Group Chatroom created successfully:",
        //   newGroupChatroom.chatroom
        // );
        toast.success(`Group Chatroom created ${groupChatName} successfully!`);
      } else {
        console.error(
          "Failed to create or retrieve group chatroom:",
          newGroupChatroom.message
        );
        toast.error("Error: " + newGroupChatroom.message);
      }
    } catch (error: any) {
      console.error("Error in creating new group chatroom:", error);
      toast.error(
        "An error occurred while creating or retrieving the group chatroom."
      );
    }
  };

  // create personal chatroom
  const createNewPersonalChatroom = async (participantId: string) => {
    console.log(
      "Attempting to create or get chatroom for participant:",
      participantId
    );

    try {
      const newChatroom = await createOrGetChatroom(
        authenticatedUserId,
        participantId
      );

      console.log(newChatroom);

      if (newChatroom.success) {
        console.log("Chatroom created successfully:", newChatroom.chatroom);
        toast.success("Chatroom created successfully!");
      } else {
        console.error(
          "Failed to create or retrieve chatroom:",
          newChatroom.message
        );
        toast.error("Error: " + newChatroom.message);
      }
    } catch (error: any) {
      console.error("Error in createNewPersonalChatroom:", error);
      toast.error(
        "An error occurred while creating or retrieving the chatroom."
      );
    }
  };

  return (
    <>
      <div className="flex justify-center p-4">
        <ChatRoomSearchBar />
      </div>
      <hr></hr>
      <div className="flex h-14 items-center border-b px-4">
        <h3 className="text-lg font-semibold">Messages</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto rounded-full"
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={showNewPersonalChat}>
              <UserIcon className="mr-2 h-4 w-4" />
              New Chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={createNewGroupChat}>
              <UsersIcon className="mr-2 h-4 w-4" />
              New Group Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isPersonalModalOpen && (
        <Dialog
          open={isPersonalModalOpen}
          onOpenChange={setIsPersonalModalOpen}
        >
          <DialogOverlay className="fixed inset-0 bg-black opacity-30" />
          <DialogContent className="fixed inset-0 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
              <button
                className="absolute top-2 right-2"
                onClick={closePersonalModal}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
              <h3 className="text-lg font-semibold text-black">New Chat</h3>
              <div className="mt-4 max-h-64 overflow-y-auto">
                {allFollowerAndFollowingForPersonal.followers.map(
                  (follower) => (
                    <div
                      key={follower.id}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:bg-gray-200"
                      onClick={() => createNewPersonalChatroom(follower.userId)}
                    >
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage src={follower.image} />
                        <AvatarFallback>
                          {follower.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium truncate text-black">
                          {follower.name}
                        </div>
                      </div>
                    </div>
                  )
                )}
                {allFollowerAndFollowingForPersonal.following.map(
                  (following) => (
                    <div
                      key={following.id}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:bg-gray-200"
                      onClick={() =>
                        createNewPersonalChatroom(following.userId)
                      }
                    >
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage src={following.image} />
                        <AvatarFallback>
                          {following.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium truncate text-black">
                          {following.name}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isGroupModalOpen && (
        <Dialog open={isGroupModalOpen}>
          <DialogOverlay className="fixed inset-0 bg-black opacity-30" />
          <DialogContent className="fixed inset-0 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg relative">
              <button
                className="absolute top-2 right-2"
                onClick={closeGroupModal}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
              <h3 className="text-lg font-semibold text-black">
                New Group Chat
              </h3>
              <p className="text-black">
                Here you can add participants or start a new chat.
              </p>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter group chat name"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                />
              </div>
              <div className="mt-4 max-h-64 overflow-y-auto">
                {allFollowerAndFollowingForGroup.followers.map((follower) => (
                  <div
                    key={follower.id}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:bg-gray-200"
                  >
                    <input
                      type="checkbox"
                      onChange={() => handleCheckboxChange(follower.userId)}
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage
                        src={follower.image || "/placeholder-user.jpg"}
                      />
                      <AvatarFallback>{follower.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium truncate text-black">
                        {follower.name}
                      </div>
                    </div>
                  </div>
                ))}
                {allFollowerAndFollowingForGroup.following.map((following) => (
                  <div
                    key={following.id}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:bg-gray-200"
                  >
                    <input
                      type="checkbox"
                      onChange={() => handleCheckboxChange(following.userId)}
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage
                        src={following.image || "/placeholder-user.jpg"}
                      />
                      <AvatarFallback>
                        {following.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium truncate text-black">
                        {following.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={handleCreateGroupChat} className="mt-4 w-full">
                Create Group Chat
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* <div className="border-t p-2">
        <div className="flex-1 overflow-auto">
          <nav className="space-y-1">
            {allUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:bg-muted"
              >
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={user.image || "/placeholder-user.jpg"} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium truncate">{user.name}</div>
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div> */}
      {/* <div className="border-t p-2">
        <div className="flex-1 overflow-auto">
          <Accordion type="single" collapsible>
            <AccordionItem value="followers">
              <AccordionTrigger>Followers</AccordionTrigger>
              <AccordionContent>
                <nav className="space-y-1">
                  {followers.map((follower) => (
                    <div
                      key={follower.id}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:bg-muted"
                    >
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage
                          src={follower.image || "/placeholder-user.jpg"}
                        />
                        <AvatarFallback>
                          {follower.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium truncate">
                          {follower.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </nav>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="following">
              <AccordionTrigger>Following</AccordionTrigger>
              <AccordionContent>
                <nav className="space-y-1">
                  {following.map((follow) => (
                    <div
                      key={follow.id}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:bg-muted"
                    >
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage
                          src={follow.image || "/placeholder-user.jpg"}
                        />
                        <AvatarFallback>{follow.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium truncate">
                          {follow.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </nav>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div> */}
      {/* <div className="flex-1 overflow-auto">
        <nav className="space-y-1 p-2">
          {chatrooms.map((chatroom) => (
            <Link
              key={chatroom.id}
              href={`/chat/${chatroom.id}`}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={chatroom.image || "/placeholder-user.jpg"} />
                <AvatarFallback>{chatroom.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="font-medium truncate">{chatroom.name}</div>
                <p className="text-muted-foreground truncate">
                  {chatroom.lastMessage || "No messages yet"}
                </p>
              </div>
              {chatroom.lastMessageTime && (
                <div className="text-xs text-muted-foreground">
                  {chatroom.lastMessageTime}
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div> */}
      <div className="flex-1 overflow-auto">
        <nav className="space-y-2">
          {chatrooms.map((chatroom) => (
            <div
              key={chatroom._id}
              onClick={() => onSelectChatroom(chatroom.chatroomId)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:bg-gray-200 hover:text-black"
            >
              {chatroom.type == "PERSONAL" && (
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={chatroom.participants[0].image} />
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
              )}
              {chatroom.type == "GROUP" && (
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src="/assets/users.svg" />
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
              )}

              <div className="flex-1 overflow-hidden">
                {chatroom.type == "PERSONAL" && (
                  <div className="font-medium truncate">
                    {chatroom.participants[0].accountname}
                  </div>
                )}
                {chatroom.type == "GROUP" && (
                  <div className="font-medium truncate">{chatroom.name}</div>
                )}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
