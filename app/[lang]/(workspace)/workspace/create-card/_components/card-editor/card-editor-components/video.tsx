"use client";

import { Trash, UploadCloud } from "lucide-react";
import React, { useState } from "react";
import { EditorElement, useEditor } from "@/lib/editor/editor-provider";
import clsx from "clsx";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";

type Props = {
  element: EditorElement;
  sectionId: string;
  bubbleId: string;
};

const VideoElement = (props: Props) => {
  const { dispatch, state } = useEditor();
  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);
  const [uploading, setUploading] = useState(false);

  const handleOnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: props.element,
        bubbleId: props.bubbleId,
        sectionId: props.sectionId,
      },
    });
  };

  const handleDeleteElement = () => {
    dispatch({
      type: "DELETE_ELEMENT",
      payload: {
        elementId: props.element.id,
        sectionId: props.sectionId,
        bubbleId: props.bubbleId,
      },
    });
  };

  const handleUploadVideo = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      1;
      const response = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.fileId) {
        dispatch({
          type: "UPDATE_ELEMENT",
          payload: {
            bubbleId: props.bubbleId,
            sectionId: props.sectionId,
            elementDetails: {
              ...props.element,
              url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload-video/${data.fileId}`,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRightClickUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) handleUploadVideo(file);
    };
    input.click();
  };

  const isYouTubeUrl = (url: string) =>
    /^(https?:\/\/)?(www\.)?(youtube|youtu\.be)\/(watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11})/.test(
      url
    );

  const formatEmbedUrl = (url: string) => {
    if (isYouTubeUrl(url)) {
      const match = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=))([\w-]{11})/
      );
      return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    }
    return url;
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          style={{ padding: "5px" }}
          onClick={handleOnClick}
          onMouseEnter={() => setMouseIsOver(true)}
          onMouseLeave={() => setMouseIsOver(false)}
          className={clsx(
            "p-[2px] w-full relative text-[16px] transition-all flex items-center justify-center",
            {
              "!border-blue-500":
                state.editor.selectedElement.id === props.element.id,
              "!border-solid":
                state.editor.selectedElement.id === props.element.id,
              "border-dashed border-[1px] border-slate-300":
                !state.editor.liveMode,
            }
          )}
        >
          {!Array.isArray(props.element.url) &&
          isYouTubeUrl(props.element.url || "") ? (
            <iframe
              width="100%"
              height="100%"
              src={formatEmbedUrl(props.element.url || "")}
              title="Embedded video"
              allow="accelerometer; autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <iframe
              width="100%"
              height="100%"
              src={props.element.url || ""}
              title="Uploaded Video"
              allow="accelerometer; autoplay; encrypted-media"
              allowFullScreen
            />
          )}

          {mouseIsOver && (
            <div className="absolute inset-0 h-[60%] flex justify-center rounded-md">
              <Button
                variant={"destructive"}
                onClick={handleRightClickUpload}
                className="flex items-center space-x-1"
              >
                <UploadCloud className="h-4 w-4" />
                <span>{uploading ? "Uploading..." : "Upload"}</span>
              </Button>
            </div>
          )}

          {mouseIsOver &&
            state.editor.selectedElement.id === props.element.id &&
            !state.editor.liveMode && (
              <div className="absolute -top-[28px] -right-[3px]">
                <Button
                  className="flex justify-center h-full border rounded-md bg-red-500"
                  variant={"outline"}
                  onClick={handleDeleteElement}
                >
                  <Trash className="h-3 w-3" />
                </Button>
              </div>
            )}
        </div>
      </ContextMenuTrigger>

      {/* <ContextMenuContent>
        <ContextMenuItem onClick={handleRightClickUpload}>
          {uploading ? "Uploading..." : "Upload Video"}
        </ContextMenuItem>
      </ContextMenuContent> */}
    </ContextMenu>
  );
};

VideoElement.displayName = "VideoElement";

export default VideoElement;
