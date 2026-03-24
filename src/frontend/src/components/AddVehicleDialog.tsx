import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ShoppingItem } from "../backend.d";
import { useGetMyVehicles, useRegisterVehicle } from "../hooks/useQueries";
import { useCreateCheckoutSession } from "../hooks/useStripe";

export default function AddVehicleDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const { mutateAsync: registerVehicle, isPending } = useRegisterVehicle();
  const { mutateAsync: createCheckoutSession } = useCreateCheckoutSession();
  const { data: vehicles } = useGetMyVehicles();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !licensePlate.trim()) return;
    try {
      await registerVehicle({
        name: name.trim(),
        description: description.trim(),
        licensePlate: licensePlate.trim().toUpperCase(),
      });
      toast.success("Vehicle registered!");

      const currentCount = vehicles?.length ?? 0;
      const isFirst = currentCount === 0;
      const shoppingItem: ShoppingItem = {
        currency: "usd",
        productName: isFirst
          ? "ParkPing Annual Subscription - First Vehicle"
          : "ParkPing Annual Subscription - Additional Vehicle",
        productDescription: isFirst
          ? "Annual subscription for your first vehicle on ParkPing"
          : "Annual subscription for an additional vehicle on ParkPing",
        priceInCents: isFirst ? BigInt(999) : BigInt(499),
        quantity: BigInt(1),
      };

      setRedirecting(true);
      setOpen(false);

      try {
        const session = await createCheckoutSession([shoppingItem]);
        if (!session?.url) throw new Error("Stripe session missing url");
        window.location.href = session.url;
      } catch (_err) {
        setRedirecting(false);
        toast.error("Could not start payment. Your vehicle was saved.");
      }

      setName("");
      setDescription("");
      setLicensePlate("");
    } catch {
      toast.error("Failed to register vehicle.");
    }
  };

  return (
    <>
      {redirecting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-navy font-semibold">Redirecting to payment…</p>
          </div>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="bg-primary text-white hover:bg-primary/90 gap-2"
            data-ocid="vehicles.open_modal_button"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" data-ocid="vehicles.dialog">
          <DialogHeader>
            <DialogTitle>Register a Vehicle</DialogTitle>
          </DialogHeader>
          <div className="bg-teal-light/50 border border-primary/20 rounded-lg px-4 py-2.5 text-sm text-muted-foreground">
            💳 <span className="font-medium text-navy">$9.99/yr</span> for your
            first vehicle ·{" "}
            <span className="font-medium text-navy">$4.99/yr</span> for each
            additional
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="v-name">
                Vehicle name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="v-name"
                placeholder="e.g. Blue Honda Civic"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-ocid="vehicles.input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="v-plate">
                License plate <span className="text-destructive">*</span>
              </Label>
              <Input
                id="v-plate"
                placeholder="e.g. ABC-1234"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                required
                data-ocid="vehicles.input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="v-desc">
                Description{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="v-desc"
                placeholder="e.g. Parked in downtown garage, level 2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                data-ocid="vehicles.textarea"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-ocid="vehicles.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || !licensePlate.trim() || isPending}
                className="bg-primary text-white hover:bg-primary/90"
                data-ocid="vehicles.submit_button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering…
                  </>
                ) : (
                  "Register & Pay"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
