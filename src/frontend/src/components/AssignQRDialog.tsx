import QRCodeDisplay from "@/components/QRCodeDisplay";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, QrCode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Vehicle, VehicleId } from "../backend.d";
import {
  useAssignPrintableQRCode,
  useGetAssignedQRForVehicle,
} from "../hooks/useQueries";

interface AssignQRDialogProps {
  vehicles: Vehicle[];
  defaultVehicleId?: bigint;
}

function AssignedQRBadge({ vehicleId }: { vehicleId: VehicleId }) {
  const { data: assignedQR } = useGetAssignedQRForVehicle(vehicleId);
  if (!assignedQR) return null;
  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
        Assigned QR Code
      </p>
      <div className="flex items-center gap-3">
        <QRCodeDisplay url={assignedQR.qrData} size={80} />
        <div>
          <span className="font-mono text-xs bg-teal-light text-primary px-2 py-1 rounded-md border border-primary/20">
            {assignedQR.uniqueIdentifier}
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            Scan to contact owner
          </p>
        </div>
      </div>
    </div>
  );
}

export function AssignedQRSection({ vehicleId }: { vehicleId: VehicleId }) {
  return <AssignedQRBadge vehicleId={vehicleId} />;
}

export default function AssignQRDialog({
  vehicles,
  defaultVehicleId,
}: AssignQRDialogProps) {
  const [open, setOpen] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    defaultVehicleId?.toString() ?? "",
  );

  const { mutateAsync, isPending } = useAssignPrintableQRCode();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = identifier.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Please enter a unique identifier.");
      return;
    }
    if (!selectedVehicleId) {
      toast.error("Please select a vehicle.");
      return;
    }
    try {
      await mutateAsync({
        uniqueIdentifier: trimmed,
        vehicleId: BigInt(selectedVehicleId) as VehicleId,
      });
      toast.success("QR code assigned successfully!");
      setOpen(false);
      setIdentifier("");
    } catch {
      toast.error(
        "Failed to assign QR code. Check the identifier and try again.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-primary/40 text-primary hover:bg-teal-light gap-1.5"
          data-ocid="dashboard.open_modal_button"
        >
          <QrCode className="w-3.5 h-3.5" />
          Assign QR
        </Button>
      </DialogTrigger>
      <DialogContent data-ocid="dashboard.dialog">
        <DialogHeader>
          <DialogTitle className="text-navy">
            Assign Printed QR Code
          </DialogTitle>
          <DialogDescription>
            Enter the unique identifier from your printed QR code and select a
            vehicle.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="qr-identifier" className="text-navy font-medium">
              Unique Identifier
            </Label>
            <Input
              id="qr-identifier"
              placeholder="e.g. QR-A7X9K2"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
              className="font-mono"
              data-ocid="dashboard.input"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qr-vehicle" className="text-navy font-medium">
              Vehicle
            </Label>
            <Select
              value={selectedVehicleId}
              onValueChange={setSelectedVehicleId}
            >
              <SelectTrigger id="qr-vehicle" data-ocid="dashboard.select">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id.toString()} value={v.id.toString()}>
                    {v.name}
                    {v.licensePlate ? ` — ${v.licensePlate}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              data-ocid="dashboard.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary text-white hover:bg-primary/90"
              data-ocid="dashboard.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign QR Code"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
