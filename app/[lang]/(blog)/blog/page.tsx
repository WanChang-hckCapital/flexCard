"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/blog/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pen, UserPlusIcon, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  fetchCurrentActiveProfileId,
  isProfileAdmin,
  loadBlogs,
  checkInvitationExist,
  checkIsCreator,
} from "@/lib/actions/user.actions";
import BlogImage from "./_components/BlogImage";
import { CreatorImage } from "./_components/CreatorImage";
import SuggestedBlogs from "./_components/SuggestedBlogs";
import SkeletonCard from "./_components/SkeletonCard";
import Avatar from "@/components/blog/avatar";
import InviteUserModal from "./_components/InviteUserModal";
import InvitationModal from "./_components/InvitationModal";
import { toast } from "sonner";
import { useDict } from "@/app/context/dictionary-context";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  author: string;
}

interface blogResponse {
  success: boolean;
  message: string;
  blogs?: Blog[];
  error?: string;
}

interface invitationResponse {
  _id: string;
  inviter: { _id: string; accountname: string; image: string };
  invitor: string;
  status: string;
  acceptedAt: Date;
  declinedAt: Date;
  sentAt: Date;
}

export default function BlogPage() {
  const { data: clientSession } = useSession();

  // const { lang } = useParams();

  const dict = useDict();

  if (!dict || !dict.auth || !dict.auth.signUp) {
    return <p className="dark:text-white text-black text-center">Loading...</p>;
  }

  const [authActiveProfileId, setAuthActiveProfileId] = useState<string | null>(
    null
  );

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // blog
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [mainPost, setMainPost] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [suggestedBlogs, setSuggestedBlogs] = useState<Blog[]>([]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [hasPendingInvitation, setHasPendingInvitation] = useState(false);
  const [invitationMessage, setInvitationMessage] = useState("");
  const [isShowInvitationModalOpen, setIsShowInvitationModalOpen] =
    useState(false);

  const [invitation, setInvitation] = useState<invitationResponse>();

  const [isInvitedCreator, setIsInvitedCreator] = useState(false);

  useEffect(() => {
    async function fetchActiveProfileId() {
      if (clientSession) {
        const user = clientSession.user;
        const authActiveProfileId = await fetchCurrentActiveProfileId(user.id);

        setAuthActiveProfileId(authActiveProfileId);
        if (authActiveProfileId) {
          const adminCheck = await isProfileAdmin(authActiveProfileId);

          if (adminCheck.success) {
            setIsAdmin(true);
          }
        }
      }
    }
    fetchActiveProfileId();
  }, [clientSession]);

  useEffect(() => {
    async function checkForInvitation() {
      if (!authActiveProfileId) return;

      try {
        const invitationCheck = await checkInvitationExist(authActiveProfileId);

        if (invitationCheck.success) {
          setHasPendingInvitation(true);
          setInvitationMessage(invitationCheck.message);
          setInvitation(invitationCheck.invite);
        } else {
          setHasPendingInvitation(false);
          setInvitation(undefined);
        }
      } catch (error) {
        toast.error("Error checking invitation status.");
      }
    }

    if (authActiveProfileId) {
      checkForInvitation();
    }
  }, [authActiveProfileId]);

  useEffect(() => {
    async function loadBlogRes() {
      try {
        const response: blogResponse = await loadBlogs();
        if (response.success && response.blogs) {
          setBlogs(response.blogs);

          setMainPost(response.blogs[0]);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("Error loading blogs.");
      } finally {
        setLoading(false);
      }
    }
    loadBlogRes();
  }, []);

  useEffect(() => {
    if (blogs.length > 0) {
      setMainPost(blogs[0]);

      const remainingBlogs = blogs.slice(1);
      setSuggestedBlogs(remainingBlogs);
    }
  }, [blogs]);

  useEffect(() => {
    async function checkIsCreatorHandler() {
      if (!authActiveProfileId) return;

      try {
        const invitationCheck = await checkIsCreator(authActiveProfileId);

        if (invitationCheck.success) {
          setIsInvitedCreator(true);
        }
      } catch (error) {
        toast.error("Error checking invitation status.");
      }
    }

    if (authActiveProfileId) {
      checkIsCreatorHandler();
    }
  }, [authActiveProfileId]);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const handleInvitationResponded = () => {
    setHasPendingInvitation(false); // hide the invitation notification
    setIsInvitedCreator(true); // show the create button
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (!clientSession) {
    return null;
  }

  return (
    <div>
      <Header dict={dict} />
      {hasPendingInvitation && (
        <span
          className="container flex items-center px-6 sm:px-8 lg:px-12 text-red-500 cursor-pointer"
          onClick={() => setIsShowInvitationModalOpen(true)}
        >
          <AlertCircle size={16} className="mr-1" />
          {invitationMessage}
        </span>
      )}
      {isShowInvitationModalOpen && (
        <InvitationModal
          invitationMessage={invitationMessage}
          invitation={invitation}
          onClose={() => setIsShowInvitationModalOpen(false)}
          onInvitationResponded={handleInvitationResponded}
        />
      )}
      {(isAdmin || isInvitedCreator) && (
        <div className="flex justify-end mx-auto px-6 sm:px-8 lg:px-12 py-4">
          {/* show invite creator only if the user is admin */}
          {isAdmin && (
            <Button className="mr-2" onClick={() => setIsInviteModalOpen(true)}>
              {dict.blog.adminOrInviteCreator.invitecreator}
              <UserPlusIcon />
            </Button>
          )}
          {/* show create button when the user is a creator or admin */}
          {(isAdmin || isInvitedCreator) && (
            <Button>
              <Link href={`/blog/create`} className="flex items-center gap-2">
                {dict.blog.adminOrInviteCreator.create}
                <Pen />
              </Link>
            </Button>
          )}
          {isInviteModalOpen && (
            <InviteUserModal
              currentProfileId={authActiveProfileId || ""}
              onClose={() => setIsInviteModalOpen(false)}
              dict={dict}
            />
          )}
        </div>
      )}

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-10">
        {loading ? (
          <SkeletonCard />
        ) : mainPost ? (
          <Link href={`/blog/${mainPost?.slug}`} className="block mb-12">
            <div className="border dark:bg-black dark:text-white bg-white text-black rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow h-[400px] flex flex-col">
              <div className="grid md:grid-cols-2 items-center">
                {mainPost.image && (
                  <BlogImage imageId={mainPost.image} alt={mainPost.title} />
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-2xl dark:text-white text-slate:700 font-semibold mb-4">
                    {truncateText(mainPost.title, 50)}
                  </h2>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: truncateText(mainPost.excerpt, 50),
                    }}
                    className="dark:text-slate-700 text-gray-600 mb-4"
                  ></div>
                  <CreatorImage creatorId={mainPost.author} />
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <p>No main post available.</p>
        )}

        {suggestedBlogs.length > 0 && (
          <section>
            <SuggestedBlogs blogs={suggestedBlogs} dict={dict} />
          </section>
        )}
      </div>
    </div>
  );
}
