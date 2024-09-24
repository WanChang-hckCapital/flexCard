import React from "react";
import Image from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative">
        <Image
          src={imageSrc}
          alt="Full View"
          width={300}
          height={300}
          className="max-h-[90vh] max-w-[90vw]"
        />
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 text-white rounded-full"
        >
          ✖
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
