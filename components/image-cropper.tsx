"use client";

import { useEffect, useRef, useState } from "react";
import ReactCrop, {
  Crop,
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from "react-image-crop";
import { ClipLoader } from "react-spinners";
import { Button } from "./ui/button";
import Image from "next/image";
import GoogleLogoList from "./forms/googlelogolist";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
// import GptData from "@/components/forms/gpt-data";
import GptData from "@/app/[lang]/(workspace)/workspace/create-card/_components/ocr/_components/GptData";
import { useEditor, EditorElement } from "@/lib/editor/editor-provider";

const ASPECT_RATIO = 1;
const MIN_DIMENSION = 150;

type Props = {
  element: EditorElement;
  sectionId: string;
  bubbleId: string;
};

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

const setCanvasPreview = (
  image: any, // HTMLImageElement
  canvas: any, // HTMLCanvasElement
  crop: any // PixelCrop
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No 2d context");
  }

  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and needing to
  // size the image back down if you want to download/upload and be
  // true to the images natural size.
  const pixelRatio = window.devicePixelRatio;
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";
  ctx.save();

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  // Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );

  ctx.restore();
};

interface ImageCropperProps {
  updateImage: (url: string) => void;
  handleOCRText: (
    ocrData: any,
    originalWidth: number,
    uploadedImageUrl: string
  ) => void;
  setImageSrc: (src: string) => void;
  closeModal: () => void;
  onImageUpload: (uploadedImageUrl: string) => void;
  handleImageAnalyze: (
    image: File,
    originalWidth: number
  ) => Promise<{
    logoAnnotations: any[];
  }>;
  handleCropEdgeImg: (image: File) => Promise<CropEdgeImageResult>;
  handleChatGpt: (image: File) => Promise<any>;
  croppedImages: string[];
  saveCard: (croppedImageWidth: number, croppedImageHeight: number) => void;
  element: EditorElement; // from Props
  sectionId: string; // from Props
  bubbleId: string; // from Props
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  closeModal,
  updateImage,
  handleOCRText,
  setImageSrc,
  onImageUpload,
  handleImageAnalyze,
  handleCropEdgeImg,
  handleChatGpt,
  croppedImages,
  saveCard,
  element, // new props from Props
  sectionId, // new props from Props
  bubbleId, // new props from Props
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imgSrc, setImgSrcLocal] = useState("");
  const [rawImgSrc, setRawImgSrc] = useState("");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [error, setError] = useState("");
  const [originalImageWidth, setOriginalImageWidth] = useState<number>(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);

  const [showChoosePhotoButton, setShowChoosePhotoButton] = useState(false);

  // upload img width and height
  const [uploadImgWidth, setUploadImgWidth] = useState<number>(0);
  const [uploadImgHeight, setUploadImgHeight] = useState<number>(0);

  const [dataReturned, setDataReturned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGptDataLoading, setIsGptDataLoading] = useState(false);
  const [croppedLogos, setCroppedLogos] = useState<string[]>([]);
  const [logoRotations, setLogoRotations] = useState<number[]>([]);
  const [manualCroppedLogos, setManualCroppedLogos] = useState<string[]>([]);
  const [manualLogoRotations, setManualLogoRotations] = useState<number[]>([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [detectedLogos, setDetectedLogos] = useState<any[]>([]);
  const [isCropping, setIsCropping] = useState(false);
  const [gptData, setGptData] = useState<any>(null);

  const [isSaveButtonShow, setIsSaveButtonSave] = useState<boolean>(false); // use to trigger save display at frontend
  const [isOcrButtonShow, setIsOcrButtonShow] = useState<boolean>(false);

  const [cropImgAreaShow, setCropImgAreaShow] = useState<boolean>(false);

  const [croppedFile, setCroppedFile] = useState<File | null>(null);

  const [croppedImgWidth, setCroppedImgWidth] = useState<number>(50);
  const [croppedImgHeight, setCroppedImgHeight] = useState<number>(50);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [croppedImageWidth, setCroppedImageWidth] = useState<number>(0);

  const handlePhotoChoice = () => {
    setShowChoosePhotoButton(!showChoosePhotoButton);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setIsOcrButtonShow(true);
  };

  const onSelectFile = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalFile(file);
    setLoading(true);
    setCropImgAreaShow(true);

    const reader = new FileReader();
    reader.addEventListener("load", async () => {
      // const imageElement = new Image();
      const imageElement = document.createElement("img");
      const imageUrl = reader.result?.toString() || "";
      imageElement.src = imageUrl;

      setRawImgSrc(imageUrl);

      imageElement.addEventListener("load", async (e: any) => {
        try {
          if (error) setError("");
          const { naturalWidth, naturalHeight }: any = e.currentTarget;
          if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
            setError("Image must be at least 150 x 150 pixels.");
            setLoading(false);
            return setImgSrcLocal("");
          }
          setOriginalImageWidth(naturalWidth);
          //setOriginalImageHeight(naturalHeight);

          console.log("Image width" + naturalWidth);
          console.log("Image height" + naturalHeight);

          setUploadImgWidth(naturalWidth);
          setUploadImgHeight(naturalHeight);
          setImgSrcLocal(imageUrl);
          setImageSrc(imageUrl);
        } catch (err) {
          console.error("Error handling image load:", err);
          setError("Failed to process image.");
        } finally {
          setLoading(false);
        }
      });
    });
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: any) => {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (MIN_DIMENSION / width) * 100;

    // Ensure crop is defined before calling centerCrop
    if (crop) {
      const crop = makeAspectCrop(
        {
          unit: "%",
          width: cropWidthInPercent,
        },
        ASPECT_RATIO,
        width,
        height
      );
      const centeredCrop: any = centerCrop(crop, width, height);
      setCrop(centeredCrop);
    }
  };

  // used to crop image
  const handleCropImage = async () => {
    if (imgRef.current && previewCanvasRef.current && crop) {
      // console.log("1");
      setCanvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height)
      );

      // const { croppedWidth, croppedHeight } = getCroppedImageDimensions(
      //   crop,
      //   imgRef.current.naturalWidth,
      //   imgRef.current.naturalHeight
      // );

      // console.log(
      //   `Cropped image dimensions: ${croppedWidth}x${croppedHeight}px`
      // );

      previewCanvasRef.current.toBlob(async (blob) => {
        if (blob) {
          const croppedFile = new File([blob], "cropped_image.png", {
            type: "image/png",
          });

          setCroppedFile(croppedFile);
        }
      }, "image/png");
    }
    // console.log("2");
  };

  // const handleFullImageUpload = async () => {
  //   if (fileInputRef.current?.files?.[0]) {
  //     const file = fileInputRef.current.files[0];
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     const response = await fetch("/api/uploadImage", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       const uploadedImageUrl = `/api/uploadImage/${data.fileId}`;
  //       const uploadImageUrlWithHttp = `${process.env.NEXT_PUBLIC_BASE_URL}${uploadedImageUrl}`;
  //       updateImage(uploadImageUrlWithHttp);
  //       closeModal();
  //     } else {
  //       setError(`Upload failed: ${data.message}`);
  //     }
  //   }
  // };

  const handleCropAndOCR = async (onImageUpload: (url: string) => void) => {
    if (loading) return;

    setIsOcrButtonShow(false);
    setCropImgAreaShow(false);

    if (imgRef.current && previewCanvasRef.current && crop) {
      setLoading(true);
      setCanvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height)
      );

      const { croppedWidth, croppedHeight } = getCroppedImageDimensions(
        crop,
        imgRef.current.naturalWidth,
        imgRef.current.naturalHeight
      );

      setCroppedImgWidth(croppedWidth);
      setCroppedImgHeight(croppedHeight);

      console.log(
        `Cropped image dimensions: ${croppedWidth}x${croppedHeight}px`
      );

      previewCanvasRef.current.toBlob(async (blob) => {
        if (blob) {
          const croppedFile = new File([blob], "cropped_image.png", {
            type: "image/png",
          });

          setCroppedFile(croppedFile);

          console.log("Cropped File:", croppedFile);

          const googleApiLabels = await handleImageAnalyze(
            croppedFile,
            originalImageWidth
          );
          console.log("Google API return:", googleApiLabels);

          const chatgptRes = await handleChatGpt(croppedFile);

          let parsedContent;

          try {
            parsedContent =
              typeof chatgptRes === "string"
                ? JSON.parse(chatgptRes)
                : chatgptRes;
          } catch (parseError) {
            setGptData([]);
            setDataReturned(false);
            setIsLoading(false);
            console.log("Received non-JSON response from ChatGPT:", parseError);
            return;
          }
          if (chatgptRes.labels) {
            setGptData(chatgptRes.labels);
            setDataReturned(true);
          } else {
            setGptData([]);
          }
        }
        setLoading(false);
      }, "image/png");
    }
  };

  const getCroppedImageDimensions = (
    crop: Crop,
    originalWidth: number,
    originalHeight: number
  ) => {
    const croppedWidth = (crop.width / 100) * originalWidth;
    const croppedHeight = (crop.height / 100) * originalHeight;

    return { croppedWidth, croppedHeight };
  };

  // const getImageDimensions = (
  //   file: File
  // ): Promise<{ width: number; height: number }> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();

  //     reader.onload = (event) => {
  //       // const image = new Image();
  //       const image = document.createElement("img");
  //       image.onload = () => {
  //         resolve({ width: image.width, height: image.height });
  //       };
  //       image.onerror = (error: any) => {
  //         reject(error);
  //       };
  //       if (event.target && typeof event.target.result === "string") {
  //         image.src = event.target.result;
  //       } else {
  //         reject(new Error("Failed to read file"));
  //       }
  //     };

  //     reader.onerror = (error) => {
  //       reject(error);
  //     };

  //     reader.readAsDataURL(file);
  //   });
  // };

  const openCamera = async () => {
    setIsCameraOpen(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob)
          return console.error("Failed to get blob from capture image");
        const captureImage = new File([blob], "captureImage.jpg", {
          type: "image/jpeg",
        });
        setOriginalFile(captureImage);
      }, "image/jpeg");

      const imageSrc = canvas.toDataURL("image/png");
      setImgSrcLocal(imageSrc);
      setImageSrc(imageSrc);
      setOriginalImageWidth(canvas.width);
      //setOriginalImageHeight(canvas.height);
      closeCamera();
    }
  };

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

  // get result from gpt api and google vision api and show it at the flxbubble
  const handleUpdateFlxBubbleFromOcr = async () => {
    if (!croppedFile) {
      console.error("No cropped file available");
      return;
    }

    // console.log("save");
    // console.log(croppedImageWidth);
    saveCard(croppedImgWidth, croppedImgHeight);
    closeModal();
  };

  const startCrop = () => {
    setIsCropping(true);
  };

  return (
    <>
      {!showChoosePhotoButton && (
        <div className="flex gap-4 flex-row justify-center">
          {!dataReturned && (
            <>
              {" "}
              <Button
                variant="default"
                className="cursor-pointer mb-[15px]"
                onClick={handleButtonClick}
              >
                <span>Choose a photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onSelectFile}
                  ref={fileInputRef}
                  className="hidden"
                />
              </Button>
              <Button
                variant="default"
                className="cursor-pointer mb-[15px]"
                onClick={openCamera}
              >
                <span>Open Camera</span>
              </Button>
            </>
          )}
        </div>
      )}
      {isCameraOpen && (
        <div className="flex flex-col gap-4 items-center">
          <video ref={videoRef} autoPlay style={{ width: "100%" }} />
          <div className="flex gap-4 flex-row justify-center">
            <Button
              variant="default"
              className="cursor-pointer mb-[15px]"
              onClick={captureImage}
            >
              <span>Capture Image</span>
            </Button>
            <Button
              variant="default"
              className="cursor-pointer mb-[15px]"
              onClick={closeCamera}
            >
              <span>Close Camera</span>
            </Button>
          </div>
        </div>
      )}
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {loading ? (
        <div className="flex flex-col items-center mt-10">
          {imgSrc && (
            <div className="mb-4">
              <Image
                src={imgSrc}
                alt="Processing Image"
                width={uploadImgWidth} // img original width
                height={uploadImgHeight} // img original height
              />
            </div>
          )}
          <ClipLoader size={50} color={"#123abc"} loading={loading} />
          <p className="text-blue-400 text-xs">
            Just a moment, processing OCR...
          </p>
        </div>
      ) : (
        imgSrc && (
          <div className="flex flex-col items-center">
            {cropImgAreaShow && (
              <ReactCrop
                crop={crop}
                onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
                keepSelection
              >
                <Image
                  ref={imgRef}
                  src={imgSrc}
                  alt="Upload"
                  width={uploadImgWidth} // img ori width
                  height={uploadImgHeight} // img ori height
                  // onLoad={onImageLoad}
                  onLoad={() => {}}
                />
              </ReactCrop>
            )}
            {dataReturned && rawImgSrc && (
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Original Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Image
                      src={rawImgSrc}
                      alt="Original Image"
                      width={uploadImgWidth * 0.6} // make the image smaller
                      height={uploadImgHeight * 0.6}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
            {dataReturned && (
              <div className="w-full overflow-y-auto max-h-screen scrollbar-hide">
                {!isLoading && !isGptDataLoading && (
                  <div className="text-white p-4 mt-2">
                    <div>Please verify the below data.</div>
                    <CardContent>
                      {croppedImages.length > 0 && (
                        <div className="mt-2">
                          <div className="bg-white text-slate-900 p-4 rounded-2xl">
                            <CardHeader>
                              <CardTitle>Detected Logos:</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <GoogleLogoList
                                croppedLogos={croppedImages}
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
                      {/* {manualCroppedLogos.length > 0 && (
                        <div className="mt-8">
                          <div className="bg-white text-slate-900 rounded-2xl shadow-xl p-4">
                            <CardHeader>
                              <CardTitle>Manually Cropped Logos:</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                              {manualCroppedLogos.map((croppedImage, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col items-center mb-4 relative"
                                >
                                  <Image
                                    src={croppedImage}
                                    alt={`Manually cropped logo ${index}`}
                                    className="w-auto h-auto mt-2"
                                    width={100}
                                    height={100}
                                    style={{
                                      transform: `rotate(${manualLogoRotations[index]}deg)`,
                                    }}
                                  />
                                  <Button
                                    variant="ghost"
                                    onClick={() => removeLogo(index, true)}
                                    className="absolute top-0 right-0 mt-2 mr-2 text-red-500 hover:text-red-700"
                                  >
                                    <X />
                                  </Button>
                                  <CardFooter>
                                    <Button
                                      variant="default"
                                      onClick={() => rotateLogo(index, true)}
                                      className="mt-2 px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out transform hover:scale-105"
                                    >
                                      Rotate
                                    </Button>
                                  </CardFooter>
                                </div>
                              ))}
                            </CardContent>
                          </div>
                        </div>
                      )} */}
                    </CardContent>
                    {/* <div className="p-6 pt-0">
                      <Button
                        variant="outline"
                        onClick={startCrop}
                        className="w-full"
                      >
                        Crop New Logo
                      </Button>
                    </div> */}
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
                          // onClick={handleSave}
                          onClick={handleUpdateFlxBubbleFromOcr}
                        >
                          Save
                        </Button>
                      </div>
                    </CardFooter>
                  </div>
                )}
              </div>
            )}
            {isOcrButtonShow && (
              <div className="flex flex-row gap-4">
                {/* <Button
                  variant="outline"
                  onClick={handleCropImage}
                  className="mt-4"
                >
                  Crop Image
                </Button>
                <Button
                  variant="outline"
                  onClick={handleFullImageUpload}
                  className="mt-4"
                >
                  Full Image
                </Button> */}

                <Button
                  variant="outline"
                  onClick={() => handleCropAndOCR(onImageUpload)}
                  // onClick={handleCropImage}
                  className="mt-4"
                >
                  {/* Crop & OCR */}
                  Confirm
                </Button>
              </div>
            )}
          </div>
        )
      )}
      {crop && (
        <canvas
          ref={previewCanvasRef}
          className="mt-4"
          style={{
            display: "none",
            border: "1px solid black",
            objectFit: "contain",
            width: 150,
            height: 150,
          }}
        />
      )}
    </>
  );
};
export default ImageCropper;
