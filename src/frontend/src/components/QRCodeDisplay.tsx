interface QRCodeDisplayProps {
  url: string;
  size?: number;
  label?: string;
}

export default function QRCodeDisplay({
  url,
  size = 200,
  label,
}: QRCodeDisplayProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=0E2A3B&margin=10`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white rounded-xl p-3 shadow-card border border-border">
        <img
          src={qrUrl}
          alt={`QR code for ${label ?? url}`}
          width={size}
          height={size}
          className="rounded-lg"
        />
      </div>
      {label && (
        <p className="text-xs text-muted-foreground text-center max-w-[200px] break-all">
          {label}
        </p>
      )}
    </div>
  );
}
