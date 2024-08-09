"use client";

import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, PlusIcon } from "lucide-react";
import { Session } from "next-auth";
import { UserImage } from "@/types";
import { useParams } from "next/navigation";

interface ChatRoomProps {
  session: Session | null;
  userInfoImage: UserImage | null | undefined;
}

export default function Component({ session, userInfoImage }: ChatRoomProps) {
  const [memberId, setMemberId] = useState<string | null>(null);
  const params = useParams();

  useEffect(() => {
    if (params.memberId) {
      const id = Array.isArray(params.memberId)
        ? params.memberId[0]
        : params.memberId;
      setMemberId(id);
    }
  }, [params.memberId]);

  const user = session?.user;

  let userImage = null;
  if (userInfoImage != null) {
    userImage = userInfoImage.binaryCode.toString();
  } else {
    userImage = user?.image;
  }

  return (
    <div>
      <div className="flex h-screen w-full bg-background">
        <div className="hidden w-64 border-r bg-background md:block">
          <div className="flex h-14 items-center border-b px-4">
            <h3 className="text-lg font-semibold">Chats</h3>
            <h3 className="text-lg font-semibold">{memberId}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto rounded-full"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="sr-only">New Chat</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            {/* <nav className="space-y-1 p-2">
              <Link
                href="#"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                prefetch={false}
              >
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium truncate">Acme Inc</div>
                  <p className="text-muted-foreground truncate">
                    Hey, how's it going?
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">2:34 PM</div>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                prefetch={false}
              >
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium truncate">Frontend Devs</div>
                  <p className="text-muted-foreground truncate">
                    Did you see the new design?
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">12:45 PM</div>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                prefetch={false}
              >
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium truncate">John Doe</div>
                  <p className="text-muted-foreground truncate">
                    Let's discuss the project timeline.
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">9:23 AM</div>
              </Link>
            </nav> */}
          </div>
        </div>
        <div className="flex flex-col w-full">
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
          </div>
          <div className="border-t px-4 py-3 md:px-6">
            <div className="relative">
              <Textarea
                placeholder="Type your message..."
                className="min-h-[48px] w-full rounded-2xl resize-none pr-16"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute top-3 right-3"
              >
                <SendIcon className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

// import { GetServerSideProps, InferGetServerSidePropsType } from "next";
// import { MongoClient, ObjectId } from "mongodb";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { Textarea } from "@/components/ui/textarea";
// import { SendIcon, PlusIcon } from "lucide-react";
// import { Session } from "next-auth";
// import { UserImage } from "@/types";
// import { ParsedUrlQuery } from "querystring";

// interface ChatRoomProps {
//   session: Session | null;
//   userInfoImage: UserImage | null | undefined;
//   memberData: any;
//   memberId: string;
// }

// interface Params extends ParsedUrlQuery {
//   memberId: string;
// }

// const ChatRoom = ({
//   session,
//   userInfoImage,
//   memberData,
//   memberId,
// }: ChatRoomProps) => {
//   const user = session?.user;

//   let userImage = null;
//   if (userInfoImage != null) {
//     userImage = userInfoImage.binaryCode.toString();
//   } else {
//     userImage = user?.image;
//   }

//   return (
//     <div>
//       <div className="flex h-screen w-full bg-background">
//         <div className="hidden w-64 border-r bg-background md:block">
//           <div className="flex h-14 items-center border-b px-4">
//             <h3 className="text-lg font-semibold">Chats</h3>
//             <Button
//               variant="ghost"
//               size="icon"
//               className="ml-auto rounded-full"
//             >
//               <PlusIcon className="h-5 w-5" />
//               <span className="sr-only">New Chat</span>
//             </Button>
//           </div>
//           <div className="flex-1 overflow-auto">
//             <nav className="space-y-1 p-2">{/* List of chats */}</nav>
//           </div>
//         </div>
//         <div className="flex flex-col w-full">
//           <div className="flex h-14 items-center border-b px-4 md:px-6">
//             <div className="flex items-center gap-3">
//               <Avatar className="h-10 w-10 border">
//                 <AvatarImage src="/placeholder-user.jpg" />
//                 <AvatarFallback>AC</AvatarFallback>
//               </Avatar>
//               <div>
//                 <div className="font-medium">
//                   {memberData.name || "Anonymous"}
//                 </div>
//                 <p className="text-muted-foreground text-sm">Online</p>
//               </div>
//             </div>
//             <div className="ml-auto flex items-center gap-2"></div>
//           </div>
//           <div className="flex-1 overflow-auto p-4 md:p-6">
//             <div className="grid gap-4">
//               <p>Name: {memberData.name}</p>
//               <p>Email: {memberData.email}</p>
//               {/* Add other member details here */}
//             </div>
//           </div>
//           <div className="border-t px-4 py-3 md:px-6">
//             <div className="relative">
//               <Textarea
//                 placeholder="Type your message..."
//                 className="min-h-[48px] w-full rounded-2xl resize-none pr-16"
//               />
//               <Button
//                 type="submit"
//                 size="icon"
//                 className="absolute top-3 right-3"
//               >
//                 <SendIcon className="w-4 h-4" />
//                 <span className="sr-only">Send</span>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatRoom;

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const { memberId } = context.params as Params;

//   if (!process.env.MONGODB_URI) {
//     throw new Error("Please add your MongoDB URI to .env.local");
//   }

//   const client = await MongoClient.connect(process.env.MONGODB_URI);
//   const db = client.db(process.env.MONGODB_DB);

//   const memberData = await db
//     .collection("members")
//     .findOne({ _id: new ObjectId(memberId as string) });

//   client.close();

//   if (!memberData) {
//     return {
//       notFound: true,
//     };
//   }

//   return {
//     props: {
//       memberData: JSON.parse(JSON.stringify(memberData)),
//       memberId,
//     },
//   };
// };
