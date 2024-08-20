"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SendIcon, PlusIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  getMutualFollowStatus,
  createOrGetChatroom,
} from "@/lib/actions/user.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getChatroomParticipantsImage } from "@/lib/actions/user.actions";

interface Message {
  _id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    _id: string;
    image: string | null;
  };
}

interface ChatroomMainBarProps {
  chatrooms: any[];
  authenticatedUserId: string;
  selectedChatroom: string | null;
  allUsers: any[];
  messages: Message[];
  ws: WebSocket | null;
}

export default function ChatRoomMainBar({
  chatrooms,
  authenticatedUserId,
  selectedChatroom,
  allUsers,
  messages,
  ws,
}: ChatroomMainBarProps) {
  if (!selectedChatroom) {
    return <div>Select a chatroom to start chatting.</div>;
  }

  const [messageContent, setMessageContent] = useState<string>("");
  const [currentMessages, setCurrentMessages] = useState<Message[]>(messages);
  const [participantImages, setParticipantImages] = useState<
    { participantId: string; image: string | null }[]
  >([]);

  useEffect(() => {
    const fetchParticipantImages = async () => {
      if (selectedChatroom) {
        const response = await getChatroomParticipantsImage(
          selectedChatroom,
          authenticatedUserId
        );
        if (response.success && response.images) {
          setParticipantImages(response.images);
        } else {
          console.error(
            "Failed to fetch participant images: ",
            response.message
          );
        }
      }
    };

    fetchParticipantImages();
  }, [selectedChatroom]);

  useEffect(() => {
    // if (messages && messages.length > 0) {
    setCurrentMessages(messages);
    // }
  }, [messages]);

  const selectedChatroomData = chatrooms.find(
    (chatroom) => chatroom._id === selectedChatroom
  );

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
    content: string,
    ws: WebSocket
  ) => {
    if (!content.trim() || !ws) return;

    console.log("senderId:" + senderId);
    console.log("chatroomId:" + chatroomId);
    console.log("content:" + content);

    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        const message = {
          type: "sendMessage",
          senderId,
          chatroomId,
          content,
        };

        const newMessage: Message = {
          _id: Date.now().toString(),
          content,
          senderId,
          createdAt: new Date().toISOString(),
          sender: {
            _id: senderId,
            image: null,
          },
        };

        console.log("newMessage:" + newMessage);

        setCurrentMessages((prevMessages) => [...prevMessages, newMessage]);

        ws.send(JSON.stringify(message));

        console.log("Message sent via WebSocket!");
      } else {
        console.error("WebSocket is not open. Cannot send message.");
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);
    }

    setMessageContent("");
  };

  const formatMessageTime = (dateString: string): string => {
    const messageDate = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - messageDate.getTime()) / 1000
    );
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const day = messageDate.getDate();
      const month = messageDate
        .toLocaleString("en-US", { month: "short" })
        .toUpperCase();
      const time = messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${day} ${month} AT ${time}`;
    }
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {currentMessages.length > 0 ? (
            currentMessages.map((message: Message) => {
              const senderImage = participantImages.find(
                (img) => img.participantId === message.senderId
              )?.image;

              return (
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
                      <AvatarImage
                        src={senderImage || "/placeholder-user.jpg"}
                      />
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
                      {/* {new Date(message.createdAt).toLocaleTimeString()} */}
                      {formatMessageTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
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
              onClick={() => {
                if (ws) {
                  sendMessageHandler(
                    authenticatedUserId,
                    selectedChatroom,
                    messageContent,
                    ws
                  );
                } else {
                  console.error("WebSocket connection is not available.");
                }
              }}
            >
              <SendIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
