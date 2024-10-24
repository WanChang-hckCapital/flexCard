"use client";

import { Download, Link, QrCode, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
  saveLineUserDetails,
  sendFlexMessageLiff,
  sendFlexMessageThruOA,
} from "@/lib/actions/user.actions";
import liff from "@line/liff";
import { createPortal } from "react-dom";

interface ShareDialogProps {
  url: string;
  userImageUrl: string;
  lineComponents?: string;
  userId?: string;
  onClose: () => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  url,
  userImageUrl,
  lineComponents,
  onClose,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConfirmDownload = () => {
    setShowConfirmDialog(true);
  };

  const handleCancelDownload = () => {
    setShowConfirmDialog(false);
  };

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    handleDownloadQRCode();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    toast.info("URL copied to clipboard");
    onClose();
  };

  // const handleShareLine = async () => {
  //     const userId = "U29e8cc655a89181aef3ef8bdc5def5e7"; // need to fetch userID from LINE API
  //     const result = await sendFlexMessageThruOA({ userId: userId, flexContent: lineComponents || '' });
  //     if (result.success === true) {
  //         toast.info(result.message);
  //     } else {
  //         toast.error(result.message);
  //     }
  //     onClose();
  // };

  // const handleShareLine = async () => {
  //     if (typeof window !== 'undefined') {
  //         try {
  //             const result = await sendFlexMessageLiff(lineComponents || '');
  //             if (result.success === true) {
  //                 toast.info(result.message);
  //             } else {
  //                 toast.error(result.message);
  //             }
  //         } catch (error: any) {
  //             toast.error("Error sharing on Line: " + error.message);
  //         }
  //         onClose();
  //     } else {
  //         toast.error("Failed to share card to LINE, Please try again later.");
  //     }
  // };

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Error decoding token:", err);
      return {};
    }
  };

  const handleShareLine = async () => {
    try {
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID! });

      if (liff.isLoggedIn()) {
        const profile = await liff.getProfile();
        const userId = profile.userId;
        const displayName = profile.displayName;
        const pictureUrl = profile.pictureUrl;

        const idToken = liff.getIDToken();

        let email = "";
        if (idToken) {
            const userInfo = parseJwt(idToken);
            email = userInfo.email;
        }

        console.log("User ID:", userId);
        console.log("Display Name:", displayName);
        console.log("Profile Picture URL:", pictureUrl);
        console.log("Email:", email);

        await saveLineUserDetails(userId, displayName, pictureUrl, email);

        const result = await liff.shareTargetPicker([
          {
            type: "flex",
            altText: "This is a Flex Message",
            contents: JSON.parse(lineComponents || ""),
          },
        ]);

        if (result) {
          toast.info(
            "Card has been shared successfully, Please check your LINE."
          );
        } else {
          const [majorVer, minorVer, patchVer] = (
            liff.getLineVersion() || ""
          ).split(".");

          if (minorVer === undefined) {
            toast.error("ShareTargetPicker was canceled in external browser");
            return;
          }

          if (
            parseInt(majorVer) >= 10 &&
            parseInt(minorVer) >= 10 &&
            parseInt(patchVer) > 0
          ) {
            toast.info("ShareTargetPicker was canceled in LINE app");
          }
        }
      } else {
        liff.login();
      }
    } catch (error: any) {
      toast.error("Failed to share card to LINE, Please try again later.");
    }
    onClose();
  };

  const handleDownloadQRCode = () => {
    const qrCodeCanvas = document.getElementById("qrCode") as HTMLCanvasElement;
    if (qrCodeCanvas) {
      const qrCodeURL = qrCodeCanvas.toDataURL();
      const a = document.createElement("a");
      a.href = qrCodeURL;
      a.download = "qrcode.png";
      a.click();
      onClose();
      toast.info("QR Code download successfully.");
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-slate-900 p-5 rounded-lg w-[300px] h-[280px]">
        <Button
          className="float-right p-1"
          onClick={onClose}
          size={"sm"}
          variant={"ghost"}
        >
          <X />
        </Button>
        <div>
          <h3 className="text-lg font-bold my-8 pl-[10px] text-center">
            Share
          </h3>
          <p className="text-center mb-8">
            It&apos;s nice to a share a good component to your friends!
          </p>
          <div className="mb-2 flex flex-row justify-around">
            <button onClick={handleCopyUrl} className="mb-2">
              <Link size={32} />
            </button>
            <button onClick={handleShareLine} className="mb-2">
              <Image src="/line-logo.png" alt="Line" width={32} height={32} />
            </button>
            <div>
              <div className="hidden">
                <QRCode
                  id="qrCode"
                  value={url}
                  size={256}
                  logoImage={userImageUrl}
                  logoWidth={80}
                  logoHeight={80}
                  logoOpacity={1}
                  eyeRadius={15}
                  style={{ borderRadius: "20px" }}
                  qrStyle="dots"
                  removeQrCodeBehindLogo={true}
                  ecLevel="H"
                />
              </div>
              <button onClick={handleConfirmDownload} className="mb-2">
                <QrCode size={32} />
              </button>
            </div>
          </div>
        </div>
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-slate-800 px-3 pb-3 pt-2 rounded-lg w-[350px] h-[350px]">
              <div className="flex justify-end flex-row h-[30px]">
                <Button
                  className="p-1"
                  onClick={handleCancelDownload}
                  size={"sm"}
                  variant={"ghost"}
                >
                  <X />
                </Button>
              </div>
              <div>
                <div className="mb-3 flex flex-row justify-around">
                  <QRCode
                    id="qrCode"
                    value={url}
                    size={230}
                    logoImage={userImageUrl}
                    logoWidth={80}
                    logoHeight={80}
                    logoOpacity={1}
                    eyeRadius={15}
                    style={{ borderRadius: "20px" }}
                    qrStyle="dots"
                    removeQrCodeBehindLogo={true}
                    ecLevel="H"
                  />
                </div>
                <div className="flex justify-around">
                  <Button onClick={handleConfirm} size={"sm"} variant={"sky"}>
                    <Download className="mr-2" width={24} height={24} />
                    Download to device
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.getElementById("modal-root")!
  );
};

export default ShareDialog;
