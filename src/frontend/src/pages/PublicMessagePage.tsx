import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "@tanstack/react-router";
import { CheckCircle2, Loader2, QrCode } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAddMessage } from "../hooks/useQueries";

export default function PublicMessagePage() {
  const { vehicleId } = useParams({ from: "/message/$vehicleId" });
  const [senderName, setSenderName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { mutateAsync, isPending } = useAddMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    try {
      await mutateAsync({
        vehicleId: BigInt(vehicleId),
        senderName: senderName.trim() || null,
        messageText: messageText.trim(),
      });
      setSubmitted(true);
    } catch {
      // silently keep form on error
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <a href="/" className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <QrCode className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl text-navy">Scanlink</span>
      </a>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm text-center"
            data-ocid="public_message.success_state"
          >
            <div className="w-20 h-20 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-navy mb-3">Message Sent!</h1>
            <p className="text-muted-foreground leading-relaxed">
              Your message was delivered to the owner. They&apos;ll be notified
              on Scanlink.
            </p>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <QrCode className="w-4 h-4 flex-shrink-0" />
              <span>
                To send another message, please scan the QR code again.
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm"
            data-ocid="public_message.section"
          >
            <div className="bg-white rounded-3xl shadow-card border border-border p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-light rounded-xl flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-navy">
                    Leave a message
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    For this object&apos;s owner
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="sender-name" className="text-sm">
                    Your name{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="sender-name"
                    placeholder="e.g. John"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="rounded-xl"
                    data-ocid="public_message.input"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="message-text" className="text-sm">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message-text"
                    placeholder="e.g. I found your lost item! 👋"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={4}
                    required
                    className="rounded-xl resize-none"
                    data-ocid="public_message.textarea"
                  />
                </div>

                {isPending && (
                  <div
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                    data-ocid="public_message.loading_state"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending your message…
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!messageText.trim() || isPending}
                  className="w-full bg-primary text-white hover:bg-primary/90 rounded-xl font-semibold py-3 h-auto"
                  data-ocid="public_message.submit_button"
                >
                  {isPending ? "Sending…" : "Send Message"}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-5">
                Messages are anonymous and stored securely on the Internet
                Computer.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-10 text-xs text-muted-foreground">
        Powered by{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
