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
import { fetchMemberDetails, verifyOrganizationStatus } from "@/lib/actions/admin.actions";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

interface MemberDetailsSheetProps {
    authenticatedUserId: string;
    memberId: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const formatDateString = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const MemberDetailsSheet: React.FC<MemberDetailsSheetProps> = ({ authenticatedUserId, memberId, open, setOpen }) => {
    const [memberDetails, setMemberDetails] = useState<any>(null);

    useEffect(() => {
        const getMemberDetails = async () => {
            const response = await fetchMemberDetails(memberId);
            if (response.success) {
                setMemberDetails(response.data);
            }
        };

        if (memberId && open) {
            getMemberDetails();
        }
    }, [memberId, open]);

    const handleVerifyClick = async () => {
        if (memberDetails && memberDetails.organization) {
            const response = await verifyOrganizationStatus(authenticatedUserId, memberDetails.organization._id);
            if (response.success) {
                toast.success("Organization verified successfully!");
                setMemberDetails({
                    ...memberDetails,
                    organization: {
                        ...memberDetails.organization,
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
                {memberDetails ? (
                    <div>
                        <Card className="p-4 my-4">
                            <div className="flex justify-between mb-1">
                                <p className="font-bold text-gray-500">User Type:</p>
                                <p className="ml-2">{memberDetails.usertype}</p>
                            </div>
                            <div className="flex justify-between mb-1">
                                <p className="font-bold text-gray-500">IP Address:</p>
                                <p className="ml-2">{memberDetails.ip_address}</p>
                            </div>
                            <div className="flex justify-between mb-1">
                                <p className="font-bold text-gray-500">Country:</p>
                                <p className="ml-2">{memberDetails.country}</p>
                            </div>
                        </Card>
                        {memberDetails.organization && (
                            <div>
                                <h2 className="font-bold text-lg my-4">Organization Information</h2>
                                <Card className="p-4 my-4">
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Business Name:</p>
                                        <p className="ml-2">{memberDetails.organization.businessName}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Registration Number:</p>
                                        <p className="ml-2">{memberDetails.organization.businessRegistrationNumber}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Business Location:</p>
                                        <p className="ml-2">{memberDetails.organization.businessLocation}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Business Type:</p>
                                        <p className="ml-2">{memberDetails.organization.businessType}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Legal Business Name:</p>
                                        <p className="ml-2">{memberDetails.organization.legalBusinessName}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Business Address:</p>
                                        <p className="ml-2">{memberDetails.organization.businessAddress}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Business Phone:</p>
                                        <p className="ml-2">{memberDetails.organization.businessPhone}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Industry:</p>
                                        <p className="ml-2">{memberDetails.organization.industry}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Business Website:</p>
                                        <p className="ml-2">{memberDetails.organization.businessWebsite}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Product Description:</p>
                                        <p className="ml-2">{memberDetails.organization.businessProductDescription}</p>
                                    </div>
                                </Card>
                                <h2 className="font-bold text-lg my-4">Organization Bank Information</h2>
                                <Card className="p-4 my-4">
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Account Holder:</p>
                                        <p className="ml-2">{memberDetails.organization.bankAccountHolder}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Name:</p>
                                        <p className="ml-2">{memberDetails.organization.bankName}</p>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <p className="font-bold text-gray-500">Account Number:</p>
                                        <p className="ml-2">{memberDetails.organization.bankAccountNumber}</p>
                                    </div>
                                </Card>
                                <h2 className="font-bold text-lg my-4">Organization Verify Status</h2>
                                <Card className="p-4 my-4">
                                    {memberDetails.organization.verify && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-bold text-gray-500">Verified:</p>
                                                {memberDetails.organization.verify.verified ? (
                                                    <Badge variant="bgGreen" className="ml-2 text-[12px]">VERIFIED</Badge>
                                                ) : (
                                                    <Badge variant="bgRed" className="ml-2 text-[12px]">PENDING</Badge>
                                                )}
                                            </div>
                                            {memberDetails.organization.verify.verifiedAt && (
                                                <div className="flex justify-between mb-1">
                                                    <p className="font-bold text-gray-500">Verified At:</p>
                                                    <p className="ml-2">{formatDateString(memberDetails.organization.verify.verifiedAt)}</p>
                                                </div>
                                            )}
                                            {memberDetails.organization.verify.verifiedBy && (
                                                <div className="flex justify-between mb-1">
                                                    <p className="font-bold text-gray-500">Verified By:</p>
                                                    <p className="ml-2">{memberDetails.organization.verify.verifiedBy}</p>
                                                </div>
                                            )}
                                            {!memberDetails.organization.verify.verified && (
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
