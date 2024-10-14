"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createNewBlog, checkUniqueSlug } from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface BlogCreatorProps {
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

export default function BlogCreator({ authActiveProfileId }: BlogCreatorProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    if (!title || !content || !imageFile) {
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
      console.log("should not see this");
      const formData = new FormData();
      formData.append("imageFile", imageFile);

      const imageUploadResponse = await fetch("/api/blog-image-submit", {
        method: "POST",
        body: formData,
      });

      if (imageUploadResponse.ok) {
        const result = await imageUploadResponse.json();

        if (typeof authActiveProfileId === "string") {
          const blogCreateRes = await createNewBlog(
            authActiveProfileId,
            title,
            content,
            result.fileId
          );

          if (blogCreateRes.success) {
            setMessage("Blog successfully submitted!");
            toast.success("Blog successfully submitted!");
            router.push("/blog");
          } else {
            setMessage(blogCreateRes.message);
            toast.error(blogCreateRes.message);
          }
        } else {
          setMessage("Invalid profile ID.");
          toast.error("Invalid profile ID.");
        }
      } else {
        setMessage("Image upload failed.");
        toast.error("Image upload failed.");
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
    <div className="container mx-auto px-6 py-10 max-w-4xl dark:text-white text-black">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title" className="block text-base font-semibold mb-2">
            Blog Title
          </Label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter the blog title"
          />
        </div>

        <div>
          <Label htmlFor="image" className="block font-semibold mb-2">
            Thumbnail
          </Label>
          <Input
            type="file"
            id="image"
            accept="image/*"
            className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="block text-base font-semibold mb-2"
          >
            Blog Content
          </Label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleContentChange}
            className="w-full border border-gray-300 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
            modules={modules}
            formats={formats}
            placeholder="Write the blog content here..."
            style={{ height: "400px" }}
          />
        </div>

        <Button
          type="submit"
          // variant="outline"
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
