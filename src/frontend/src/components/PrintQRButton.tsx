import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintQRButtonProps {
  vehicleName: string;
  licensePlate?: string;
  vehicleId: string;
  className?: string;
  size?: "sm" | "default";
}

export function printQRCode({
  vehicleName,
  licensePlate,
  vehicleId,
}: {
  vehicleName: string;
  licensePlate?: string;
  vehicleId: string;
}) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`${window.location.origin}/message/${vehicleId}`)}`;
  const logoUrl = `${window.location.origin}/assets/generated/scanlink-logo-transparent.dim_120x120.png`;

  const printWindow = window.open("", "_blank", "width=600,height=700");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>ScanLink QR Code — ${vehicleName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: white;
            padding: 40px;
          }
          .card {
            border: 2px solid #000;
            border-radius: 16px;
            padding: 32px;
            max-width: 320px;
            width: 100%;
            text-align: center;
          }
          .logo-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
          }
          .logo-img {
            width: 80px;
            height: auto;
            display: block;
          }
          .logo-name {
            font-size: 18px;
            font-weight: 800;
            color: #1a2540;
            margin-top: 4px;
            letter-spacing: 0.5px;
          }
          .logo-url {
            font-size: 12px;
            color: #555;
            margin-top: 2px;
            letter-spacing: 0.5px;
          }
          .qr img {
            width: 220px;
            height: 220px;
            border-radius: 8px;
          }
          .vehicle-name {
            font-size: 18px;
            font-weight: 700;
            color: #0a1628;
            margin-top: 16px;
          }
          .license-plate {
            font-size: 13px;
            font-family: monospace;
            color: #555;
            margin-top: 4px;
          }
          .scan-note {
            margin-top: 16px;
            font-size: 15px;
            font-weight: 800;
            color: #0a1628;
            letter-spacing: 1px;
            text-transform: uppercase;
            background-color: #FFE600;
            padding: 6px 14px;
            border-radius: 6px;
            display: inline-block;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo-wrap">
            <img src="${logoUrl}" alt="ScanLink" class="logo-img" />
            <span class="logo-name">ScanLink</span>
            <span class="logo-url">www.scanlink.app</span>
          </div>
          <div class="qr">
            <img src="${qrUrl}" alt="QR Code" />
          </div>
          <div class="vehicle-name">${vehicleName}</div>
          ${licensePlate ? `<div class="license-plate">${licensePlate}</div>` : ""}
          <div class="scan-note">SCAN TO MESSAGE OWNER</div>
        </div>
        <script>
          window.onload = function() { window.print(); };
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export default function PrintQRButton({
  vehicleName,
  licensePlate,
  vehicleId,
  className,
  size = "sm",
}: PrintQRButtonProps) {
  return (
    <Button
      variant="outline"
      size={size}
      className={className}
      onClick={() => printQRCode({ vehicleName, licensePlate, vehicleId })}
      data-ocid="vehicle.print_button"
    >
      <Printer className="w-4 h-4 mr-1.5" />
      Print QR
    </Button>
  );
}
