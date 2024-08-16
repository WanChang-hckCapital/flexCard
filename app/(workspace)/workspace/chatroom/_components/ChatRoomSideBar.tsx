"use client";

import React from "react";
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

interface AllFollowerAndFollowing {
  success: boolean;
  message: string;
  followers: any[];
  following: any[];
}

interface Participant {
  _id: string;
  accountName: string;
  image: string;
}

interface Chatroom {
  _id: string;
  name: string;
  participants: Participant[];
  chatroomId: string;
}

interface ChatroomSideBarProps {
  chatrooms: Chatroom[];
  authenticatedUserId: string;
  //   allUsers: any[];
  //   allFollowerAndFollowing: AllFollowerAndFollowing;
  onSelectChatroom: (chatroomId: string) => void;
  allUsers: any[];
  allFollowerAndFollowing: { followers: any[]; following: any[] };
}

export default function ChatRoomSideBar({
  chatrooms,
  authenticatedUserId,
  onSelectChatroom,
  allUsers,
  allFollowerAndFollowing,
}: ChatroomSideBarProps) {
  //   const { followers, following } = allFollowerAndFollowing;

  // fetch message
  //   const fetchMessage = (authenticatedUserId: string, targetUserId: string) => {
  //     console.log("fetch message");
  //   };

  const createNewChat = () => {
    console.log("new chat");
  };

  const createNewGroupChat = () => {
    console.log("Creating a new group chat");
  };

  return (
    <>
      <div className="flex justify-center p-4">
        <ChatRoomSearchBar />
      </div>
      <hr></hr>
      <div className="flex h-14 items-center border-b px-4">
        <h3 className="text-lg font-semibold">Messages</h3>
        {/* <Button variant="ghost" size="icon" className="ml-auto rounded-full">
          <PlusIcon className="h-5 w-5" onClick={createNewChat} />
        </Button> */}
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
            <DropdownMenuItem onClick={createNewChat}>
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
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:bg-white-900 hover:text-black"
            >
              <Avatar className="h-10 w-10 border">
                <AvatarImage
                  src={
                    chatroom.participants[0].image || "/placeholder-user.jpg"
                  }
                />
                {/* <AvatarFallback>{chatroom.name.charAt(0)}</AvatarFallback> */}
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="font-medium truncate">
                  {chatroom.participants[0].accountName}
                </div>
                {/* <div className="font-medium truncate">{chatroom.name}</div> */}
                <div className="font-medium truncate">
                  {chatroom.chatroomId}
                </div>
              </div>
              {/* {chatroom.lastMessageTime && (
                <div className="text-xs text-muted-foreground">
                  {chatroom.lastMessageTime}
                </div>
              )} */}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
