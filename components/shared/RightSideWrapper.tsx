"use client";

import { useState } from "react";
import RightSidebar from "@/components/shared/RightSidebar";
import { Button } from "../ui/button";

const RightSidebarWrapper = () => {
  //   const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  //   const toggleSidebar = () => {
  //     setIsSidebarVisible(!isSidebarVisible);
  //     console.log("Sidebar visibility toggled:", !isSidebarVisible);
  //   };

  return (
    <div className="flex w-full">
      <section className="main-container flex-grow p-4">
        <div id="modal-root"></div>
        {/* <Button
          //   onClick={toggleSidebar}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Toggle Sidebar
        </Button> */}
      </section>
      {isSidebarVisible && <RightSidebar />}
    </div>
  );
};

export default RightSidebarWrapper;
