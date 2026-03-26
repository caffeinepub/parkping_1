import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Vehicle } from "../backend.d";
import {
  useGetObjectContactInfo,
  useSetObjectContactInfo,
  useUpdateObject,
} from "../hooks/useQueries";

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

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  vehicle: Vehicle;
  currentCategory: string;
}

export default function EditObjectDialog({
  open,
  onOpenChange,
  vehicle,
  currentCategory,
}: Props) {
  const [category, setCategory] = useState(currentCategory || "Other");
  const [name, setName] = useState(vehicle.name);
  const [description, setDescription] = useState(vehicle.description);
  const [identifier, setIdentifier] = useState(vehicle.licensePlate);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPublic, setContactPublic] = useState(false);

  const { data: existingContact } = useGetObjectContactInfo(
    open ? vehicle.id : null,
  );

  // Re-sync when vehicle or contact info changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on open
  useEffect(() => {
    setCategory(currentCategory || "Other");
    setName(vehicle.name);
    setDescription(vehicle.description);
    setIdentifier(vehicle.licensePlate);
  }, [vehicle, currentCategory, open]);

  useEffect(() => {
    if (existingContact) {
      const info = Array.isArray(existingContact)
        ? existingContact[0]
        : existingContact;
      if (info) {
        setContactName(
          Array.isArray(info.contactName)
            ? (info.contactName[0] ?? "")
            : (info.contactName ?? ""),
        );
        setContactPhone(
          Array.isArray(info.contactPhone)
            ? (info.contactPhone[0] ?? "")
            : (info.contactPhone ?? ""),
        );
        setContactPublic(info.contactPublic ?? false);
      }
    }
  }, [existingContact]);

  const { mutateAsync: updateObject, isPending } = useUpdateObject();
  const { mutateAsync: setContactInfo, isPending: savingContact } =
    useSetObjectContactInfo();

  const extraField = getExtraField(category);
  const canSubmit =
    !!category &&
    !!name.trim() &&
    (extraField?.required ? !!identifier.trim() : true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await updateObject({
        vehicleId: vehicle.id,
        name: name.trim(),
        description: description.trim(),
        identifier: identifier.trim(),
        category,
      });
      // Save contact info
      await setContactInfo({
        vehicleId: vehicle.id,
        contactName: contactName.trim() || null,
        contactPhone: contactPhone.trim() || null,
        contactPublic,
      });
      toast.success("Digital Identity updated!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update. Please try again.");
    }
  };

  const isSaving = isPending || savingContact;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Digital Identity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(({ id, label, sub, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setCategory(id);
                    setIdentifier("");
                  }}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-left transition-colors ${
                    category === id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              placeholder="e.g. My Car, Lucky the Dog"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Extra field per category */}
          {extraField && (
            <div className="space-y-1">
              <Label htmlFor="edit-identifier">{extraField.label}</Label>
              <Input
                id="edit-identifier"
                placeholder={extraField.placeholder}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required={extraField.required}
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              placeholder="Anything a finder should know…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Contact Info */}
          <div className="space-y-3 rounded-lg border border-border p-3 bg-muted/30">
            <p className="text-sm font-semibold">Contact Info (optional)</p>
            <div className="space-y-1">
              <Label htmlFor="edit-contact-name">Contact Name</Label>
              <Input
                id="edit-contact-name"
                placeholder="e.g. Alex Johnson"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-contact-phone">Phone Number</Label>
              <Input
                id="edit-contact-phone"
                type="tel"
                placeholder="e.g. +1 555 000 1234"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Make contact info public</p>
                <p className="text-xs text-muted-foreground">
                  Shown to message senders who scan your QR
                </p>
              </div>
              <Switch
                checked={contactPublic}
                onCheckedChange={setContactPublic}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isSaving}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
