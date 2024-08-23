"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SendIcon, PlusIcon, FileUp } from "lucide-react";
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
import {
  getChatroomParticipantsImage,
  getImage,
} from "@/lib/actions/user.actions";
import {
  CheckCheck,
  Check,
  Image,
  Plus,
  MapPin,
  CircleUserRound,
  File,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { X } from "lucide-react";
import MessageImageModel from "./MessageImageModal";
import { toast } from "sonner";

interface Participant {
  _id: string;
  accountname: string;
  image: string;
  user: string;
}

interface Message {
  _id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    _id: string;
    image: string | null;
  };
  readStatus: { userId: string; readAt: string | null }[];
  imageAttach: string | null;
  imageSrc: string;
}

interface ChatroomMainBarProps {
  chatrooms: any[];
  authenticatedUserId: string;
  selectedChatroom: string | null;
  allUsers: any[];
  messages: Message[];
  ws: WebSocket | null;
  receiverInfo: Participant | null;
}

export default function ChatRoomMainBar({
  chatrooms,
  authenticatedUserId,
  selectedChatroom,
  allUsers,
  messages,
  ws,
  receiverInfo,
}: ChatroomMainBarProps) {
  if (!selectedChatroom) {
    return <div>Select a chatroom to start chatting.</div>;
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messageContent, setMessageContent] = useState<string>("");
  const [currentMessages, setCurrentMessages] = useState<Message[]>(messages);
  const [participantImages, setParticipantImages] = useState<
    { participantId: string; image: string | null }[]
  >([]);
  const [receiverImage, setReceiverImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);

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
    setCurrentMessages(messages);

    messages.forEach((message) => {
      message.readStatus.forEach((status) => {
        if (status.userId === authenticatedUserId && !status.readAt) {
          console.log("yes, i seen the message");
          updateReadStatus(message._id, authenticatedUserId);
        } else {
          console.log("i should not update the status");
        }
      });
    });
  }, [messages]);

  useEffect(() => {
    console.log("Rendering with messages:", currentMessages);
  }, [currentMessages]);

  useEffect(() => {
    const fetchReceiverImage = async () => {
      if (receiverInfo && receiverInfo.user) {
        console.log("receiverInfo._id" + receiverInfo.user);
        const response = await getImage(receiverInfo.user);
        if (response.success && response.image) {
          setReceiverImage(response.image);
        } else {
          console.error(
            "Failed to retrieve receiver's image:",
            response.message
          );
        }
      }
    };

    fetchReceiverImage();
  }, [receiverInfo]);

  const updateReadStatus = (messageId: string, userId: string) => {
    console.log("Updating read status...");
    if (ws && ws.readyState === WebSocket.OPEN) {
      const readStatusUpdate = {
        type: "updateReadStatus",
        messageId,
        userId,
        readAt: new Date().toISOString(),
      };
      ws.send(JSON.stringify(readStatusUpdate));
      console.log("Read status updated:", readStatusUpdate);
    } else {
      console.error("WebSocket is not open, cannot update read status.");
    }
  };

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
    if (!ws) return;

    // console.log("senderId:" + senderId);
    // console.log("chatroomId:" + chatroomId);
    // console.log("content:" + content);

    let fileObjectId: string | null = null;
    let imageSrc: string = "";

    const sendMessage = (imageObjectId: string | null = null) => {
      console.log("fileurl" + imageObjectId);
      try {
        if (ws && ws.readyState === WebSocket.OPEN) {
          const message = {
            type: "sendMessage",
            senderId,
            chatroomId,
            content,
            imageAttach: imageObjectId,
            readStatus: receiverInfo
              ? [{ userId: receiverInfo.user, readAt: null }]
              : [],
          };

          // console.log("send message:" + JSON.stringify(message));

          // For frontend display
          const newMessage: Message = {
            _id: Date.now().toString(),
            senderId,
            content,
            imageAttach: imageObjectId,
            createdAt: new Date().toISOString(),
            sender: {
              _id: senderId,
              image: null,
            },
            readStatus: receiverInfo
              ? [{ userId: receiverInfo.user, readAt: null }]
              : [],
            imageSrc,
          };

          // console.log("newMessage:" + JSON.stringify(newMessage));

          setCurrentMessages((prevMessages) => [...prevMessages, newMessage]);

          ws.send(JSON.stringify(message));

          console.log("Message sent via WebSocket!");
        } else {
          console.error("WebSocket is not open. Cannot send message.");
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }

      setMessageContent("");
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    try {
      const hasContent = content.trim() !== "";
      const hasImage = fileInputRef.current?.files?.[0] != null;

      if (hasContent && hasImage) {
        // scenario 1: Both content and image
        const file = fileInputRef.current?.files![0];

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/uploadMessageImage", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          fileObjectId = result.fileId;

          sendMessage(fileObjectId);
        } else {
          console.error("Failed to upload image. Status:", response.status);
          sendMessage();
        }
      } else if (hasContent && !hasImage) {
        // scenario 2: Only content (no image)
        sendMessage();
      } else if (!hasContent && hasImage) {
        // scenario 3: Only image (no content)
        const file = fileInputRef.current?.files![0];

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/uploadMessageImage", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          fileObjectId = result.fileId;

          sendMessage(fileObjectId);
        } else {
          console.error("Failed to upload image. Status:", response.status);
          sendMessage();
        }
      } else {
        toast.error("Message cannot be empty!!");
      }
    } catch (error) {
      console.error("Error processing file or sending message:", error);
    }
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
      return `${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"} ago`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
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

  const viewSeenTime = () => {
    console.log("seen time");
  };

  const handlePhotoUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // preview image save
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          //set the image preview
          setImagePreview(reader.result);
        } else {
          console.error("Unexpected file data type:", typeof reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFileUpload = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = () => {
    console.log("handleFileUpload");
  };

  const handleLocationSharing = () => {
    console.log("handleLocationSharing");
  };

  const handleImageClick = (imageSrc: string) => {
    setCurrentImageSrc(imageSrc);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentImageSrc(null);
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
                  {message.imageAttach && message.imageSrc && (
                    <>
                      <div className="mb-2">
                        <img
                          src={message.imageSrc}
                          alt="Attached"
                          className="max-h-[300px] max-w-[300px] rounded-md border border-white cursor-pointer"
                          onClick={() => handleImageClick(message.imageSrc)}
                        />
                      </div>
                      <MessageImageModel
                        isOpen={isModalOpen}
                        imageSrc={currentImageSrc || ""}
                        onClose={handleCloseModal}
                      />
                    </>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg p-3 text-sm ${
                      message.senderId === authenticatedUserId
                        ? "bg-primary text-white rounded-xl"
                        : "bg-primary text-white rounded-xl"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-base flex-1">{message.content}</p>
                      {message.readStatus &&
                        message.readStatus.length > 0 &&
                        message.senderId === authenticatedUserId && (
                          <div className="flex items-center ml-2">
                            {message.readStatus.map((status) => (
                              <span key={status.userId} className="ml-1">
                                {status.readAt ? (
                                  <CheckCheck
                                    onClick={viewSeenTime}
                                    className="w-4 h-4 text-green-400 curosr-pointer"
                                  />
                                ) : (
                                  <Check className="w-4 h-4 text-gray-400" />
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatMessageTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center">
              {receiverInfo && (
                <>
                  <Avatar className="h-[200px] w-[200px]  mb-4 border">
                    <AvatarImage
                      src={receiverImage || "/placeholder-user.jpg"}
                    />
                    <AvatarFallback>
                      {receiverInfo.accountname
                        ? receiverInfo.accountname.charAt(0)
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <p>{receiverInfo.accountname}</p>
                  <Button className="mt-2">View Profile</Button>
                </>
              )}
              {/* <p>No messages yet.</p> */}
            </div>
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
        <div className="border-t px-4 py-3 md:px-6 flex items-center">
          <div className="mr-4">
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
              <DropdownMenuContent
                align="end"
                className="bg-black text-white border border-gray-100 rounded-lg shadow-md p-2 w-[200px] "
              >
                <DropdownMenuItem
                  className="flex items-center text-2xl p-3"
                  onClick={handlePhotoUploadClick}
                >
                  <Image className="mr-2 h-5 w-5" />
                  Photo
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center text-2xl p-3"
                  onClick={handleFileUpload}
                >
                  <File className="mr-2 h-5 w-5" />
                  File
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center text-2xl p-3"
                  onClick={handleLocationSharing}
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Location
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="relative flex-grow">
            {imagePreview && (
              <div className="relative max-h-[150px] max-w-[150px] mb-4 self-center">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="max-h-[150px] max-w-[150px] border border-gray-300 mr-4 mb-4"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 rounded-full p-1"
                >
                  <X
                    className="w-4 h-4 text-gray-500"
                    onClick={removeFileUpload}
                  ></X>
                </Button>
              </div>
            )}
            <div className="relative flex item-center">
              <Textarea
                placeholder="Type your message..."
                className="min-h-[36px] h-[36px] line-height w-full rounded-2xl text-black resize-none pr-16 overflow-hidden leading-[15px]"
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
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
    </>
  );
}
