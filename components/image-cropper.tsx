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
import NextImage from "next/image";

const ASPECT_RATIO = 1;
const MIN_DIMENSION = 150;

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
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imgSrc, setImgSrcLocal] = useState("");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [error, setError] = useState("");
  const [originalImageWidth, setOriginalImageWidth] = useState<number>(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);

  const [showChoosePhotoButton, setShowChoosePhotoButton] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoChoice = () => {
    setShowChoosePhotoButton(!showChoosePhotoButton);
  };

  const handleButtonClick = () => {
    console.log("handle button 1");
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log("handle button 2");
    }
  };

  //   const onSelectFile = async (e: any) => {
  //     const file = e.target.files?.[0];
  //     if (!file) return;

  //     setOriginalFile(file);

  //     const reader = new FileReader();
  //     reader.addEventListener("load", async () => {
  //       const imageElement = new Image();
  //       const imageUrl = reader.result?.toString() || "";
  //       imageElement.src = imageUrl;

  //       imageElement.addEventListener("load", (e) => {
  //         if (error) setError("");
  //         const { naturalWidth, naturalHeight }: any = e.currentTarget;
  //         if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
  //           setError("Image must be at least 150 x 150 pixels.");
  //           return setImgSrcLocal("");
  //         }
  //         setOriginalImageWidth(naturalWidth);
  //       });
  //       setImgSrcLocal(imageUrl);
  //       setImageSrc(imageUrl);
  //     });
  //     reader.readAsDataURL(file);
  //   };

  //   const onImageLoad = (e: any) => {
  //     const { width, height } = e.currentTarget;
  //     const cropWidthInPercent = (MIN_DIMENSION / width) * 100;

  //     const crop = makeAspectCrop(
  //       {
  //         unit: "%",
  //         width: cropWidthInPercent,
  //       },
  //       ASPECT_RATIO,
  //       width,
  //       height
  //     );
  //     const centeredCrop: any = centerCrop(crop, width, height);
  //     setCrop(centeredCrop);
  //   };

  //   const onSelectFile = async (e: any) => {
  //     const file = e.target.files?.[0];
  //     if (!file) return;

  //     setOriginalFile(file);
  //     setLoading(true);

  //     const reader = new FileReader();
  //     reader.addEventListener("load", async () => {
  //       const imageElement = new Image();
  //       const imageUrl = reader.result?.toString() || "";
  //       imageElement.src = imageUrl;

  //       imageElement.addEventListener("load", async (e) => {
  //         try {
  //           if (error) setError("");
  //           const { naturalWidth, naturalHeight }: any = e.currentTarget;
  //           if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
  //             setError("Image must be at least 150 x 150 pixels.");
  //             setLoading(false);
  //             return setImgSrcLocal("");
  //           }
  //           setOriginalImageWidth(naturalWidth);
  //           setOriginalImageHeight(naturalHeight);

  //           console.log("naturalWidth" + naturalWidth);
  //           console.log("naturalHeight" + naturalHeight);

  //           // Call handleCropEdgeImg to get crop hints from Vision API
  //           const cropResult = await handleCropEdgeImg(file);

  //           let newCrop;
  //           if (
  //             cropResult.objectAnnotations &&
  //             cropResult.objectAnnotations.length > 0
  //           ) {
  //             const boundingPoly = cropResult.objectAnnotations[0].boundingPoly;
  //             if (boundingPoly) {
  //               const vertices = boundingPoly.normalizedVertices;
  //               const xMin = Math.min(...vertices.map((v) => v.x)) * naturalWidth;
  //               const xMax = Math.max(...vertices.map((v) => v.x)) * naturalWidth;
  //               const yMin =
  //                 Math.min(...vertices.map((v) => v.y)) * naturalHeight;
  //               const yMax =
  //                 Math.max(...vertices.map((v) => v.y)) * naturalHeight;

  //               const displayedWidth = imgRef.current?.width || naturalWidth;
  //               const displayedHeight = imgRef.current?.height || naturalHeight;
  //               const scaleX = displayedWidth / naturalWidth;
  //               const scaleY = displayedHeight / naturalHeight;

  //               let width = (xMax - xMin) * scaleX;
  //               let height = width / ASPECT_RATIO;

  //               if (height > (yMax - yMin) * scaleY) {
  //                 height = (yMax - yMin) * scaleY;
  //                 width = height * ASPECT_RATIO;
  //               }

  //               const centeredX =
  //                 xMin * scaleX + ((xMax - xMin) * scaleX - width) / 2;
  //               const centeredY =
  //                 yMin * scaleY + ((yMax - yMin) * scaleY - height) / 2;

  //               setCrop({
  //                 unit: "px",
  //                 x: centeredX,
  //                 y: centeredY,
  //                 width: (xMax - xMin) * scaleX * ASPECT_RATIO,
  //                 height: (yMax - yMin) * scaleY * ASPECT_RATIO,
  //               });
  //             }
  //           } else {
  //             setCrop({
  //               unit: "px",
  //               x: 0,
  //               y: 0,
  //               width: naturalWidth * ASPECT_RATIO,
  //               height: naturalHeight * ASPECT_RATIO,
  //             });
  //           }

  //           setImgSrcLocal(imageUrl);
  //           setImageSrc(imageUrl);
  //         } catch (err) {
  //           console.error("Error handling image load:", err);
  //           setError("Failed to process image.");
  //         } finally {
  //           setLoading(false);
  //         }
  //       });
  //     });
  //     reader.readAsDataURL(file);
  //   };
  const onSelectFile = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalFile(file);
    setLoading(true);

    const reader = new FileReader();
    reader.addEventListener("load", async () => {
      const imageElement = new Image();
      const imageUrl = reader.result?.toString() || "";
      imageElement.src = imageUrl;

      imageElement.addEventListener("load", async (e) => {
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

          console.log("naturalWidth" + naturalWidth);
          console.log("naturalHeight" + naturalHeight);

          // Call handleCropEdgeImg to get crop hints from Vision API
          const cropResult = await handleCropEdgeImg(file);

          let newCrop;
          if (
            cropResult.objectAnnotations &&
            cropResult.objectAnnotations.length > 0
          ) {
            const boundingPoly = cropResult.objectAnnotations[0].boundingPoly;
            if (boundingPoly) {
              const vertices = boundingPoly.normalizedVertices;
              const xMin = Math.min(...vertices.map((v) => v.x)) * naturalWidth;
              const xMax = Math.max(...vertices.map((v) => v.x)) * naturalWidth;
              const yMin =
                Math.min(...vertices.map((v) => v.y)) * naturalHeight;
              const yMax =
                Math.max(...vertices.map((v) => v.y)) * naturalHeight;

              const displayedWidth = imgRef.current?.width || naturalWidth;
              const displayedHeight = imgRef.current?.height || naturalHeight;
              const scaleX = displayedWidth / naturalWidth;
              const scaleY = displayedHeight / naturalHeight;

              let width = (xMax - xMin) * scaleX;
              let height = width / ASPECT_RATIO;

              if (height > (yMax - yMin) * scaleY) {
                height = (yMax - yMin) * scaleY;
                width = height * ASPECT_RATIO;
              }

              const centeredX =
                xMin * scaleX + ((xMax - xMin) * scaleX - width) / 2;
              const centeredY =
                yMin * scaleY + ((yMax - yMin) * scaleY - height) / 2;

              setCrop({
                unit: "px",
                x: centeredX,
                y: centeredY,
                width: (xMax - xMin) * scaleX * ASPECT_RATIO,
                height: (yMax - yMin) * scaleY * ASPECT_RATIO,
              });
            }
          } else {
            setCrop({
              unit: "px",
              x: 0,
              y: 0,
              width: naturalWidth * ASPECT_RATIO,
              height: naturalHeight * ASPECT_RATIO,
            });
          }

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

  const handleCropImage = async () => {
    if (imgRef.current && previewCanvasRef.current && crop) {
      setCanvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height)
      );
      previewCanvasRef.current.toBlob(async (blob) => {
        if (blob) {
          const croppedFile = new File([blob], "cropped_image.png", {
            type: "image/png",
          });

          const formData = new FormData();
          formData.append("file", croppedFile);

          const response = await fetch("/api/uploadImage", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (response.ok) {
            const uploadedImageUrl = `/api/uploadImage/${data.fileId}`;
            const uploadImageUrlWithHttp = `${process.env.NEXT_PUBLIC_BASE_URL}${uploadedImageUrl}`;
            updateImage(uploadImageUrlWithHttp);
            closeModal();
          } else {
            setError(`Upload failed: ${data.message}`);
          }
        }
      }, "image/png");
    }
  };

  const handleFullImageUpload = async () => {
    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploadImage", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const uploadedImageUrl = `/api/uploadImage/${data.fileId}`;
        const uploadImageUrlWithHttp = `${process.env.NEXT_PUBLIC_BASE_URL}${uploadedImageUrl}`;
        updateImage(uploadImageUrlWithHttp);
        closeModal();
      } else {
        setError(`Upload failed: ${data.message}`);
      }
    }
  };

  //   const handleCropAndOCR = async (onImageUpload: (url: string) => void) => {
  //     if (imgRef.current && previewCanvasRef.current && crop) {
  //       setLoading(true);
  //       setCanvasPreview(
  //         imgRef.current,
  //         previewCanvasRef.current,
  //         convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height)
  //       );

  //       console.log("orginal file..." + originalFile);
  //       previewCanvasRef.current.toBlob(async (blob) => {
  //         if (blob && originalFile) {
  //           const croppedFile = new File([blob], "cropped_image.png", {
  //             type: "image/png",
  //           });

  //           const formData = new FormData();
  //           formData.append("file", croppedFile);

  //           const uploadResponse = await fetch("/api/uploadImage", {
  //             method: "POST",
  //             body: formData,
  //           });

  //           const uploadData = await uploadResponse.json();

  //           console.log("uploaded data..." + uploadData);

  //           if (uploadResponse.ok) {
  //             const uploadedImageUrl = `/api/uploadImage/${uploadData.fileId}`;
  //             const uploadImageUrlWithHttp = `${process.env.NEXT_PUBLIC_BASE_URL}${uploadedImageUrl}`;
  //             updateImage(uploadImageUrlWithHttp);
  //             onImageUpload(uploadImageUrlWithHttp);

  //             const ocrFormData = new FormData();
  //             ocrFormData.append("file", originalFile);

  //             const ocrResponse = await fetch("/api/ocr", {
  //               method: "POST",
  //               body: ocrFormData,
  //             });

  //             const ocrData = await ocrResponse.json();

  //             if (ocrResponse.ok) {
  //               console.log("OCR Data: ", ocrData);
  //               handleOCRText(
  //                 ocrData.ocrData,
  //                 originalImageWidth,
  //                 uploadImageUrlWithHttp
  //               );
  //             } else {
  //               setError(`OCR failed: ${ocrData.message}`);
  //             }

  //             closeModal();
  //           } else {
  //             setError(`Upload failed: ${uploadData.message}`);
  //           }
  //         }
  //         setLoading(false);
  //       }, "image/png");
  //     }
  //   };

  const handleCropAndOCR = async (onImageUpload: (url: string) => void) => {
    if (loading) return;

    if (imgRef.current && previewCanvasRef.current && crop) {
      setLoading(true);
      setCanvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height)
      );

      previewCanvasRef.current.toBlob(async (blob) => {
        if (blob) {
          const croppedFile = new File([blob], "cropped_image.png", {
            type: "image/png",
          });

          const { width, height } = await getImageDimensions(croppedFile);
          console.log(`Cropped image dimensions: ${width} x ${height}`);

          const formData = new FormData();
          formData.append("file", croppedFile);

          const uploadResponse = await fetch("/api/uploadImage", {
            method: "POST",
            body: formData,
          });

          const uploadData = await uploadResponse.json();

          if (uploadResponse.ok) {
            const uploadedImageUrl = `/api/uploadImage/${uploadData.fileId}`;
            const uploadImageUrlWithHttp = `${process.env.NEXT_PUBLIC_BASE_URL}${uploadedImageUrl}`;
            updateImage(uploadImageUrlWithHttp);
            onImageUpload(uploadImageUrlWithHttp);

            const ocrFormData = new FormData();
            ocrFormData.append("file", croppedFile); // Use the cropped file for OCR

            const ocrResponse = await fetch("/api/ocr", {
              method: "POST",
              body: ocrFormData,
            });

            const ocrData = await ocrResponse.json();

            if (ocrResponse.ok) {
              handleOCRText(
                ocrData.ocrData,
                originalImageWidth,
                uploadImageUrlWithHttp
              );
            } else {
              setError(`OCR failed: ${ocrData.message}`);
            }

            const googleApiLabels = await handleImageAnalyze(
              croppedFile,
              originalImageWidth
            );
            console.log("Google API return:", googleApiLabels);

            const chatgptRes = await handleChatGpt(croppedFile);

            closeModal();
          } else {
            setError(`Upload failed: ${uploadData.message}`);
          }
        }
        setLoading(false);
      }, "image/png");
    }
  };

  const getImageDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const image = new Image();
        image.onload = () => {
          resolve({ width: image.width, height: image.height });
        };
        image.onerror = (error) => {
          reject(error);
        };
        if (event.target && typeof event.target.result === "string") {
          image.src = event.target.result;
        } else {
          reject(new Error("Failed to read file"));
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

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

  return (
    <>
      {!showChoosePhotoButton && (
        <div className="flex gap-4 flex-row justify-center">
          <Button
            variant="default"
            onClick={handlePhotoChoice}
            className="cursor-pointer mb-[15px]"
          >
            <span>Choose Photo</span>
          </Button>
        </div>
      )}
      {showChoosePhotoButton && (
        <div className="flex gap-4 flex-row justify-center">
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
          <ClipLoader size={50} color={"#123abc"} loading={loading} />
          <p className="text-blue-400 text-xs">
            Just a moment, processing OCR...
          </p>
        </div>
      ) : (
        imgSrc && (
          <div className="flex flex-col items-center">
            <ReactCrop
              crop={crop}
              onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
              keepSelection
              minWidth={MIN_DIMENSION}
            >
              <NextImage
                ref={imgRef}
                src={imgSrc}
                alt="Upload"
                style={{ maxHeight: "70vh" }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
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
                className="mt-4"
              >
                Crop & OCR
              </Button>
            </div>
          </div>
        )
      )}
      {/* {loading && <p>Processing...</p>}
            {extractedInfo && (
                <div className='p-2 mt-4 rounded-md shadow w-full account-form_input'>
                    <h3>OCR Result:</h3>
                    <p><strong>Name:</strong> {extractedInfo.name}</p>
                    <p><strong>Job Title:</strong> {extractedInfo.jobTitle}</p>
                    <p><strong>Phone:</strong> {extractedInfo.phone}</p>
                    <p><strong>Email:</strong> {extractedInfo.email}</p>
                    <p><strong>Address:</strong> {extractedInfo.address}</p>
                    <p><strong>Website:</strong> {extractedInfo.website}</p>
                </div>
            )} */}
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
