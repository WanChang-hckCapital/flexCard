"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  createNewForum,
  checkUniqueSlug,
  loadForumType,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface ForumCreatorProps {
  authActiveProfileId: string | null;
}

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ align: [] }],
    ["link", "image"],
  ],
};

const formats = [
  "font",
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "script",
  "align",
  "link",
  "image",
];

export default function ForumCreator({
  authActiveProfileId,
}: ForumCreatorProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [forumTypes, setForumTypes] = useState<any[]>([]);
  const [selectedForumType, setSelectedForumType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load available forum types
    const fetchForumTypes = async () => {
      try {
        const response = await loadForumType();
        if (response.success && response.forumTypes) {
          setForumTypes(response.forumTypes);
        }
      } catch (error) {
        console.error("Failed to load forum types:", error);
      }
    };

    fetchForumTypes();
  }, []);

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!title || !content) {
      setMessage("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    const isUnique = await checkUniqueSlug(title.trim());
    if (!isUnique.success) {
      setMessage(isUnique.message);
      toast.error(isUnique.message);
      setIsLoading(false);
      console.log("duplicate title");
      return;
    }

    try {
      let fileId = null;

      if (imageFile) {
        const formData = new FormData();
        formData.append("imageFile", imageFile);

        const imageUploadResponse = await fetch("/api/forum-image-submit", {
          method: "POST",
          body: formData,
        });

        if (imageUploadResponse.ok) {
          const result = await imageUploadResponse.json();
          fileId = result.fileId;
        } else {
          setMessage("Image upload failed.");
          toast.error("Image upload failed.");
          setIsLoading(false);
          return;
        }
      }

      if (typeof authActiveProfileId === "string") {
        const forumCreateRes = await createNewForum(
          authActiveProfileId,
          title,
          content,
          fileId,
          selectedForumType
        );

        if (forumCreateRes.success) {
          setMessage("Blog successfully submitted!");
          toast.success("Blog successfully submitted!");
          router.push("/forum");
        } else {
          setMessage(forumCreateRes.message);
          toast.error(forumCreateRes.message);
        }
      } else {
        setMessage("Invalid profile ID.");
        toast.error("Invalid profile ID.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label
            htmlFor="forumType"
            className="block text-base font-semibold text-white mb-2"
          >
            Forum Type
          </Label>
          <select
            id="forumType"
            value={selectedForumType}
            onChange={(e) => setSelectedForumType(e.target.value)}
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Forum Type</option>
            {forumTypes.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label
            htmlFor="title"
            className="block text-base font-semibold text-white mb-2"
          >
            Forum Title
          </Label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter the forum title"
          />
        </div>

        <div>
          <Label
            htmlFor="image"
            className="block text-white font-semibold text-white mb-2"
          >
            Thumbnail
          </Label>
          <Input
            type="file"
            id="image"
            accept="image/*"
            className="w-full text-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={handleImageChange}
          />
        </div>

        {imagePreview && (
          <div className="mt-4 flex justify-center">
            <Image
              src={imagePreview}
              alt="Image Preview"
              width={300}
              height={200}
              className="rounded-lg object-cover shadow-md"
            />
          </div>
        )}

        <div>
          <Label
            htmlFor="content"
            className="block text-base font-semibold text-white mb-2"
          >
            Forum Content
          </Label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleContentChange}
            className="w-full border border-gray-300 text-white rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
            modules={modules}
            formats={formats}
            placeholder="Write the forum content here..."
            style={{ height: "400px" }}
          />
        </div>

        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit Blog"}
        </Button>

        {message && (
          <p
            className={`text-center mt-4 text-lg ${
              message.includes("successfully")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
