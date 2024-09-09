import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="flex flex-col space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center cursor-pointer" onClick={() => onStepClick(index)}>
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${
              index <= currentStep ? 'bg-purple-800' : 'bg-gray-300'
            }`}
          >
            {index + 1}
          </div>
          <span
            className={`ml-4 ${
              index === currentStep ? 'font-bold' : 'text-gray-500'
            }`}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Stepper;
