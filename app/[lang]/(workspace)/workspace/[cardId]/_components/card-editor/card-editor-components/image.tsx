"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EditorElement,
  EditorSection,
  useEditor,
} from "@/lib/editor/editor-provider";
import clsx from "clsx";
import { Trash } from "lucide-react";
import React, { use, useEffect, useRef, useState } from "react";
import { defaultStyles } from "@/lib/constants";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import {
  convertExtractedInfoToEditorElements,
  convertSizeToPixels,
  getSize,
} from "@/lib/utils";
import "react-image-crop/dist/ReactCrop.css";
import CropModal from "@/components/modal/crop-modal";

type Props = {
  element: EditorElement;
  sectionId: string;
  bubbleId: string;
};

const ImageElement = (props: Props) => {
  const { dispatch, state } = useEditor();
  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);
  const [backgroundImage, setBackgroundImage] = useState(
    props.element.url || ""
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (
      state.editor.selectedElement?.id === props.element.id &&
      state.editor.selectedElement.url
    ) {
      setBackgroundImage(state.editor.selectedElement.url);
    }
  }, [state.editor.selectedElement, props.element.id]);

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

  const handleDeleteElement = async () => {
    const currentImageUrl = state.editor.selectedElement.url;

    const url = new URL(currentImageUrl || "");
    const currentDomain = url.origin;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (currentDomain === baseUrl) {
      const currentImageId = currentImageUrl
        ? currentImageUrl.split("/").pop()
        : null;

      if (currentImageId) {
        const deleteResponse = await fetch(
          `/api/uploadImage/${currentImageId}`,
          {
            method: "DELETE",
          }
        );

        if (!deleteResponse.ok) {
          toast.error("Failed to delete the existing image");
        }

        const deleteData = await deleteResponse.json();
        if (deleteData.status !== "success") {
          toast.error(deleteData.message);
        }
      }
    }

    dispatch({
      type: "DELETE_ELEMENT",
      payload: {
        elementId: props.element.id,
        sectionId: props.sectionId,
        bubbleId: props.bubbleId,
      },
    });
  };

  const handleImageUpload = (uploadedImageUrl: string) => {
    updateImage(uploadedImageUrl);
  };

  const updateImage = (uploadedImageUrl: string, callback?: () => void) => {
    setBackgroundImage(uploadedImageUrl);

    const updatedElementDetails = {
      ...state.editor.selectedElement,
      url: uploadedImageUrl,
    };

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        bubbleId: props.bubbleId,
        sectionId: props.sectionId,
        elementDetails: updatedElementDetails,
      },
    });

    toast.success("Image has been uploaded and updated successfully.");

    if (callback) {
      callback();
    }
  };

  const handleExtractedInfo = (
    uploadedImageUrl: string,
    extractInfo: any,
    originalWidth: number
  ) => {
    const newElements = convertExtractedInfoToEditorElements(
      extractInfo,
      originalWidth
    );

    const existingComponent = state.editor.component;
    const existingContents = existingComponent.body?.contents || [];

    const initialBox = existingContents.find(
      (content) => content.id === "initial_box"
    );

    if (initialBox) {
      const updatedInitialBoxContents =
        initialBox.contents?.map((content) => {
          if (content.id === state.editor.selectedElement.id) {
            return {
              ...content,
              url: uploadedImageUrl,
            };
          }
          return content;
        }) || [];

      const updatedInitialBox = {
        ...initialBox,
        contents: [...updatedInitialBoxContents, ...newElements],
      };

      const updatedContents = existingContents.map((content) =>
        content.id === "initial_box" ? updatedInitialBox : content
      );

      const updatedComponent = {
        ...existingComponent,
        size: "giga",
        body: {
          ...existingComponent.body,
          contents: updatedContents,
          id: existingComponent?.body?.id || "initial_body",
        },
      };

      dispatch({
        type: "IMPORT_COMPONENT",
        payload: {
          componentDetails: updatedComponent,
        },
      });

      toast.success("OCR has been detected and placed successfully.");
    } else {
      console.error("Initial box not found.");
    }
  };

  const handleImageUpdateAndExtractInfo = (
    extractInfo: any,
    originalWidth: number,
    uploadedImageUrl: string
  ) => {
    handleExtractedInfo(uploadedImageUrl, extractInfo, originalWidth);
  };

  interface OCRText {
    name: string;
    jobTitle: string;
    phone: string;
    email: string;
    address: string;
    website: string;
  }

  const OCRText = (text: OCRText) => {
    toast.success("OCR detected successfully: " + text.name);
  };
  //   const canvas = document.createElement('canvas');
  //   const scaleX = image.naturalWidth / image.width;
  //   const scaleY = image.naturalHeight / image.height;
  //   canvas.width = crop.width;
  //   canvas.height = crop.height;
  //   const ctx = canvas.getContext('2d');

  //   if (!ctx) {
  //     return Promise.resolve(null);
  //   }

  //   ctx.drawImage(
  //     image,
  //     crop.x * scaleX,
  //     crop.y * scaleY,
  //     crop.width * scaleX,
  //     crop.height * scaleY,
  //     0,
  //     0,
  //     crop.width,
  //     crop.height
  //   );

  //   return new Promise((resolve) => {
  //     canvas.toBlob((blob) => {
  //       resolve(blob);
  //     }, 'image/jpeg');
  //   });
  // };

  // const handleUpload = async () => {
  //   if (completedCrop && imageRef) {
  //     const croppedImage = await getCroppedImg(imageRef, completedCrop);
  //     if (!croppedImage) {
  //       toast.error('Failed to crop the image');
  //       return;
  //     }

  //     const formData = new FormData();
  //     formData.append('file', croppedImage);

  //     try {
  //       const currentImageUrl = state.editor.selectedElement.url;

  //       const url = new URL(currentImageUrl || '');
  //       const currentDomain = url.origin;
  //       const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  //       if (currentDomain === baseUrl) {
  //         const currentImageId = currentImageUrl ? currentImageUrl.split('/').pop() : null;

  //         if (currentImageId) {
  //           const deleteResponse = await fetch(`/api/uploadImage/${currentImageId}`, {
  //             method: 'DELETE',
  //           });

  //           if (!deleteResponse.ok) {
  //             toast.error('Failed to delete the existing image');
  //           }

  //           const deleteData = await deleteResponse.json();
  //           if (deleteData.status !== 'success') {
  //             toast.error(deleteData.message);
  //           }
  //         }
  //       }

  //       const response = await fetch('/api/uploadImage', {
  //         method: 'POST',
  //         body: formData,
  //       });

  //       if (!response.ok) {
  //         toast.error('File upload failed');
  //       }

  //       const data = await response.json();
  //       const uploadedImageUrl = `/api/uploadImage/${data.fileId}`;
  //       const uploadImageUrlWithHttp = `${process.env.NEXT_PUBLIC_BASE_URL}${uploadedImageUrl}`;

  //       setBackgroundImage(uploadedImageUrl);

  //       const updatedElementDetails = {
  //         ...state.editor.selectedElement,
  //         url: uploadImageUrlWithHttp,
  //       };

  //       dispatch({
  //         type: 'UPDATE_ELEMENT',
  //         payload: {
  //           bubbleId: props.bubbleId,
  //           sectionId: props.sectionId,
  //           elementDetails: updatedElementDetails,
  //         },
  //       });

  //       toast.success('Image has been uploaded and updated successfully.');

  //     } catch (error: any) {
  //       toast.error('Failed to upload the image, Please try again.');
  //       console.error(`Upload error: ${error.message}`);
  //     }
  //   }
  // };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const styles = {
    backgroundColor: props.element.backgroundColor,
    justifyContent: props.element.align || defaultStyles.textAlign,
    marginTop: convertSizeToPixels(props.element.margin),
    top: convertSizeToPixels(props.element.offsetTop) || 0,
    left: convertSizeToPixels(props.element.offsetStart) || 0,
    right: convertSizeToPixels(props.element.offsetEnd) || 0,
    bottom: convertSizeToPixels(props.element.offsetBottom) || 0,
  };

  return (
    <div
      style={styles}
      onClick={handleOnClick}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      className={clsx(
        "w-full relative text-[16px] overflow-hidden transition-all flex items-center justify-center",
        {
          "!border-blue-500":
            state.editor.selectedElement.id === props.element.id,
          "!border-solid": state.editor.selectedElement.id === props.element.id,
          "border-dashed border-[1px] border-slate-300": !state.editor.liveMode,
        }
      )}
    >
      {!Array.isArray(props.element.url) && (
        <ContextMenu>
          <ContextMenuTrigger>
            <span
              style={{
                display: "inline-block",
                width:
                  props.element.size === "xs"
                    ? "60px"
                    : props.element.size === "sm"
                    ? "80px"
                    : props.element.size === "md"
                    ? "100px"
                    : props.element.size === "lg"
                    ? "120px"
                    : props.element.size === "xl"
                    ? "140px"
                    : props.element.size === "xxl"
                    ? "160px"
                    : props.element.size === "3xl"
                    ? "180px"
                    : props.element.size === "4xl"
                    ? "200px"
                    : props.element.size === "5xl"
                    ? "220px"
                    : props.element.size === "full"
                    ? getSize(state.editor.component.size)
                    : props.element.size || "100px",
                height:
                  props.element.size === "xs"
                    ? "60px"
                    : props.element.size === "sm"
                    ? "80px"
                    : props.element.size === "md"
                    ? "100px"
                    : props.element.size === "lg"
                    ? "120px"
                    : props.element.size === "xl"
                    ? "140px"
                    : props.element.size === "xxl"
                    ? "160px"
                    : props.element.size === "3xl"
                    ? "180px"
                    : props.element.size === "4xl"
                    ? "200px"
                    : props.element.size === "5xl"
                    ? "220px"
                    : props.element.size === "full"
                    ? getSize(state.editor.component.size)
                    : props.element.size || "100px",
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize:
                  props.element.aspectMode === "cover" ? "cover" : "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                overflow: "hidden",
              }}
            />
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem inset onClick={() => setModalOpen(true)}>
              Upload Image
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
          {modalOpen && (
            <CropModal
              updateImage={updateImage}
              onExtractedInfo={handleImageUpdateAndExtractInfo}
              closeModal={() => setModalOpen(false)}
              onImageUpload={handleImageUpload}
              element={props.element}
              bubbleId={props.bubbleId}
              sectionId={props.sectionId}
            />
          )}
        </ContextMenu>
      )}

      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <div className="absolute -top-[0px] -right-[0px]">
            <Button
              className="flex justify-center h-full border rounded-md bg-red-500"
              variant={"ghost"}
              onClick={handleDeleteElement}
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        )}
    </div>
  );
};

ImageElement.displayName = "ImageElement";

export default ImageElement;
