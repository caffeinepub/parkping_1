import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface ProfileSetupProps {
  open: boolean;
}

export default function ProfileSetup({ open }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [saving, setSaving] = useState(false);
  const { actor } = useActor();
  const qc = useQueryClient();

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !actor) return;
    setSaving(true);
    try {
      await actor.saveCallerUserProfile(name.trim(), email.trim());
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });

      if (promoCode.trim()) {
        try {
          const msg = await (actor as any).redeemPromoCode(
            promoCode.trim().toUpperCase(),
          );
          toast.success(msg || "Promo code applied!");
          qc.invalidateQueries({ queryKey: ["mySubscription"] });
        } catch {
          toast.error(
            "Promo code could not be applied. Please check the code and try again.",
          );
        }
      }

      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} data-ocid="profile_setup.dialog">
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome to ScanLink!</DialogTitle>
          <DialogDescription>
            Please enter your name and email to finish setting up your account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="profile-name">Your name</Label>
            <Input
              id="profile-name"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              data-ocid="profile_setup.input"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="profile-email">Email address</Label>
            <Input
              id="profile-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              data-ocid="profile_setup.input"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="profile-promo">
              Promo Code{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (optional)
              </span>
            </Label>
            <Input
              id="profile-promo"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="font-mono tracking-widest"
              data-ocid="profile_setup.input"
            />
            <p className="text-xs text-muted-foreground">
              Have a promo code? Enter it here for a free or discounted
              subscription.
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !email.trim() || saving}
            className="w-full bg-primary text-white hover:bg-primary/90"
            data-ocid="profile_setup.submit_button"
          >
            {saving ? "Saving…" : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
