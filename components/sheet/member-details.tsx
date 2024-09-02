"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
    SheetFooter,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { fetchMemberProfileDetails, verifyOrganizationStatus } from "@/lib/actions/admin.actions";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

interface MemberDetailsSheetProps {
    authActiveProfileId: string;
    selectedProfileId: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const formatDateString = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const MemberDetailsSheet: React.FC<MemberDetailsSheetProps> = ({ authActiveProfileId, selectedProfileId, open, setOpen }) => {
    const [memberProfileDetails, setMemberProfileDetails] = useState<any>(null);

    useEffect(() => {
        const getMemberDetails = async () => {
            const response = await fetchMemberProfileDetails(selectedProfileId);
            if (response.success) {
                setMemberProfileDetails(response.data);
            }
        };

        if (selectedProfileId && open) {
            getMemberDetails();
        }
    }, [selectedProfileId, open]);

    const handleVerifyClick = async () => {
        if (memberProfileDetails && memberProfileDetails.organization) {
            const response = await verifyOrganizationStatus(authActiveProfileId, memberProfileDetails.organization._id);
            if (response.success) {
                toast.success("Organization verified successfully!");
                setMemberProfileDetails({
                    ...memberProfileDetails,
                    organization: {
                        ...memberProfileDetails.organization,
                        verify: response.data,
                    }
                });
            } else {
                toast.error("Failed to verify organization. " + response.message);
            }
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="overflow-auto">
                <SheetHeader>
                    <SheetTitle>Member Details</SheetTitle>
                </SheetHeader>
                {memberProfileDetails ? (
                    <div>
                        <Card className="p-4 my-4">
                            <div className="flex justify-between mb-1">
                                <p className="font-bold text-gray-500">User Type:</p>
                                <p className="ml-2">{memberProfileDetails.usertype}</p>
                            </div>
                            <div className="flex justify-between mb-1">
                                <p className="font-bold text-gray-500">IP Address:</p>
                                <p className="ml-2">{memberProfileDetails.ip_address}</p>
                            </div>
                            <div className="flex justify-between mb-1">
                                <p className="font-bold text-gray-500">Country:</p>
                                <p className="ml-2">{memberProfileDetails.country}</p>
                            </div>
                        </Card>
                        {memberProfileDetails.organization && (
                            <div>
                                <h2 className="font-bold text-lg my-4">Organization Information</h2>
                                <Card className="p-4 my-4">
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Business Name:</p>
                                        <p className="ml-2">{memberProfileDetails.organization.businessName}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Registration Number:</p>
                                        <p className="ml-2">{memberProfileDetails.organization.businessRegistrationNumber}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Business Location:</p>
                                        <p className="ml-2">{memberProfileDetails.organization.businessLocation}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Business Type:</p>
                                        <p className="ml-2">{memberProfileDetails.organization.businessType}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Legal Business Name:</p>
                                        <p className="ml-2">{memberProfileDetails.organization.legalBusinessName}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Business Address:</p>
                                        <p className="ml-2">{memberProfileDetails.organization.businessAddress}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Business Phone:</p>
                                        <p className="ml-2">{memberProfileDetails.organization.businessPhone}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Industry:</p>
                                        <p className="ml-2">{memberProfileDetails.organization.industry}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Business Website:</p>
                                        <p className="ml-2">{memberProfileDetails.organization.businessWebsite}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Product Description:</p>
                                        <p className="ml-2">{memberProfileDetails.organization.businessProductDescription}</p>
                                    </div>
                                </Card>
                                <h2 className="font-bold text-lg my-4">Organization Bank Information</h2>
                                <Card className="p-4 my-4">
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Account Holder:</p>
                                        <p className="ml-2">{memberProfileDetails.organization.bankAccountHolder}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Name:</p>
                                        <p className="ml-2">{memberProfileDetails.organization.bankName}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Account Number:</p>
                                        <p className="ml-2">{memberProfileDetails.organization.bankAccountNumber}</p>
                                    </div>
                                </Card>
                                <h2 className="font-bold text-lg my-4">Organization Verify Status</h2>
                                <Card className="p-4 my-4">
                                    {memberProfileDetails.organization.verify && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-bold text-gray-500">Verified:</p>
                                                {memberProfileDetails.organization.verify.verified ? (
                                                    <Badge variant="bgGreen" className="ml-2 text-[12px]">VERIFIED</Badge>
                                                ) : (
                                                    <Badge variant="bgRed" className="ml-2 text-[12px]">PENDING</Badge>
                                                )}
                                            </div>
                                            {memberProfileDetails.organization.verify.verifiedAt && (
                                                <div className="flex justify-between mb-1">
                                                    <p className="font-bold text-gray-500">Verified At:</p>
                                                    <p className="ml-2">{formatDateString(memberProfileDetails.organization.verify.verifiedAt)}</p>
                                                </div>
                                            )}
                                            {memberProfileDetails.organization.verify.verifiedBy && (
                                                <div className="flex justify-between mb-1">
                                                    <p className="font-bold text-gray-500">Verified By:</p>
                                                    <p className="ml-2">{memberProfileDetails.organization.verify.verifiedBy}</p>
                                                </div>
                                            )}
                                            {!memberProfileDetails.organization.verify.verified && (
                                                <Button
                                                    className="w-full mt-2"
                                                    variant="outline"
                                                    onClick={handleVerifyClick}
                                                >
                                                    Verify Organization
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )}
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
                <SheetFooter>
                    <SheetClose asChild>
                        <Button
                            variant="purple"
                            className="w-full"
                            type="button"
                            onClick={() => setOpen(false)}
                        >
                            Close
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default MemberDetailsSheet;
