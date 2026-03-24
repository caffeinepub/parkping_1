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
  const logoUrl = `${window.location.origin}/assets/uploads/image-019d2097-cfbb-76c4-959f-eb1601816d37-1.png`;

  const printWindow = window.open("", "_blank", "width=600,height=700");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>ParkPing QR Code — ${vehicleName}</title>
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
          .logo-img {
            width: 160px;
            height: auto;
            margin: 0 auto 20px;
            display: block;
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
            font-weight: 700;
            color: #0d9488;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <img src="${logoUrl}" alt="ParkPing" class="logo-img" />
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
