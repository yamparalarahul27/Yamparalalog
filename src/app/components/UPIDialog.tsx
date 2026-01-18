/**
 * components/UPIDialog.tsx
 * A reusable dialog for UPI payments in India.
 * 
 * FEATURES:
 * - Mobile: Direct intent links to GPay, PhonePe, and Paytm.
 * - Desktop: Scannable QR code generated locally using qrcode.react.
 * - Dynamic: Automatically includes the current user's name in the transaction note.
 */

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone, ExternalLink, QrCode } from "lucide-react";

interface UPIDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vpa: string; // e.g. "rahul@upi"
    payeeName: string;
    amount?: string;
    userName: string;
}

const UPIDialog: React.FC<UPIDialogProps> = ({
    open,
    onOpenChange,
    vpa,
    payeeName,
    amount,
    userName,
}) => {
    // Generate the standard UPI URI
    // upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
    const transactionNote = encodeURIComponent(`Support from ${userName}`);
    const upiBase = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(payeeName)}&cu=INR&tn=${transactionNote}`;
    const upiWithAmount = amount ? `${upiBase}&am=${amount}` : upiBase;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const handleIntent = (app?: string) => {
        // Some apps support direct intent prefixes
        let finalUrl = upiWithAmount;
        if (app === "gpay") finalUrl = upiWithAmount.replace("upi://", "tez://");
        if (app === "phonepe") finalUrl = upiWithAmount.replace("upi://", "phonepe://");
        if (app === "paytm") finalUrl = upiWithAmount.replace("upi://", "paytmmp://");

        window.location.href = finalUrl;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-indigo-600" />
                        Support Developer
                    </DialogTitle>
                    <DialogDescription>
                        Scan or click to pay securely via UPI India
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-6 space-y-6">
                    {/* QR Code Section */}
                    <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 shadow-sm">
                        <QRCodeSVG
                            value={upiWithAmount}
                            size={200}
                            level="H"
                            includeMargin={true}
                            imageSettings={{
                                src: "/images/app-logo.png",
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>

                    <div className="text-center">
                        <p className="font-semibold text-gray-900">{payeeName}</p>
                        <p className="text-sm text-gray-500">{vpa}</p>
                    </div>

                    {/* Mobile Quick Actions */}
                    {isMobile && (
                        <div className="grid grid-cols-1 gap-3 w-full">
                            <Button
                                onClick={() => handleIntent()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-12"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Pay via UPI App
                            </Button>
                        </div>
                    )}

                    {!isMobile && (
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-full border border-amber-100">
                            <QrCode className="h-3 w-3" />
                            Scan using PhonePe, Google Pay, or Paytm
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UPIDialog;
