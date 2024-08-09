"use client";

import { useState, useEffect } from "react";
import { fetchAllMembers } from "@/lib/actions/user.actions";
import { Member } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

function RightSidebar() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    // temp members, must fetch friend & follower
    const getMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        const data: any[] = await fetchAllMembers();
        setMembers(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(String(error));
        }
      } finally {
        setLoading(false);
      }
    };

    getMembers();
  }, []);

  const showChatBox = (userId: string) => {
    console.log("userID:" + userId);
    router.push(`/workspace/chatroom/${userId}`);
  };

  return (
    <section className="custom-scrollbar bg-gray-800 text-white shadow-lg w-64">
      <div className="flex flex-col p-4 mt-12">
        <h3 className="text-lg font-medium mb-4">Friend List</h3>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <div className="flex flex-col gap-4">
            {members.length > 0 ? (
              members.map((member, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-700 rounded flex items-center gap-4 cursor-pointer hover:bg-gray-600"
                  // onClick={() => showChatBox(member.user)}
                >
                  <Avatar className="h-6 w-6 border">
                    <AvatarImage src="/assets/user.svg" />
                    {/* <AvatarFallback>
                      {member.accountname ? member.accountname.charAt(0) : "A"}
                    </AvatarFallback> */}
                  </Avatar>
                  <div>
                    <p>{member.accountname || "Anonymous"}</p>
                    {/* <p>UserID: {member.user || "No User ID found"}</p>s */}
                    {/* <p>Email: {member.email || "No email provided"}</p>
                    <p>Country: {member.country || "No country provided"}</p> */}
                    <p>Online</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No members found</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default RightSidebar;
