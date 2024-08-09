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
import UploadForm from "@/components/forms/upload-form";
import { analyzeImage, autoCropEdgeImage, callChatGpt } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GoogleLogoList from "@/components/forms/googlelogolist";
import GptData from "@/components/forms/gpt-data";
import { X } from "lucide-react";
import { generateCustomID } from "@/lib/utils";

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
  const [dataReturned, setDataReturned] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGptDataLoading, setIsGptDataLoading] = useState(false);
  const [croppedLogos, setCroppedLogos] = useState<string[]>([]);
  const [logoRotations, setLogoRotations] = useState<number[]>([]);
  const [manualCroppedLogos, setManualCroppedLogos] = useState<string[]>([]);
  const [manualLogoRotations, setManualLogoRotations] = useState<number[]>([]);
  const [editText, setEditText] = useState("");
  const [isCropping, setIsCropping] = useState(false);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [gptData, setGptData] = useState<any>(null);
  const [croppedGPTLogo, setCroppedGPTLogo] = useState<string>("");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [detectedLogos, setDetectedLogos] = useState<any[]>([]);

  // const [isGptDataLoading, setIsGptDataLoading] = useState(false);

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

  const rotateLogo = (index: number, isManual: boolean = false) => {
    if (isManual) {
      const newRotations = [...manualLogoRotations];
      newRotations[index] = (newRotations[index] + 90) % 360;
      setManualLogoRotations(newRotations);
    } else {
      const newRotations = [...logoRotations];
      newRotations[index] = (newRotations[index] + 90) % 360;
      setLogoRotations(newRotations);
    }
  };

  const removeLogo = (index: number, isManual: boolean = false) => {
    if (isManual) {
      const newManualCroppedLogos = manualCroppedLogos.filter(
        (_, i) => i !== index
      );
      const newManualLogoRotations = manualLogoRotations.filter(
        (_, i) => i !== index
      );
      setManualCroppedLogos(newManualCroppedLogos);
      setManualLogoRotations(newManualLogoRotations);
    } else {
      const newCroppedLogos = croppedLogos.filter((_, i) => i !== index);
      const newLogoRotations = logoRotations.filter((_, i) => i !== index);
      setCroppedLogos(newCroppedLogos);
      setLogoRotations(newLogoRotations);
    }
  };

  const handleSave = () => {
    setSaveModalOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    // setCurrentDrop(null);
    setEditText("");
  };

  const cropLogos = async (image: File, coordinates: any[]): Promise<void> => {
    const imageURL = URL.createObjectURL(image);
    const croppedImages: string[] = [];
    const rotations: number[] = [];

    const img = new Image();
    img.src = imageURL;

    await new Promise<void>((resolve) => {
      img.onload = () => {
        coordinates.forEach((coords) => {
          const [x0, y0] = [coords[0].x, coords[0].y];
          const [x1, y1] = [coords[2].x, coords[2].y];
          const width = x1 - x0;
          const height = y1 - y0;

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (context) {
            canvas.width = width;
            canvas.height = height;

            context.drawImage(img, x0, y0, width, height, 0, 0, width, height);
            croppedImages.push(canvas.toDataURL("image/png"));
            rotations.push(0);
          }
        });
        resolve();
      };
    });

    setCroppedLogos(croppedImages);
    setLogoRotations(rotations);
  };

  const startCrop = () => {
    setIsCropping(true);
  };

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
    setUploadedImageUrl(image);
    setDataReturned(true);
  };

  // ocr from google api to detect logo
  const handleImageAnalyze = async (
    image: File,
    originalWidth: number
  ): Promise<{
    logoAnnotations: any[];
  }> => {
    console.log("Image analyze:", image);
    try {
      setIsLoading(true);

      const result = await analyzeImage(image);
      console.log("Detected Logos:", result.logoAnnotations);
      setDetectedLogos(result.logoAnnotations || []);
      setIsLoading(false);

      // Extract logo coordinates
      if (result.logoAnnotations) {
        const logoCoords = result.logoAnnotations.map(
          (logo: any) => logo.boundingPoly.vertices
        );
        await cropLogos(image, logoCoords);
      } else {
        setCroppedLogos([]);
      }

      const calculateTextAlign = (
        x0: number,
        x1: number,
        originalWidth: number
      ) => {
        const relativeX0Position = x0 / originalWidth;
        const relativeX1Position = x1 / originalWidth;

        console.log("Relative X0 Position:", relativeX0Position);
        console.log("Relative X1 Position:", relativeX1Position);

        if (relativeX1Position > 0.7 || relativeX0Position > 0.6) {
          return "end";
        } else if (relativeX0Position > 0.33) {
          return "center";
        } else {
          return "start";
        }
      };

      const MAX_WIDTH = 384;

      const scalePosition = (position: any, originalWidth: number) => {
        const scaleRatio = MAX_WIDTH / originalWidth;
        return {
          x0: position.x0 * scaleRatio,
          y0: position.y0 * scaleRatio,
          x1: position.x1 * scaleRatio,
          y1: position.y1 * scaleRatio,
        };
      };

      const createTextElement = (text: string, position: any): any => {
        const scaledPosition = scalePosition(position, originalWidth);
        const { x0, x1 } = scaledPosition;
        const textAlign = calculateTextAlign(x0, x1, originalWidth);

        return {
          id: generateCustomID(),
          type: "text",
          text: text,
          size: "sm",
          align: textAlign,
          description: "text description",
        };
      };

      const createBoxElement = (field: any): any => {
        const { text, position } = field;

        console.log("Creating box element for:", text);
        console.log("Position:", position);

        return {
          id: generateCustomID(),
          type: "box",
          layout: "vertical",
          contents: [createTextElement(text, position)],
          position: "absolute",
          description: "box description",
        };
      };

      const elements: any[] = [];

      // console.log("Extracted Info above:", extractedInfo);

      // Object.keys(extractedInfo).forEach((key) => {
      //   const field = extractedInfo[key];
      //   if (field.position) {
      //     elements.push(createBoxElement(field));
      //   } else {
      //     console.log("Field without position:", field);
      //   }
      // });

      // final json that need to be saved in the db
      // Object.keys(elements).forEach((key: any) => {
      //   console.log(
      //     key + " elements: " + JSON.stringify(elements[key], null, 2)
      //   );
      // });

      return result;
    } catch (error) {
      console.error("Error analyzing image:", error);
      setIsLoading(false); // End loading state on error
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
  // const handleCallChatGpt = async (image: File): Promise<any> => {
  //   try {
  //     const data = await callChatGpt(image);
  //     return data;
  //   } catch (error) {
  //     console.error("GPT API error:", error);
  //     throw error;
  //   }
  // };

  const handleChatGpt = async (image: File): Promise<any> => {
    try {
      setIsGptDataLoading(true);

      const result = await callChatGpt(image);
      const content = result.message.content.replace(/```json|```/g, "").trim();
      const parsedContent = JSON.parse(content);
      setGptData(parsedContent);

      setIsGptDataLoading(false);
      console.log(parsedContent);

      if (parsedContent.logo && parsedContent.logo.logo_detected) {
        if (parsedContent.logo.logo) {
          const { x, y, width, height } = parsedContent.logo.logo;
          console.log(
            "Using parsedContent.logo.logo:",
            parsedContent.logo.logo
          );
          await cropLogoFromCoordinates(x, y, width, height, image);
        } else if (parsedContent.logo.coordinates) {
          const { x, y, width, height } = parsedContent.logo.coordinates;
          console.log(
            "Using parsedContent.logo.coordinates:",
            parsedContent.logo.coordinates
          );
          await cropLogoFromCoordinates(x, y, width, height, image);
        } else {
          console.log("No valid logo coordinates found in parsedContent.logo.");
        }
      } else {
        console.log("No logo detected in parsedContent.");
      }

      return parsedContent;
    } catch (error) {
      console.log("Error analyzing image:", error);
      setIsGptDataLoading(false);
      throw error;
    }
  };

  const cropLogoFromCoordinates = async (
    x: number,
    y: number,
    width: number,
    height: number,
    image: File
  ): Promise<void> => {
    console.log(x + "!" + y + "!" + width + "!" + height);
    const imageURL = URL.createObjectURL(image);
    let croppedImage = "";
    console.log("cropLogoFromCoordinates" + imageURL);
    const img = new Image();
    img.src = imageURL;

    await new Promise<void>((resolve) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (context) {
          canvas.width = width;
          canvas.height = height;

          context.drawImage(img, x, y, width, height, 0, 0, width, height);
          croppedImage = canvas.toDataURL("image/png");
        }
        resolve();
      };
    });
    setCroppedGPTLogo(croppedImage);
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
          {/* <OCRForm /> */}
          {/* <UploadForm
            handleImageUpdate={handleImageUpdate}
            handleChatGpt={handleCallChatGpt}
            handleCropEdgeImg={handleCropEdgeImg}
            handleImageAnalyze={handleAnalyzeImage}
          /> */}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="ImageUpload" className="py-0 ">
        <AccordionTrigger className="!no-underline">
          Image Upload
        </AccordionTrigger>
        <AccordionContent className="flex flex-wrap gap-2 ">
          <UploadForm
            handleImageUpdate={handleImageUpdate}
            handleChatGpt={handleChatGpt}
            handleCropEdgeImg={handleCropEdgeImg}
            handleImageAnalyze={handleImageAnalyze}
          />
          {dataReturned && (
            <Card className="w-full">
              <div className="flex flex-col md:flex-row w-full">
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center text-slate-100 shadow-xl p-4 md:sticky md:top-0">
                  <CardHeader>
                    <CardTitle>Uploaded Image :</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={uploadedImageUrl}
                      alt="Uploaded"
                      className="max-w-full h-auto"
                    />
                  </CardContent>
                </div>
                <div className="w-full md:w-1/2 overflow-y-auto max-h-screen scrollbar-hide">
                  {(isLoading || isGptDataLoading) && (
                    <div className="flex flex-col items-center justify-center mt-8 space-y-4 min-h-[50vh]">
                      <Skeleton className="h-6 w-1/3 bg-white" />
                      <Skeleton className="h-6 w-1/2 bg-white" />
                      <Skeleton className="h-6 w-1/4 bg-white" />
                    </div>
                  )}
                  {!isLoading && !isGptDataLoading && (
                    <div className="text-white p-4 mt-2">
                      <CardContent>Please verify the below data.</CardContent>
                      <CardContent>
                        {croppedLogos.length > 0 && (
                          <div className="mt-2">
                            <div className="bg-white text-slate-900 p-4 rounded-2xl">
                              <CardHeader>
                                <CardTitle>Detected Logos:</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <GoogleLogoList
                                  croppedLogos={croppedLogos}
                                  logoRotations={logoRotations}
                                  removeLogo={removeLogo}
                                  rotateLogo={rotateLogo}
                                />
                              </CardContent>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardContent>
                        {manualCroppedLogos.length > 0 && (
                          <div className="mt-8">
                            <div className="bg-white text-slate-900 rounded-2xl shadow-xl p-4">
                              <CardHeader>
                                <CardTitle>Manually Cropped Logos:</CardTitle>
                              </CardHeader>
                              <CardContent className="p-0">
                                {manualCroppedLogos.map(
                                  (croppedImage, index) => (
                                    <div
                                      key={index}
                                      className="flex flex-col items-center mb-4 relative"
                                    >
                                      <img
                                        src={croppedImage}
                                        alt={`Manually cropped logo ${index}`}
                                        className="w-auto h-auto mt-2"
                                        style={{
                                          transform: `rotate(${manualLogoRotations[index]}deg)`,
                                        }}
                                      />
                                      <Button
                                        variant="ghost"
                                        onClick={() => removeLogo(index, true)}
                                        className="absolute top-0 right-0 mt-2 mr-2 text-red-500 hover:text-red-700"
                                      >
                                        {/* &times; */}
                                        <X />
                                      </Button>
                                      <CardFooter>
                                        <Button
                                          variant="default"
                                          onClick={() =>
                                            rotateLogo(index, true)
                                          }
                                          className="mt-2 px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out transform hover:scale-105"
                                        >
                                          Rotate
                                        </Button>
                                      </CardFooter>
                                    </div>
                                  )
                                )}
                              </CardContent>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <div className="p-6 pt-0">
                        <Button
                          variant="outline"
                          onClick={startCrop}
                          className="w-full"
                        >
                          Crop New Logo
                        </Button>
                      </div>
                      <CardContent>
                        {gptData && (
                          <GptData
                            gptData={gptData}
                            isGptDataLoading={isGptDataLoading}
                          />
                        )}
                      </CardContent>
                      <CardFooter>
                        <div className="mt-8 w-full flex justify-center">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleSave}
                          >
                            Save
                          </Button>
                        </div>
                      </CardFooter>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default ComponentsTab;
