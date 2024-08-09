import { useRef, useState } from "react";
import { Button } from "../ui/button";
import ReactCrop, {
  Crop,
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from "react-image-crop";
import { ClipLoader } from "react-spinners";
// import ImageCropper from "../image-cropper";

const ASPECT_RATIO = 3 / 4;
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
    // textAnnotations: any[];
    logoAnnotations: any[];
    //fullTextAnnotation: any;
  }>;
  handleCropEdgeImg: (image: File) => Promise<CropEdgeImageResult>;
  handleChatGpt: (image: File) => Promise<any>;
}

const OCRForm: React.FC<ImageCropperProps> = ({
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
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop | undefined>(undefined);

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [originalImageWidth, setOriginalImageWidth] = useState<number>(0);

  const [gptData, setGptData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onSelectFile = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const imageUrl = reader.result?.toString() || "";
      setImgSrc(imageUrl);

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/ocr", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setResult(data.text);
          setGptData(data);
        } else {
          setError(data.message);
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error:", error);
        setError("An error occurred while processing the image.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: any) => {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (MIN_DIMENSION / width) * 100;

    // Ensure crop is defined before calling centerCrop
    if (crop) {
      const centeredCrop: any = centerCrop(crop, width, height);
      setCrop(centeredCrop);
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

  const setCanvasPreview = (image: any, canvas: any, crop: any) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No 2d context");
    }

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

  const handleCropAndOCR = async (onImageUpload: (url: string) => void) => {
    console.log("1");
    // if (loading) return;

    if (imgRef.current && previewCanvasRef.current) {
      console.log("2");
      setLoading(true);
      setCanvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height)
      );

      previewCanvasRef.current.toBlob(async (blob) => {
        console.log("3");
        if (blob) {
          console.log("4");
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
            console.log("5");
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

            // const base64Image = await fileToBase64(file);

            // const response = await fetch("/api/gptapi", {
            //     method: "POST",
            //     headers: {
            //       "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify({ base64Image }),
            //   });

            // const data = await response.json();

            // console.log("gptres" + data)

            const googleApiLabels = await handleImageAnalyze(
              croppedFile,
              originalImageWidth
            );
            console.log("Google API return:", googleApiLabels);

            const chatgptRes = await handleChatGpt(croppedFile);

            console.log("chatgptRes" + chatgptRes);

            closeModal();
          } else {
            setError(`Upload failed: ${uploadData.message}`);
          }
        }
        setLoading(false);
      }, "image/png");
    }

    console.log("end");
  };

  return (
    <div>
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
      {imgSrc && (
        <div>
          <div>
            <img
              src={imgSrc}
              alt="Selected"
              ref={imgRef}
              style={{ maxWidth: "100%", maxHeight: "300px" }}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => handleCropAndOCR(onImageUpload)}
            className="mt-4"
          >
            Crop & OCR
          </Button>
        </div>
      )}
      {loading && <p>Processing...</p>}
      {result && (
        <div className="p-2 mt-4 rounded-md shadow w-full account-form_input">
          <h3>OCR Result:</h3>
          <p>{result}</p>
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <div className="flex flex-col items-center mt-10">
          <ClipLoader size={50} color={"#123abc"} loading={loading} />
          <p className="text-blue-400 text-xs mt-8">
            Just a moment, processing image...
          </p>
        </div>
      ) : (
        imgSrc && (
          <div className="flex flex-col items-center">
            {/* <ReactCrop
                            crop={crop}
                            onChange={(newCrop) => setCrop(newCrop)}
                            keepSelection>
                            <img
                                ref={imgRef}
                                src={imgSrc}
                                alt="Upload"
                                style={{ maxWidth: "100%" }}
                                onLoad={onImageLoad}
                            />
                        </ReactCrop> */}
            <div className="flex flex-row gap-4"></div>
          </div>
        )
      )}

      {/* {gptData && <div>JSON.stringify(gptData)</div>} */}
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
    </div>
  );
};

export default OCRForm;
