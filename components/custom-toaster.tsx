"use client"

import React from "react";
import { toast } from "sonner";

interface CustomToasterProps {
    type: "error" | "success";
    message: string;
}

const CustomToaster: React.FC<CustomToasterProps> = ({ type, message }) => {
    if (type === "error") {
        toast.error(message);
    } else if (type === "success") {
        toast.success(message);
    }

    return null;
};

export default CustomToaster;
