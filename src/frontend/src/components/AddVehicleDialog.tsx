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
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRegisterVehicle } from "../hooks/useQueries";

export default function AddVehicleDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const { mutateAsync, isPending } = useRegisterVehicle();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !licensePlate.trim()) return;
    try {
      await mutateAsync({
        name: name.trim(),
        description: description.trim(),
        licensePlate: licensePlate.trim().toUpperCase(),
      });
      toast.success("Vehicle registered!");
      setName("");
      setDescription("");
      setLicensePlate("");
      setOpen(false);
    } catch {
      toast.error("Failed to register vehicle.");
    }
  };

  return (
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
              <span className="text-muted-foreground text-xs">(optional)</span>
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
              {isPending ? "Registering…" : "Register Vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
