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
import {
  Bike,
  Briefcase,
  Car,
  Key,
  Laptop,
  Loader2,
  Package,
  PawPrint,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ShoppingItem } from "../backend.d";
import { useGetMyVehicles, useRegisterObject } from "../hooks/useQueries";
import { useCreateCheckoutSession } from "../hooks/useStripe";

const CATEGORIES = [
  {
    id: "Vehicle",
    label: "Vehicle",
    sub: "cars, trucks, motorcycles",
    Icon: Car,
  },
  {
    id: "Bicycle / Scooter",
    label: "Bicycle / Scooter",
    sub: "bikes, e-scooters",
    Icon: Bike,
  },
  {
    id: "Pet / Animal",
    label: "Pet / Animal",
    sub: "dogs, cats, livestock",
    Icon: PawPrint,
  },
  {
    id: "Luggage / Bag",
    label: "Luggage / Bag",
    sub: "bags, backpacks, cases",
    Icon: Briefcase,
  },
  {
    id: "Electronics",
    label: "Electronics",
    sub: "laptops, phones, cameras",
    Icon: Laptop,
  },
  {
    id: "Keys / Personal Item",
    label: "Keys / Personal",
    sub: "keys, wallet, ID",
    Icon: Key,
  },
  { id: "Other", label: "Other", sub: "tools, equipment, etc.", Icon: Package },
];

function getExtraField(
  category: string,
): { label: string; placeholder: string; required: boolean } | null {
  switch (category) {
    case "Vehicle":
      return {
        label: "License Plate",
        placeholder: "e.g. ABC-1234",
        required: true,
      };
    case "Bicycle / Scooter":
      return {
        label: "Serial Number (optional)",
        placeholder: "e.g. SN123456",
        required: false,
      };
    case "Pet / Animal":
      return {
        label: "Breed / Medical Notes (optional)",
        placeholder: "e.g. Golden Retriever, no known allergies",
        required: false,
      };
    case "Luggage / Bag":
      return {
        label: "Color / Features (optional)",
        placeholder: "e.g. Red hardshell, TSA lock",
        required: false,
      };
    case "Electronics":
      return {
        label: "Serial Number (optional)",
        placeholder: "e.g. C02XG1JHJG5K",
        required: false,
      };
    case "Other":
      return {
        label: "Identifier / Serial (optional)",
        placeholder: "e.g. Tool #3, Asset ID",
        required: false,
      };
    default:
      return null;
  }
}

export default function AddVehicleDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const { mutateAsync: registerObject, isPending } = useRegisterObject();
  const { mutateAsync: createCheckoutSession } = useCreateCheckoutSession();
  const { data: vehicles } = useGetMyVehicles();

  const extraField = category ? getExtraField(category) : null;

  const canSubmit =
    !!category &&
    !!name.trim() &&
    (extraField?.required ? !!identifier.trim() : true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await registerObject({
        name: name.trim(),
        description: description.trim(),
        identifier: identifier.trim().toUpperCase(),
        category,
      });
      toast.success("Digital ID created!");

      const currentCount = vehicles?.length ?? 0;
      const isFirst = currentCount === 0;
      const shoppingItem: ShoppingItem = {
        currency: "usd",
        productName: isFirst
          ? "Scanlink Annual Subscription - First Object"
          : "Scanlink Annual Subscription - Additional Object",
        productDescription: isFirst
          ? "Annual subscription for your first object on Scanlink"
          : "Annual subscription for an additional object on Scanlink",
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
        toast.error("Could not start payment. Your object was saved.");
      }

      setName("");
      setDescription("");
      setIdentifier("");
      setCategory("");
    } catch {
      toast.error("Failed to create Digital ID.");
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
            Create Digital ID
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg" data-ocid="vehicles.dialog">
          <DialogHeader>
            <DialogTitle>Create Digital ID</DialogTitle>
          </DialogHeader>
          <div className="bg-teal-light/50 border border-primary/20 rounded-lg px-4 py-2.5 text-sm text-muted-foreground">
            💳 <span className="font-medium text-navy">$9.99/yr</span> for your
            first object ·{" "}
            <span className="font-medium text-navy">$4.99/yr</span> for each
            additional
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Category selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                What are you tagging?{" "}
                <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map(({ id, label, sub, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setCategory(id);
                      setIdentifier("");
                    }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all ${
                      category === id
                        ? "border-primary bg-teal-light/60 text-primary"
                        : "border-border bg-white hover:border-primary/40 text-muted-foreground hover:text-navy"
                    }`}
                    data-ocid="vehicles.toggle"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-semibold leading-tight">
                      {label}
                    </span>
                    <span className="text-xs leading-tight opacity-60 hidden sm:block">
                      {sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {category && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="v-name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="v-name"
                    placeholder={`e.g. ${
                      category === "Pet / Animal"
                        ? "Buddy the Labrador"
                        : category === "Bicycle / Scooter"
                          ? "My Trek Bike"
                          : category === "Vehicle"
                            ? "Blue Honda Civic"
                            : category === "Luggage / Bag"
                              ? "Red Suitcase"
                              : category === "Electronics"
                                ? "MacBook Pro"
                                : "My Keys"
                    }`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    data-ocid="vehicles.input"
                  />
                </div>

                {extraField && (
                  <div className="space-y-1">
                    <Label htmlFor="v-identifier">
                      {extraField.label}{" "}
                      {extraField.required && (
                        <span className="text-destructive">*</span>
                      )}
                    </Label>
                    <Input
                      id="v-identifier"
                      placeholder={extraField.placeholder}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required={extraField.required}
                      data-ocid="vehicles.input"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="v-desc">
                    Description{" "}
                    <span className="text-muted-foreground text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="v-desc"
                    placeholder="Add any extra details to help someone identify this object…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    data-ocid="vehicles.textarea"
                  />
                </div>
              </>
            )}

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
                disabled={!canSubmit || isPending}
                className="bg-primary text-white hover:bg-primary/90"
                data-ocid="vehicles.submit_button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create & Pay"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
