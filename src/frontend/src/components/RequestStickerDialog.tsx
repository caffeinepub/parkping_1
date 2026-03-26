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
import { AlertCircle, CreditCard, Info, Loader2, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  ShoppingItem,
  UserProfileFull as UserProfile,
} from "../backend.d";
import { useRequestSticker } from "../hooks/useQueries";
import { useCreateCheckoutSession } from "../hooks/useStripe";

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
  const [redirecting, setRedirecting] = useState(false);
  const [form, setForm] = useState({
    name: (userProfile as UserProfile | null)?.name ?? "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateProvince: "",
    postcode: "",
    country: "",
  });

  const { mutateAsync: requestSticker, isPending: submitting } =
    useRequestSticker();
  const { mutateAsync: createCheckoutSession } = useCreateCheckoutSession();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValid =
    form.name.trim() &&
    form.addressLine1.trim() &&
    form.city.trim() &&
    form.postcode.trim() &&
    form.country.trim();

  const isPending = submitting || redirecting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      // First, record the sticker request
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

      // Then redirect to Stripe checkout for payment
      const shoppingItem: ShoppingItem = {
        currency: "usd",
        productName: "ScanLink Official Sticker",
        productDescription: `Weatherproof QR sticker for ${vehicleName} — mailed to your address`,
        priceInCents: BigInt(1999),
        quantity: BigInt(1),
      };

      setRedirecting(true);
      const session = await createCheckoutSession([shoppingItem]);
      if (!session?.url) throw new Error("Stripe session missing url");
      window.location.href = session.url;
    } catch (_err) {
      setRedirecting(false);
      toast.error("Failed to start checkout. Please try again.");
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
            Order Sticker
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg" data-ocid="sticker.modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Order Weatherproof Sticker
          </DialogTitle>
          <DialogDescription>
            We&apos;ll mail a weatherproof QR sticker for{" "}
            <span className="font-semibold text-foreground">{vehicleName}</span>{" "}
            to your address.
          </DialogDescription>
        </DialogHeader>

        {/* Pricing notice */}
        <div className="flex items-start gap-2 rounded-lg px-4 py-3 text-sm bg-amber-50 border border-amber-200 text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
          <div>
            <span>
              <span className="font-semibold">$19.99 per sticker</span> +
              shipping and applicable taxes. Payment is processed securely via
              Stripe.
            </span>
          </div>
        </div>

        {/* Free print tip */}
        <div className="flex items-start gap-2 rounded-lg px-4 py-3 text-sm bg-green-50 border border-green-200 text-green-800">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
          <div>
            <span>
              <span className="font-semibold">Tip:</span> You can always print
              your own QR code for free using the{" "}
              <span className="font-semibold">Print QR</span> button.
            </span>
          </div>
        </div>

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
              disabled={isPending}
              data-ocid="sticker.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isPending}
              className="bg-primary text-white hover:bg-primary/90 gap-2"
              data-ocid="sticker.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {redirecting ? "Redirecting to payment…" : "Processing…"}
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay $19.99 &amp; Order Sticker
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
