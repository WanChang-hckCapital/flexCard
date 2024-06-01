"use client"

import { Download, Link, QrCode, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { sendFlexMessageThruOA } from '@/lib/actions/user.actions';

interface ShareDialogProps {
    url: string;
    userImageUrl: string;
    lineComponents?: string;
    userId?: string;
    onClose: () => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ url, userImageUrl, lineComponents, onClose }) => {
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

    const handleShareLine = async () => {
        const userId = "U29e8cc655a89181aef3ef8bdc5def5e7"; // need to fetch userID from LINE API
        const result = await sendFlexMessageThruOA({ userId: userId, flexContent: lineComponents || '' });
        if (result.success === true) {
            toast.info(result.message);
        } else {
            toast.error(result.message);
        }
        onClose();
    };

    const handleDownloadQRCode = () => {
        const qrCodeCanvas = document.getElementById('qrCode') as HTMLCanvasElement;
        if (qrCodeCanvas) {
            const qrCodeURL = qrCodeCanvas.toDataURL();
            const a = document.createElement('a');
            a.href = qrCodeURL;
            a.download = "qrcode.png";
            a.click();
            onClose();
            toast.info("QR Code download successfully.");
        }
    };

    return (
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
                    <h3 className="text-lg font-bold my-8 pl-[10px] text-center">Share</h3>
                    <p className="text-center mb-8">It&apos;s nice to a share a good component to your friends!</p>
                    <div className="mb-2 flex flex-row justify-around">
                        <button onClick={handleCopyUrl} className="mb-2">
                            <Link size={32} />
                        </button>
                        <button onClick={handleShareLine} className="mb-2">
                            <Image
                                src="/line-logo.png"
                                alt="Line"
                                width={32}
                                height={32}
                            />
                        </button>
                        <div>
                            <div className='hidden'>
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
                                    <Button
                                        onClick={handleConfirm}
                                        size={"sm"}
                                        variant={"sky"}
                                    >
                                        <Download
                                            className="mr-2"
                                            width={24}
                                            height={24} />
                                        Download to device
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareDialog;
