'use client';

import React from 'react';
import { HashLoader } from 'react-spinners';

interface LoadingModalProps {
  isOpen: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg flex items-center">
        <HashLoader color="#3498db" loading={isOpen} size={50} />
        <span className="ml-4">Processing your payment...</span>
      </div>
    </div>
  );
};

export default LoadingModal;
