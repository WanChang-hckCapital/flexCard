// "use client";

// import React, { useState } from "react";
// import { FriendRequest } from "@/types";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import {
//   acceptFriendRequest,
//   declineFriendRequest,
// } from "@/lib/actions/user.actions";
// import {
//   AlertDialog,
//   AlertDialogTrigger,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogFooter,
//   AlertDialogTitle,
//   AlertDialogDescription,
//   AlertDialogAction,
//   AlertDialogCancel,
// } from "@/components/ui/alert-dialog";
// import { toast } from "sonner";

// interface FriendRequestItemProps {
//   friendRequest: FriendRequest & { senderName: string };
//   authenticatedId: string;
//   onUpdate: (message: string) => void;
// }

// const FriendRequestItem: React.FC<FriendRequestItemProps> = ({
//   friendRequest,
//   authenticatedId,
//   onUpdate,
// }) => {
//   const [open, setOpen] = useState(false);

//   const handleAccept = async () => {
//     const response = await acceptFriendRequest(
//       authenticatedId,
//       friendRequest.sender,
//       friendRequest._id
//     );
//     if (response.success) {
//       // refresh the page
//       toast.success(response.message);
//       // onUpdate(response.message);
//     } else {
//       toast.error(response.message);
//       console.error(response.message);
//     }
//   };

//   const handleDecline = async () => {
//     const response = await declineFriendRequest(friendRequest._id);
//     if (response.success) {
//       onUpdate(response.message);
//       // refresh the page
//     } else {
//       console.error(response.message);
//     }
//   };

//   return (
//     <div className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
//       <Avatar className="h-8 w-8">
//         <AvatarImage src={"/assets/user.svg"} alt="Avatar" />
//         <AvatarFallback>
//           {friendRequest.senderName ? friendRequest.senderName.charAt(0) : "U"}
//         </AvatarFallback>
//       </Avatar>
//       <div className="flex-1 font-medium">{friendRequest.senderName}</div>
//       {/* <div className="flex-1 font-medium">{friendRequest}</div> */}

//       <div className="ml-auto flex gap-2">
//         {/* <Button onClick={handleDecline}>Decline</Button> */}
//         <AlertDialog open={open} onOpenChange={setOpen}>
//           <AlertDialogTrigger asChild>
//             <Button variant="destructive">Decline</Button>
//           </AlertDialogTrigger>
//           <AlertDialogContent>
//             <AlertDialogHeader>
//               <AlertDialogTitle>Decline Friend Request</AlertDialogTitle>
//               <AlertDialogDescription>
//                 Are you sure you want to decline this friend request?
//               </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter>
//               <AlertDialogCancel>Cancel</AlertDialogCancel>
//               <AlertDialogAction onClick={handleDecline}>
//                 Decline
//               </AlertDialogAction>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>
//         <Button onClick={handleAccept}>Accept</Button>
//       </div>
//     </div>
//   );
// };

// export default FriendRequestItem;
