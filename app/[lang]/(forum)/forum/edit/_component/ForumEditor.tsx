"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface ForumEditorProps {
  initialData: any;
  onSubmit: (updatedData: {
    title: string;
    content: string;
    imageFile: File | null;
  }) => void;
  message: string;
  dict: any;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ align: [] }],
    ["link", "image"],
  ],
};

export default function ForumEditor({
  initialData,
  onSubmit,
  message,
  dict,
}: ForumEditorProps) {
  const [title, setTitle] = useState(initialData.title || "");
  const [content, setContent] = useState(initialData.content || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadNewThumbnail, setUploadNewThumbnail] = useState<boolean>(false);

  // Fetch thumbnail image from server
  const fetchForumImage = async (imageId: string) => {
    try {
      const res = await fetch(`/api/forum-image-load/${imageId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch image. Status: ${res.status}`);
      }
      const data = await res.json();
      return data.fileDataUrl;
    } catch (err) {
      console.error("Error fetching blog image:", err);
      setError("Failed to load image");
      return null;
    }
  };

  // Load the current blog image if available
  useEffect(() => {
    if (initialData.image) {
      const loadImage = async () => {
        const imageUrl = await fetchForumImage(initialData.image);
        setImagePreview(imageUrl);
      };
      loadImage();
    }
  }, [initialData.image]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const updatedData = {
      title,
      content,
      imageFile: uploadNewThumbnail ? imageFile : null,
    };

    await onSubmit(updatedData);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title" className="block text-sm font-medium">
            {dict.forum.edit.title}
          </Label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full text-black"
            placeholder="Enter the blog title"
          />
        </div>

        <div>
          <div className="flex items-center space-x-2 text-white">
            <Input
              type="checkbox"
              id="uploadNewThumbnail"
              checked={uploadNewThumbnail}
              onChange={(e) => setUploadNewThumbnail(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out rounded"
            />
            <Label
              htmlFor="uploadNewThumbnail"
              className="text-sm dark:text-white text-black"
            >
              {dict.forum.edit.uploadthumbnailcheck}
            </Label>
          </div>

          {imagePreview && !uploadNewThumbnail && (
            <div className="mt-4 flex flex-col justify-center items-center dark:text-white text-black">
              <span className="block text-sm font-medium mb-2">
                {dict.forum.edit.thumbnail}
              </span>
              <Image
                src={imagePreview}
                alt="Current Thumbnail"
                width={300}
                height={200}
                className="rounded object-cover"
              />
            </div>
          )}

          {uploadNewThumbnail && (
            <div className="mt-4">
              <Label htmlFor="image" className="block text-sm font-medium">
                {dict.forum.edit.uploadnewthumbnail}
              </Label>
              <Input
                type="file"
                id="image"
                className="mt-1"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imageFile && (
                <div className="mt-4 flex justify-center items-center">
                  <Image
                    src={imagePreview as string}
                    alt="New Thumbnail Preview"
                    width={300}
                    height={200}
                    className="rounded object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="content" className="block text-sm font-medium mb-2">
            {dict.forum.edit.content}
          </Label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleContentChange}
            modules={modules}
            className="w-full border border-gray-300 dark:text-white text-black rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write the blog content here..."
            style={{ height: "400px" }}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? dict.forum.edit.updatingforum
            : dict.forum.edit.updateforum}
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
