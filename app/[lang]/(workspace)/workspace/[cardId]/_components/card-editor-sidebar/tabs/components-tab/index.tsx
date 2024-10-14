import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorElementsBtns } from "@/lib/constants";
import React, { useState } from "react";
import TextPlaceholder from "./text-placeholder";
import ContainerPlaceholder from "./container-placeholder";
import VideoPlaceholder from "./video-placeholder";
import BubblePlaceholder from "./bubble-placeholder";
import ButtonPlaceholder from "./button-placeholder";
import SeparatorPlaceholder from "./separator-placeholder";
import ImagePlaceholder from "./image-placeholder";
import IconPlaceholder from "./icon-placeholder";
import JSONImportForm from "@/components/forms/json-import";
import { toast } from "sonner";
import { useEditor } from "@/lib/editor/editor-provider";
import DescriptionForm from "@/components/forms/description";
import OCRForm from "@/components/forms/ocr";
import UploadForm from "@/components/forms/upload-form";
import { analyzeImage, autoCropEdgeImage, callChatGpt } from "@/lib/utils";

type Props = {};
interface NormalizedVertex {
  x: number;
  y: number;
}

interface BoundingPoly {
  normalizedVertices: NormalizedVertex[];
}

interface ObjectAnnotation {
  name?: string;
  score?: number;
  boundingPoly?: BoundingPoly;
}

interface CropEdgeImageResult {
  objectAnnotations?: ObjectAnnotation[];
}

function ComponentsTab(props: Props) {
  const { state, dispatch } = useEditor();

  const elements: {
    Component: React.ReactNode;
    label: string;
    id: EditorElementsBtns;
    group: "layout" | "elements" | "describe" | "import";
  }[] = [
    {
      Component: <ContainerPlaceholder />,
      label: "Box",
      id: "box",
      group: "elements",
    },
    {
      Component: <TextPlaceholder />,
      label: "Text",
      id: "text",
      group: "elements",
    },
    {
      Component: <BubblePlaceholder />,
      label: "Bubble",
      id: "bubble",
      group: "layout",
    },
    {
      Component: <VideoPlaceholder />,
      label: "Video",
      id: "video",
      group: "elements",
    },
    {
      Component: <ButtonPlaceholder />,
      label: "Button",
      id: "button",
      group: "elements",
    },
    {
      Component: <SeparatorPlaceholder />,
      label: "Separator",
      id: "separator",
      group: "elements",
    },
    {
      Component: <ImagePlaceholder />,
      label: "Image",
      id: "image",
      group: "elements",
    },
    {
      Component: <IconPlaceholder />,
      label: "Icon",
      id: "icon",
      group: "elements",
    },
    {
      Component: <IconPlaceholder />,
      label: "Describe",
      id: "icon",
      group: "describe",
    },
    {
      Component: <IconPlaceholder />,
      label: "Import",
      id: "icon",
      group: "import",
    },
  ];

  const handleImport = (importedJson: any) => {
    dispatch({
      type: "IMPORT_COMPONENT",
      payload: {
        componentDetails: importedJson,
      },
    });

    console.log("importedJson", importedJson);
  };

  // handler image url
  const handleImageUpdate = (image: any) => {
    console.log("Image updated:", image);
    // setUploadedImageUrl(image);
    // setDataReturned(false);
  };

  // google handle logo detection
  const handleAnalyzeImage = async (
    image: File,
    originalWidth: number
  ): Promise<{
    logoAnnotations: any[];
  }> => {
    try {
      const data = await analyzeImage(image);
      console.log("Detected Logos:", data.logoAnnotations);

      console.log("original width:" + originalWidth);
      return data;
    } catch (error) {
      console.error("Error analyzing image:", error);
      throw error;
    }
  };

  // crop edge image
  const handleCropEdgeImg = async (
    image: File
  ): Promise<CropEdgeImageResult> => {
    try {
      const result = await autoCropEdgeImage(image);

      if (result.objectAnnotations) {
        result.objectAnnotations.forEach((annotation: ObjectAnnotation) => {
          if (
            annotation.boundingPoly &&
            annotation.boundingPoly.normalizedVertices
          ) {
            annotation.boundingPoly.normalizedVertices.forEach(
              (vertex: NormalizedVertex) => {
                console.log(`x: ${vertex.x}, y: ${vertex.y}`);
              }
            );
          }
        });
      } else {
        //setCroppedLogos([]);
      }

      return result;
    } catch (error) {
      console.error("Error Crop Image Edge:", error);
      throw error;
    }
  };

  // gpt api
  const handleCallChatGpt = async (image: File): Promise<any> => {
    try {
      const data = await callChatGpt(image);
      return data;
    } catch (error) {
      console.error("GPT API error:", error);
      throw error;
    }
  };

  return (
    <Accordion
      type="multiple"
      className="w-full px-4"
      defaultValue={["Layout", "Elements", "Describe"]}
    >
      <AccordionItem value="Layout" className="py-0 border-y-[1px]">
        <AccordionTrigger className="!no-underline">Layout</AccordionTrigger>
        <AccordionContent className="flex flex-wrap gap-2 ">
          {elements
            .filter((element) => element.group === "layout")
            .map((element) => (
              <div
                key={element.id}
                className="flex-col items-center justify-center flex"
              >
                {element.Component}
                <span className="text-muted-foreground">{element.label}</span>
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="Elements" className="py-0 ">
        <AccordionTrigger className="!no-underline">Elements</AccordionTrigger>
        <AccordionContent className="flex flex-wrap gap-2 ">
          {elements
            .filter((element) => element.group === "elements")
            .map((element) => (
              <div
                key={element.id}
                className="flex-col items-center justify-center flex"
              >
                {element.Component}
                <span className="text-muted-foreground">{element.label}</span>
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="Describe" className="py-0 ">
        <AccordionTrigger className="!no-underline">Describe</AccordionTrigger>
        <AccordionContent className="flex flex-wrap gap-2 ">
          <DescriptionForm />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="import" className="py-0 ">
        <AccordionTrigger className="!no-underline">Import</AccordionTrigger>
        <AccordionContent className="flex flex-wrap gap-2 ">
          <JSONImportForm onImport={handleImport} />
          {/* <OCRForm
            handleImageUpdate={handleImageUpdate}
            handleChatGpt={handleCallChatGpt}
            handleCropEdgeImg={handleCropEdgeImg}
            handleImageAnalyze={handleAnalyzeImage}
          /> */}
          <UploadForm
            handleImageUpdate={handleImageUpdate}
            handleChatGpt={handleCallChatGpt}
            handleCropEdgeImg={handleCropEdgeImg}
            handleImageAnalyze={handleAnalyzeImage}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default ComponentsTab;
