import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "@tanstack/react-router";
import { CheckCircle2, Loader2, MessageSquare, QrCode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useGetMyVehicles } from "../hooks/useQueries";

const SPAM_KEY_PREFIX = "scanlink_sent_";

export default function PublicMessagePage() {
  const params = useParams({ from: "/message/$vehicleId" });
  const vehicleId = BigInt(params.vehicleId);
  const { actor } = useActor();

  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Spam guard: check if already sent from this session
  const spamKey = `${SPAM_KEY_PREFIX}${params.vehicleId}`;
  const alreadySent = sessionStorage.getItem(spamKey) === "1";

  if (alreadySent && !sent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-3">Already sent</h1>
          <p className="text-muted-foreground">
            To send another message, please scan the QR code again.
          </p>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-3">Message sent!</h1>
          <p className="text-muted-foreground">
            The owner has been notified. To send another message, please scan
            the QR code again.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      setSending(true);
      await actor!.addMessage({
        vehicleId,
        senderName: senderName.trim() || undefined,
        message: message.trim(),
      });
      sessionStorage.setItem(spamKey, "1");
      setSent(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img
              src="/assets/generated/scanlink-logo-transparent.dim_120x120.png"
              alt="ScanLink"
              className="h-10 w-auto"
            />
            <span className="font-bold text-xl text-navy">ScanLink</span>
          </div>
          <div className="w-14 h-14 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">
            Send a message to the owner
          </h1>
          <p className="text-sm text-muted-foreground">
            Your message will be delivered privately. No account needed.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-card border border-border p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="sender-name">
              Your name{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="sender-name"
              placeholder="e.g. Alex"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Hi, your car is blocking the driveway…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={!message.trim() || sending || !actor}
            className="w-full bg-primary text-white hover:bg-primary/90 rounded-full"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending…
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Powered by{" "}
          <a href="/" className="text-primary hover:underline">
            ScanLink
          </a>{" "}
          — Digital Identity for anything.
        </p>
      </div>
    </div>
  );
}
