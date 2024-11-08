"use client";

import { X } from "lucide-react";
import ImageCropper from "../image-cropper";
import { createPortal } from "react-dom";
import { loadOpenCV } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  addressPattern,
  emailPattern,
  jobTitlePatterns,
  namePatterns,
  phonePattern,
  websitePattern,
} from "@/lib/ocr-patterns";
import { analyzeImage, autoCropEdgeImage, callChatGpt } from "@/lib/utils";
import { generateCustomID } from "@/lib/utils";
import { useEditor, EditorElement } from "@/lib/editor/editor-provider";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

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

interface CropModalProps {
  updateImage: any;
  onExtractedInfo: (
    extractedInfo: any,
    originalImageWidth: number,
    uploadedImageUrl: string
  ) => void;
  closeModal: () => void;
  onImageUpload: (uploadedImageUrl: string) => void;
  element: EditorElement; // from Props
  sectionId: string; // from Props
  bubbleId: string; //
}

const extractInfo = async (words: any, imageSrc: string) => {
  console.log("extract info called");
  console.log("Words: ", words);

  let extractedInfo: { type: string; text: string; position: any }[] = [];

  const lines = words.reduce((acc: any[], word: any) => {
    const lastLine = acc[acc.length - 1];
    if (lastLine && Math.abs(lastLine[0].bbox.y0 - word.bbox.y0) < 10) {
      lastLine.push(word);
    } else {
      acc.push([word]);
    }
    return acc;
  }, []);

  const concatenatedLines = lines.map((line: any[]) => {
    const text = line.map((word) => word.text).join(" ");

    const bbox = line.reduce(
      (acc, word) => {
        if (acc.x0 > word.bbox.x0) acc.x0 = word.bbox.x0;
        if (acc.y0 > word.bbox.y0) acc.y0 = word.bbox.y0;
        if (acc.x1 < word.bbox.x1) acc.x1 = word.bbox.x1;
        if (acc.y1 < word.bbox.y1) acc.y1 = word.bbox.y1;
        return acc;
      },
      { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
    );

    return { text, bbox };
  });

  console.log("Concatenated Lines: ", concatenatedLines);

  concatenatedLines.forEach(
    ({ text: lineText, bbox: lineBbox }: { text: string; bbox: any }) => {
      console.log("Processing line: ", lineText);
      let match: RegExpMatchArray | null;

      if ((match = lineText.match(emailPattern))) {
        console.log("Email match: ", match);
        extractedInfo.push({
          type: "email",
          text: match[0],
          position: lineBbox,
        });
      } else if ((match = lineText.match(phonePattern))) {
        console.log("Phone match: ", match);
        extractedInfo.push({
          type: "phone",
          text: match[0],
          position: lineBbox,
        });
      } else if (
        jobTitlePatterns.some(
          (pattern) => (match = lineText.match(pattern)) !== null
        )
      ) {
        console.log("Job Title match: ", match);
        extractedInfo.push({
          type: "jobTitle",
          text: match![0],
          position: lineBbox,
        });
      } else if ((match = lineText.match(addressPattern))) {
        console.log("Address match: ", match);
        extractedInfo.push({
          type: "address",
          text: match[0],
          position: lineBbox,
        });
      } else if ((match = lineText.match(websitePattern))) {
        console.log("Website match: ", match);
        extractedInfo.push({
          type: "website",
          text: match[0],
          position: lineBbox,
        });
      } else if (
        namePatterns.some(
          (pattern) => (match = lineText.match(pattern)) !== null
        )
      ) {
        console.log("Name match: ", match);
        extractedInfo.push({
          type: "name",
          text: match![0],
          position: lineBbox,
        });
      } else {
        console.log("No match found for line: ", lineText);
      }
    }
  );

  // logo detection
  // try {
  //     const logoPosition = await detectLogo(imageSrc);
  //     if (logoPosition) {
  //         extractedInfo.push({ type: 'logo', text: '', position: logoPosition });
  //     }
  // } catch (error) {
  //     console.error("Error detecting logo:", error);
  // }

  console.log("Extracted Info: ", extractedInfo);
  return extractedInfo;
};

const CropModal: React.FC<CropModalProps> = ({
  updateImage,
  onExtractedInfo,
  closeModal,
  element, // new props from Props
  sectionId, // new props from Props
  bubbleId, // new props from Props
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLogos, setDetectedLogos] = useState<any[]>([]);
  const [croppedLogos, setCroppedLogos] = useState<string[]>([]);
  const [logoRotations, setLogoRotations] = useState<number[]>([]);
  const [isGptDataLoading, setIsGptDataLoading] = useState(false);

  const [gptData, setGptData] = useState<any>(null);
  const [gptDataLayout, setGptDataLayout] = useState<any>("horizontal");
  const [gptDataQuadrant, setGptDataQuadrant] = useState<any>(null);

  const [croppedGPTLogo, setCroppedGPTLogo] = useState<string>("");
  const { dispatch, state } = useEditor();
  const [elements, setElements] = useState<any[]>([]);

  const [bubbleAlign, setBubbleAlign] = useState<string>("vertical");

  const [imageQuadrant, setImageQuadrant] = useState<string>("top-left");

  let uploadedImageURL: string = "";

  const handleOCRText = async (ocrData: any, originalImageWidth: number) => {
    if (!ocrData || !Array.isArray(ocrData)) {
      console.error("Invalid OCR data received:", ocrData);
      return;
    }

    const extractedInfo = await extractInfo(ocrData, imageSrc);
    console.log(extractedInfo);
    onExtractedInfo(extractedInfo, originalImageWidth, uploadedImageURL);
  };

  const handleImageUpload = (uploadedImageUrl: string) => {
    return (uploadedImageURL = uploadedImageUrl);
  };

  // from base 64 to a blob
  function base64ToBlob(base64: string, contentType = "", sliceSize = 512) {
    const byteCharacters = atob(base64.split(",")[1]); // Decode base64
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  async function uploadCroppedImage(base64Image: string) {
    const contentType = "image/png";
    const blob = base64ToBlob(base64Image, contentType);
    const file = new File([blob], "cropped_image.png", { type: contentType });

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploadImage", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data;
  }

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
            // console.log("crop log");
            // console.log(croppedImages);
            rotations.push(0);
          }
        });
        resolve();
      };
    });

    setCroppedLogos(croppedImages);
    setLogoRotations(rotations);
  };

  const handleImageAnalyze = async (
    image: File,
    originalWidth: number,
    originalHeight: number
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

      if (result.logoAnnotations) {
        result.logoAnnotations.forEach((logo: any) => {
          if (logo.boundingPoly && logo.boundingPoly.vertices) {
            const quadrant = imageQuadrantHandler(
              originalWidth,
              originalHeight,
              logo.boundingPoly.vertices
            );
            // todo -- resize the logo detected
            setImageQuadrant(quadrant);
            // const vertices = logo.boundingPoly.vertices;
            // console.log("Vertices for logo:", vertices);
          }
        });

        // Proceed with cropping logos based on the vertices
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

      return result;
    } catch (error) {
      console.error("Error analyzing image:", error);
      setIsLoading(false); // End loading state on error
      throw error;
    }
  };

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

  const createTextElement = (textContent: any): any[] => {
    return Object.keys(textContent).map((key: any) => {
      return {
        id: generateCustomID(),
        type: "text",
        text: textContent[key], // Access the value from the object
        size: "sm",
        align: "0",
        description: "test description",
      };
    });
  };

  const createBoxElement = (gptReturnData: any): any => {
    return {
      id: generateCustomID(),
      type: "box",
      layout: "vertical",
      contents: [createTextElement(gptReturnData)],
      position: "absolute",
      description: "box description",
    };
  };

  const addImageElement = (targetId: string, imageUrl: string) => {
    dispatch({
      type: "ADD_ELEMENT",
      payload: {
        bubbleId: bubbleId,
        sectionId: sectionId,
        targetId: targetId,
        elementDetails: {
          id: uuidv4(),
          type: "image",
          url: imageUrl,
          description: "Image is the best way to render information!",
        },
      },
    });
  };

  // disable the logo detection since we do not need this
  const handleChatGpt = async (image: File): Promise<any> => {
    try {
      setIsGptDataLoading(true);

      const result = await callChatGpt(image);

      const content = result.message.content.replace(/```json|```/g, "").trim();

      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
        setGptData(parsedContent.labels);
        setGptDataLayout(parsedContent.layout);
        setGptDataQuadrant(parsedContent.quadrants);
      } catch (parseError) {
        console.log("Received non-JSON response from ChatGPT:", content);
        setGptData([]);
        setGptDataLayout("horizontal");
        // throw new Error("ChatGPT returned a non-JSON response");
        parsedContent = { labels: [], layout: "horizontal" };
      }

      setIsGptDataLoading(false);
      console.log("gpt", parsedContent);

      const newElements: any[] = [];
      newElements.push(createBoxElement(parsedContent.labels));

      setElements(newElements);
      setIsGptDataLoading(false);

      return parsedContent;
    } catch (error) {
      setGptData([]);
      setGptDataLayout("horizontal");
      setIsGptDataLoading(false);
      console.log("Error analyzing image:", error);
      // throw error;
    }
  };

  // use to detect the image stay in which quadrant
  const imageQuadrantHandler = (
    croppedImageWidth: number,
    croppedImageHeight: number,
    logoBoundingBox: any
  ) => {
    const midWidth = croppedImageWidth / 2;
    const midHeight = croppedImageHeight / 2;

    const logoCenterX = (logoBoundingBox[0].x + logoBoundingBox[1].x) / 2;
    const logoCenterY = (logoBoundingBox[0].y + logoBoundingBox[2].y) / 2;

    let quadrant = "";
    if (logoCenterX < midWidth && logoCenterY < midHeight) {
      quadrant = "top-left";
    } else if (logoCenterX >= midWidth && logoCenterY < midHeight) {
      quadrant = "top-right";
    } else if (logoCenterX < midWidth && logoCenterY >= midHeight) {
      quadrant = "bottom-left";
    } else if (logoCenterX >= midWidth && logoCenterY >= midHeight) {
      quadrant = "bottom-right";
    }

    console.log("Logo detected in quadrant:", quadrant);

    return quadrant;
  };

  const addBoxElement = (
    targetId: string,
    elementDetailsId: string,
    layout: string,
    margin: string = "0px"
  ) => {
    dispatch({
      type: "ADD_ELEMENT",
      payload: {
        bubbleId: state.editor.selectedElementBubbleId,
        sectionId: state.editor.selectedElementSectionId || "initial_body",
        targetId: targetId, // 1
        elementDetails: {
          id: elementDetailsId, // 2
          type: "box",
          layout: layout, // possible value will be baseline, vertical, horizontal
          contents: [],
          description: "Expand your creativity by using me!",
          margin: margin,
        },
      },
    });
  };

  const addTextElement = (targetId: string, text: string) => {
    dispatch({
      type: "ADD_ELEMENT",
      payload: {
        bubbleId: state.editor.selectedElementBubbleId,
        sectionId: state.editor.selectedElementSectionId || "initial_body",
        targetId: targetId,
        elementDetails: {
          id: uuidv4(),
          type: "text",
          text: text,
          description: "Render your mind using me.",
          align: "start",
          size: "xxs",
        },
      },
    });
  };

  // create box for left side, a parent box contains two box, topleftbox and bottomleftbox
  // will add the image to the box first if a logo detected
  const createLeftQuadrantBoxes = (
    parentId: string,
    gptData: any,
    gptDataQuadrant: any,
    uploadedUrls: string[]
  ) => {
    const leftVerticalBoxId = uuidv4();
    addBoxElement(parentId, leftVerticalBoxId, "vertical");

    const topLeftBoxId = uuidv4();
    addBoxElement(leftVerticalBoxId, topLeftBoxId, "vertical");

    // add the image to the quadrant respectively first if a image is detected, only if the image is at the top-left
    if (imageQuadrant == "top-left" && uploadedUrls.length > 0) {
      const imageUrl = uploadedUrls.shift();
      if (imageUrl) {
        addImageElement(topLeftBoxId, imageUrl);
      }
    }

    if (gptDataQuadrant["top-left"]) {
      for (let i = 0; i < gptDataQuadrant["top-left"].length; i++) {
        addTextElement(
          topLeftBoxId,
          gptData[gptDataQuadrant["top-left"][i]].text
        );
      }
    }

    const bottomLeftBoxId = uuidv4();
    addBoxElement(leftVerticalBoxId, bottomLeftBoxId, "vertical", "30px");

    if (gptDataQuadrant["bottom-left"]) {
      for (let i = 0; i < gptDataQuadrant["bottom-left"].length; i++) {
        addTextElement(
          bottomLeftBoxId,
          gptData[gptDataQuadrant["bottom-left"][i]].text
        );
      }
    }

    return { topLeftBoxId, bottomLeftBoxId };
  };

  // create box for right side, a parent box contains two box, toprightbox and bottomrightbox
  // will add the image to the box first if a logo detected
  const createRightQuadrantBoxes = (
    parentId: string,
    gptData: any,
    gptDataQuadrant: any,
    uploadedUrls: string[]
  ) => {
    const rightVerticalBoxId = uuidv4();
    addBoxElement(parentId, rightVerticalBoxId, "vertical");

    const topRightBoxId = uuidv4();
    addBoxElement(rightVerticalBoxId, topRightBoxId, "vertical");

    // add the image to the quadrant respectively first if a image is detected, only if the image is at the top-right
    if (imageQuadrant == "top-right" && uploadedUrls.length > 0) {
      const imageUrl = uploadedUrls.shift();
      if (imageUrl) {
        addImageElement(topRightBoxId, imageUrl);
      }
    }

    if (gptDataQuadrant["top-right"]) {
      for (let i = 0; i < gptDataQuadrant["top-right"].length; i++) {
        addTextElement(
          topRightBoxId,
          gptData[gptDataQuadrant["top-right"][i]].text
        );
      }
    }

    const bottomRightBoxId = uuidv4();
    addBoxElement(rightVerticalBoxId, bottomRightBoxId, "vertical", "30px");

    if (gptDataQuadrant["bottom-right"]) {
      for (let i = 0; i < gptDataQuadrant["bottom-right"].length; i++) {
        addTextElement(
          bottomRightBoxId,
          gptData[gptDataQuadrant["bottom-right"][i]].text
        );
      }
    }

    return { topRightBoxId, bottomRightBoxId };
  };

  const saveCardHandler = async (
    croppedImageWidth: number,
    croppedImageHeight: number
  ) => {
    const currentImageUrl = state.editor.selectedElement.url;
    const url = new URL(currentImageUrl || "");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (croppedImageWidth >= croppedImageHeight) {
      setBubbleAlign("horizontal");

      if (Object.keys(gptData).length > 0 && croppedLogos.length > 0) {
        dispatch({
          type: "DELETE_ELEMENT",
          payload: {
            bubbleId: bubbleId,
            sectionId: sectionId,
            elementId: element.id,
          },
        });

        const parentBoxId = uuidv4();
        addBoxElement(
          state.editor.component?.body?.contents[0].id || "initial_box",
          parentBoxId,
          "baseline"
        );

        let topLeftBoxId = "";
        let bottomLeftBoxId = "";
        let topRightBoxId = "";
        let bottomRightBoxId = "";

        if (gptDataLayout === "horizontal") {
          try {
            const uploadedUrls: string[] = await Promise.all(
              croppedLogos.map(async (croppedImage) => {
                const data = await uploadCroppedImage(croppedImage);
                const uploadedImageUrl = `${baseUrl}/api/uploadImage/${data.fileId}`;
                return uploadedImageUrl;
              })
            );

            if (
              (gptDataQuadrant["top-left"] || gptDataQuadrant["bottom-left"]) &&
              (gptDataQuadrant["top-right"] || gptDataQuadrant["bottom-right"])
            ) {
              ({ topLeftBoxId, bottomLeftBoxId } = createLeftQuadrantBoxes(
                parentBoxId,
                gptData,
                gptDataQuadrant,
                uploadedUrls
              ));
              ({ topRightBoxId, bottomRightBoxId } = createRightQuadrantBoxes(
                parentBoxId,
                gptData,
                gptDataQuadrant,
                uploadedUrls
              ));
            } else if (
              !(
                gptDataQuadrant["top-left"] || gptDataQuadrant["bottom-left"]
              ) &&
              (gptDataQuadrant["top-right"] || gptDataQuadrant["bottom-right"])
            ) {
              ({ topRightBoxId, bottomRightBoxId } = createRightQuadrantBoxes(
                parentBoxId,
                gptData,
                gptDataQuadrant,
                uploadedUrls
              ));
            } else if (
              (gptDataQuadrant["top-left"] || gptDataQuadrant["bottom-left"]) &&
              !(gptDataQuadrant["top-right"] || gptDataQuadrant["bottom-right"])
            ) {
              ({ topLeftBoxId, bottomLeftBoxId } = createLeftQuadrantBoxes(
                parentBoxId,
                gptData,
                gptDataQuadrant,
                uploadedUrls
              ));
            }

            toast.success(
              "Images have been uploaded and the card has been updated successfully."
            );
          } catch (error) {
            console.error("Error uploading images:", error);
            toast.error("Failed to upload images. Please try again.");
          }
        }
      }
    } else {
      setBubbleAlign("vertical");
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

  return createPortal(
    <div
      className="relative z-50 w-min-content justify-center items-center flex overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
      aria-labelledby="crop-image-dialog"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-all backdrop-blur-sm"></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full justify-center px-2 py-12 text-center ">
          <div className="relative w-[80%] sm:w-[60%] min-h-[60vh] rounded-2xl bg-gray-800 text-slate-100 text-left shadow-xl transition-all h-min self-center items-center">
            <div className="px-5 py-4 text-center">
              <button
                type="button"
                className="rounded-md p-1 inline-flex items-center justify-center text-gray-400 hover:bg-gray-700 focus:outline-none absolute top-2 right-2"
                onClick={closeModal}
              >
                <span className="sr-only">Close menu</span>
                <X />
              </button>
              <ImageCropper
                updateImage={updateImage}
                handleOCRText={handleOCRText}
                setImageSrc={setImageSrc}
                closeModal={closeModal}
                onImageUpload={handleImageUpload}
                handleImageAnalyze={handleImageAnalyze}
                handleCropEdgeImg={handleCropEdgeImg}
                handleChatGpt={handleChatGpt}
                croppedImages={croppedLogos}
                saveCard={saveCardHandler}
                element={element} // new props from Props
                sectionId={sectionId} // new props from Props
                bubbleId={bubbleId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")!
  );
};

export default CropModal;
