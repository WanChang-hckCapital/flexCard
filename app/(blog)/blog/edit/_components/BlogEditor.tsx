"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface BlogEditorProps {
  initialData: any;
  onSubmit: (updatedData: {
    title: string;
    content: string;
    imageFile: File | null;
  }) => void;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ align: [] }],
    ["link", "image"],
  ],
};

export default function BlogEditor({ initialData, onSubmit }: BlogEditorProps) {
  const [title, setTitle] = useState(initialData.title || "");
  const [content, setContent] = useState(initialData.excerpt || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>("" || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // thumbnail image
  const fetchBlogImage = async (imageId: string) => {
    try {
      const res = await fetch(`/api/blog-image-load/${imageId}`);
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

  useEffect(() => {
    if (initialData.image) {
      const loadImage = async () => {
        const imageUrl = await fetchBlogImage(initialData.image);
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
      imageFile,
    };

    await onSubmit(updatedData);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title" className="block text-sm font-medium">
            Title
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
          <Label htmlFor="image" className="block text-sm font-medium">
            Thumbnail
          </Label>
          <div className="flex justify-center">
            <Input
              type="file"
              id="image"
              className="mt-1"
              accept="image/*"
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
                className="rounded object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="content" className="block text-sm font-medium mb-2">
            Content
          </Label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleContentChange}
            modules={modules}
            className="w-full border border-gray-300 text-white rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write the blog content here..."
            style={{ height: "400px" }}
          />
        </div>

        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Blog"}
        </Button>

        {/* {error && <p className="text-red-500 mt-2">{error}</p>} */}
      </form>
    </div>
  );
}
