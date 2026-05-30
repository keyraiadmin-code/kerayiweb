"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { formatCurrency, formatDate } from "@/lib/utils";

interface QRReceiptProps {
  receiptNumber: string;
  tenantName: string;
  amount: number;
  paidDate: string;
  method: string;
  referenceNumber?: string;
  propertyName?: string;
  unitNumber?: string;
  verifyUrl?: string;
}

export function QRReceipt({
  receiptNumber,
  tenantName,
  amount,
  paidDate,
  method,
  referenceNumber,
  propertyName,
  unitNumber,
  verifyUrl,
}: QRReceiptProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const url =
        verifyUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/verify/${receiptNumber}`;
      QRCode.toCanvas(canvasRef.current, url, {
        width: 120,
        margin: 1,
        color: {
          dark: "#0e8a5b",
          light: "#ffffff",
        },
      });
    }
  }, [receiptNumber, verifyUrl]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-sm shadow-md print:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-brand">Keyrai</h2>
          <p className="text-xs text-gray-500">Payment Receipt</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Receipt #</p>
          <p className="text-sm font-mono font-bold text-gray-800">
            {receiptNumber}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-300 my-3" />

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Tenant</span>
          <span className="font-medium">{tenantName}</span>
        </div>
        {propertyName && (
          <div className="flex justify-between">
            <span className="text-gray-500">Property</span>
            <span className="font-medium">{propertyName}</span>
          </div>
        )}
        {unitNumber && (
          <div className="flex justify-between">
            <span className="text-gray-500">Unit</span>
            <span className="font-medium">{unitNumber}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Date</span>
          <span className="font-medium">{formatDate(paidDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Method</span>
          <span className="font-medium capitalize">{method}</span>
        </div>
        {referenceNumber && (
          <div className="flex justify-between">
            <span className="text-gray-500">Reference</span>
            <span className="font-mono text-xs">{referenceNumber}</span>
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="bg-brand/10 rounded-lg px-4 py-3 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-brand">Amount Paid</span>
          <span className="text-xl font-bold text-brand">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-300 my-3" />

      {/* QR Code */}
      <div className="flex items-center gap-4">
        <canvas ref={canvasRef} className="rounded" />
        <div>
          <p className="text-xs font-medium text-gray-700">Scan to verify</p>
          <p className="text-[10px] text-gray-400 mt-1">
            This receipt is digitally signed and verifiable at keyrai.com
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-center text-gray-400 mt-4">
        Thank you for your payment • keyrai.com
      </p>
    </div>
  );
}
