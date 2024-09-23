// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { Textarea } from "@/components/ui/textarea";
// import { SendIcon, PlusIcon } from "lucide-react";
// import { UserImage } from "@/types";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/utils/authOptions";
// import { redirect } from "next/navigation";

// export default async function ChatRoomComponent() {
//   // const user = session?.user;
//   const session = await getServerSession(authOptions);

//   console.log("session user email:" + session?.user.email);
//   console.log("session user id:" + session?.user.id);
//   console.log("session user name:" + session?.user.name);
//   console.log("session user image:" + session?.user.image);

//   const user = session?.user;

//   if (!user) {
//     redirect("/sign-in");
//   }

//   // console.log("user:" + user);

//   // let userImage = null;
//   // if (userInfoImage != null) {
//   //   userImage = userInfoImage.binaryCode.toString();
//   //   console.log("userImage" + userImage);
//   // } else {
//   //   userImage = user?.image;
//   // }

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
//             <nav className="space-y-1 p-2">
//               <Link
//                 href="#"
//                 className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
//                 prefetch={false}
//               >
//                 <Avatar className="h-10 w-10 border">
//                   <AvatarImage src="/placeholder-user.jpg" />
//                   <AvatarFallback>AC</AvatarFallback>
//                 </Avatar>
//                 <div className="flex-1 overflow-hidden">
//                   <div className="font-medium truncate">Acme Inc</div>
//                   <p className="text-muted-foreground truncate">
//                     Hey, how's it going?
//                   </p>
//                 </div>
//                 <div className="text-xs text-muted-foreground">2:34 PM</div>
//               </Link>
//               <Link
//                 href="#"
//                 className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
//                 prefetch={false}
//               >
//                 <Avatar className="h-10 w-10 border">
//                   <AvatarImage src="/placeholder-user.jpg" />
//                   <AvatarFallback>AC</AvatarFallback>
//                 </Avatar>
//                 <div className="flex-1 overflow-hidden">
//                   <div className="font-medium truncate">Frontend Devs</div>
//                   <p className="text-muted-foreground truncate">
//                     Did you see the new design?
//                   </p>
//                 </div>
//                 <div className="text-xs text-muted-foreground">12:45 PM</div>
//               </Link>
//               <Link
//                 href="#"
//                 className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
//                 prefetch={false}
//               >
//                 <Avatar className="h-10 w-10 border">
//                   <AvatarImage src="/placeholder-user.jpg" />
//                   <AvatarFallback>AC</AvatarFallback>
//                 </Avatar>
//                 <div className="flex-1 overflow-hidden">
//                   <div className="font-medium truncate">John Doe</div>
//                   <p className="text-muted-foreground truncate">
//                     Let's discuss the project timeline.
//                   </p>
//                 </div>
//                 <div className="text-xs text-muted-foreground">9:23 AM</div>
//               </Link>
//             </nav>
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
//                 <div className="font-medium">Acme Inc</div>
//                 <p className="text-muted-foreground text-sm">Online</p>
//               </div>
//             </div>
//             <div className="ml-auto flex items-center gap-2">
//               {/* <Button variant="ghost" size="icon">
//               <PhoneIcon className="h-5 w-5" />
//               <span className="sr-only">Call</span>
//             </Button> */}
//               {/* <Button variant="ghost" size="icon">
//               <VideoIcon className="h-5 w-5" />
//               <span className="sr-only">Video Call</span>
//             </Button>
//             <Button variant="ghost" size="icon">
//               <MoveHorizontalIcon className="h-5 w-5" />
//               <span className="sr-only">More</span>
//             </Button> */}
//             </div>
//           </div>
//           <div className="flex-1 overflow-auto p-4 md:p-6">
//             <div className="grid gap-4">
//               <div className="flex items-start gap-3">
//                 <Avatar className="h-8 w-8 border">
//                   <AvatarImage src="/placeholder-user.jpg" />
//                   <AvatarFallback>AC</AvatarFallback>
//                 </Avatar>
//                 <div className="max-w-[75%] rounded-lg bg-muted p-3 text-sm">
//                   <p>Hey, how's it going?</p>
//                   <div className="mt-2 text-xs text-muted-foreground">
//                     2:34 PM
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3 justify-end">
//                 <div className="max-w-[75%] rounded-lg bg-primary p-3 text-sm text-primary-foreground">
//                   <p>Pretty good, just working on some new features.</p>
//                   <div className="mt-2 text-xs text-muted-foreground">
//                     2:35 PM
//                   </div>
//                 </div>
//                 <Avatar className="h-8 w-8 border">
//                   <AvatarImage src="/placeholder-user.jpg" />
//                   <AvatarFallback>AC</AvatarFallback>
//                 </Avatar>
//               </div>
//               <div className="flex items-start gap-3">
//                 <Avatar className="h-8 w-8 border">
//                   <AvatarImage src="/placeholder-user.jpg" />
//                   <AvatarFallback>AC</AvatarFallback>
//                 </Avatar>
//                 <div className="max-w-[75%] rounded-lg bg-muted p-3 text-sm">
//                   <p>That's great, let me know if you need any help!</p>
//                   <div className="mt-2 text-xs text-muted-foreground">
//                     2:36 PM
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3 justify-end">
//                 <div className="max-w-[75%] rounded-lg bg-primary p-3 text-sm text-primary-foreground">
//                   <p>Will do, thanks!</p>
//                   <div className="mt-2 text-xs text-muted-foreground">
//                     2:37 PM
//                   </div>
//                 </div>
//                 <Avatar className="h-8 w-8 border">
//                   <AvatarImage src="/placeholder-user.jpg" />
//                   <AvatarFallback>AC</AvatarFallback>
//                 </Avatar>
//               </div>
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
// }
