import { Loader } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center mb-3">
      <Loader className="animate-spin w-6 h-6 text-gray-500" />
    </div>
  );
}
