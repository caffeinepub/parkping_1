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
import { Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import { useRequestSticker } from "../hooks/useQueries";

interface RequestStickerDialogProps {
  vehicleId: bigint;
  vehicleName: string;
  userProfile?: UserProfile | null;
  trigger?: React.ReactNode;
}

export default function RequestStickerDialog({
  vehicleId,
  vehicleName,
  userProfile,
  trigger,
}: RequestStickerDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: (userProfile as UserProfile | null)?.name ?? "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateProvince: "",
    postcode: "",
    country: "",
  });

  const { mutateAsync: requestSticker, isPending } = useRequestSticker();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValid =
    form.name.trim() &&
    form.addressLine1.trim() &&
    form.city.trim() &&
    form.postcode.trim() &&
    form.country.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      await requestSticker({
        vehicleId,
        name: form.name.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        city: form.city.trim(),
        stateProvince: form.stateProvince.trim(),
        postcode: form.postcode.trim(),
        country: form.country.trim(),
      });
      toast.success(
        "Your weatherproof sticker will be mailed to your address!",
      );
      setOpen(false);
      setForm({
        name: (userProfile as UserProfile | null)?.name ?? "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        stateProvince: "",
        postcode: "",
        country: "",
      });
    } catch {
      toast.error("Failed to submit sticker request. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} data-ocid="sticker.dialog">
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary/5 gap-1.5"
            data-ocid="sticker.open_modal_button"
          >
            <Package className="w-4 h-4" />
            Request Sticker
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg" data-ocid="sticker.modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Request Weatherproof Sticker
          </DialogTitle>
          <DialogDescription>
            We'll mail a weatherproof QR sticker for{" "}
            <span className="font-semibold text-foreground">{vehicleName}</span>{" "}
            to your address.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="sticker-name">Full Name</Label>
            <Input
              id="sticker-name"
              name="name"
              placeholder="Alex Johnson"
              value={form.name}
              onChange={handleChange}
              required
              data-ocid="sticker.input"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sticker-addr1">Address Line 1</Label>
            <Input
              id="sticker-addr1"
              name="addressLine1"
              placeholder="123 Main Street"
              value={form.addressLine1}
              onChange={handleChange}
              required
              data-ocid="sticker.input"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sticker-addr2">
              Address Line 2{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="sticker-addr2"
              name="addressLine2"
              placeholder="Apt 4B"
              value={form.addressLine2}
              onChange={handleChange}
              data-ocid="sticker.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sticker-city">City</Label>
              <Input
                id="sticker-city"
                name="city"
                placeholder="New York"
                value={form.city}
                onChange={handleChange}
                required
                data-ocid="sticker.input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sticker-state">State / Province</Label>
              <Input
                id="sticker-state"
                name="stateProvince"
                placeholder="NY"
                value={form.stateProvince}
                onChange={handleChange}
                data-ocid="sticker.input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sticker-postcode">Postcode / ZIP</Label>
              <Input
                id="sticker-postcode"
                name="postcode"
                placeholder="10001"
                value={form.postcode}
                onChange={handleChange}
                required
                data-ocid="sticker.input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sticker-country">Country</Label>
              <Input
                id="sticker-country"
                name="country"
                placeholder="United States"
                value={form.country}
                onChange={handleChange}
                required
                data-ocid="sticker.input"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              data-ocid="sticker.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isPending}
              className="bg-primary text-white hover:bg-primary/90"
              data-ocid="sticker.submit_button"
            >
              {isPending ? "Submitting…" : "Request Sticker"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
