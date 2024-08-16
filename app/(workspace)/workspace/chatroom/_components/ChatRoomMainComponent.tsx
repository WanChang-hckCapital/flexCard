"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SendIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchAllUser,
  getMutualFollowStatus,
  createOrGetChatroom,
  sendMessage,
} from "@/lib/actions/user.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Message {
  _id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface ChatroomMainBarProps {
  chatrooms: any[];
  authenticatedUserId: string;
  selectedChatroom: string | null;
  messages: Message[];
}

export default function ChatRoomMainBar({
  chatrooms,
  authenticatedUserId,
  selectedChatroom,
  messages,
}: ChatroomMainBarProps) {
  //   const [allUsers, setAllUsers] = useState<{
  //     success: boolean;
  //     users: any[];
  //     message: string;
  //   }>({
  //     success: false,
  //     users: [],
  //     message: "",
  //   });

  if (!selectedChatroom) {
    return <div>Select a chatroom to start chatting.</div>;
  }

  //   console.log("selectedChatroom:" + selectedChatroom);
  const [messageContent, setMessageContent] = useState<string>("");

  // first time chatting
  const createChatBox = async (
    authenticatedId: string,
    targetUserId: string
  ) => {
    console.log("authenticatedId:" + authenticatedId);
    console.log("targetUserId" + targetUserId);
    try {
      const response = await createOrGetChatroom(authenticatedId, targetUserId);
      if (response.success) {
        console.log("_id:" + response.chatroom._id);
        // setCurrentChatroomId(response.chatroom.id);
      } else {
        console.error("Failed to create or get chatroom:", response.message);
      }
    } catch (error) {
      console.error("Error creating or getting chatroom:", error);
    }
  };

  const getMutualStatus = async (
    authenticatedUserId: string,
    targetUserId: string
  ) => {
    try {
      const mutualStatus = await getMutualFollowStatus(
        authenticatedUserId,
        targetUserId
      );

      if (mutualStatus.success) {
        console.log("Mutual Follow Status:", mutualStatus);
      } else {
        console.error(
          "Error fetching mutual follow status:",
          mutualStatus.message
        );
      }

      return mutualStatus;
    } catch (error) {
      console.error("Error in getMutualStatus:", error);
      return { success: false, message: "Error occurred", mutualFollow: false };
    }
  };

  const sendMessageHandler = async (
    senderId: string,
    chatroomId: string,
    content: string
  ) => {
    if (!content.trim()) return;

    console.log("senderId:" + senderId);
    console.log("chatroomId:" + chatroomId);
    console.log("content:" + content);

    try {
      const sendMessageResponse = await sendMessage(
        senderId,
        chatroomId,
        content
      );

      if (sendMessageResponse.success) {
        console.log("Successfully send message!");
      } else {
        console.log("Send Message fail!!");
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);
    }
    setMessageContent("");
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {messages.length > 0 ? (
            messages.map((message: any) => (
              <div
                key={message._id}
                className={`flex items-start gap-3 ${
                  message.senderId === authenticatedUserId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.senderId !== authenticatedUserId && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src="/path-to-other-avatar.jpg" />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] rounded-lg p-3 text-sm ${
                    message.senderId === authenticatedUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p>{message.content}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No messages yet.</p>
          )}
        </div>
        {/* {chatrooms.length > 0 ? (
          chatrooms.map((chatroom, index) => (
            <div key={index}>
              <p>{chatroom.name}</p>
              <p>{chatroom.chatroomId}</p>
            </div>
          ))
        ) : (
          <>
            <p className="text-center text-xl font-semibold text-gray-100 mt-6 p-4 rounded-lg shadow-sm">
              No previous chat!
            </p>
            {allUsers.success && allUsers.users.length > 0 && (
              <div className="mt-4 w-full flex justify-center">
                <Card className="w-full max-w-lg">
                  <CardHeader>
                    <CardTitle className="text-center">All Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-full">
                      <ul>
                        {allUsers.users.map((user, index) => (
                          <li key={index} className="mb-2">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 mb-4">
                                <AvatarImage
                                  src={user.image || "/placeholder-user.jpg"}
                                />
                                <AvatarFallback>
                                  {user.name ? user.name.charAt(0) : "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex justify-between item-center w-full">
                                <p className="font-medium">{user.name}</p>
                                <Button
                                  className="ml-2"
                                  onClick={() =>
                                    createChatBox(
                                      authenticatedUserId,
                                      user.userId
                                    )
                                  }
                                >
                                  Chat
                                </Button>
                                <Button
                                  className="ml-2"
                                  onClick={() =>
                                    getMutualStatus(
                                      authenticatedUserId,
                                      user.userId
                                    )
                                  }
                                >
                                  Mutual Status
                                </Button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )} */}
        {/* <div className="flex h-14 items-center border-b px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">Acme Inc</div>
              <p className="text-muted-foreground text-sm">Online</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2"></div>
        </div>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              <div className="max-w-[75%] rounded-lg bg-muted p-3 text-sm">
                <p>Hey, how's it going?</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  2:34 PM
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 justify-end">
              <div className="max-w-[75%] rounded-lg bg-primary p-3 text-sm text-primary-foreground">
                <p>Pretty good, just working on some new features.</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  2:35 PM
                </div>
              </div>
              <Avatar className="h-8 w-8 border">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              <div className="max-w-[75%] rounded-lg bg-muted p-3 text-sm">
                <p>That's great, let me know if you need any help!</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  2:36 PM
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 justify-end">
              <div className="max-w-[75%] rounded-lg bg-primary p-3 text-sm text-primary-foreground">
                <p>Will do, thanks!</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  2:37 PM
                </div>
              </div>
              <Avatar className="h-8 w-8 border">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div> */}
        <div className="border-t px-4 py-3 md:px-6">
          <div className="relative flex item-center">
            <Textarea
              placeholder="Type your message..."
              className="min-h-[48px] w-full rounded-2xl text-black resize-none pr-16"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() =>
                sendMessageHandler(
                  authenticatedUserId,
                  selectedChatroom,
                  messageContent
                )
              }
            >
              <SendIcon className="w-4 h-4" />
              {/* <span className="sr-only">Send</span> */}
            </Button>
          </div>
        </div>

        {/* <h2 className="text-xl font-bold">{selectedChatroom._id}</h2> */}
        {/* Render participants, messages, etc., using selectedChatroom */}
        {/* <div>
          <h3>Participants:</h3> */}
        {/* <ul>
          {selectedChatroom.participants.map((participant) => (
            <li key={participant._id}>{participant.accountName}</li>
          ))}
        </ul> */}
        {/* </div> */}
      </div>
    </>
  );
}
