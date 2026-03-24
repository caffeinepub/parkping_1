import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PrintQRButton from "@/components/PrintQRButton";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import RequestStickerDialog from "@/components/RequestStickerDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Car, Check, MessageSquare, User } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Message, UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetMessagesForVehicle,
  useGetMyVehicles,
  useMarkMessageAsRead,
} from "../hooks/useQueries";

function formatTime(timestamp: bigint) {
  const ms = Number(timestamp / 1_000_000n);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

export default function VehicleMessages() {
  const { id } = useParams({ from: "/dashboard/vehicle/$id" });
  const { identity } = useInternetIdentity();

  const vehicleId = BigInt(id);
  const { data: vehicles } = useGetMyVehicles();
  const vehicle = vehicles?.find((v) => v.id === vehicleId);

  const { data: messages, isLoading } = useGetMessagesForVehicle(vehicleId);
  const { mutateAsync: markRead, isPending: markingRead } =
    useMarkMessageAsRead();
  const { data: userProfile } = useGetCallerUserProfile();

  const handleMarkRead = async (messageId: bigint) => {
    try {
      await markRead(messageId);
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            Please sign in to view messages.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main
        className="flex-1 pt-20 pb-16 px-4 sm:px-6"
        data-ocid="vehicle_messages.section"
      >
        <div className="max-w-4xl mx-auto">
          {/* Back + header */}
          <div className="flex items-center gap-3 mt-6 mb-8">
            <Link to="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-navy"
                data-ocid="vehicle_messages.button"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-light rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {vehicle?.name ?? "Vehicle"}
                </h1>
                <p className="text-sm text-muted-foreground font-mono">
                  {vehicle?.licensePlate}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Messages */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold text-navy mb-5">
                Messages
                {messages && messages.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({messages.length})
                  </span>
                )}
              </h2>

              {isLoading ? (
                <div
                  className="space-y-4"
                  data-ocid="vehicle_messages.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : !messages || messages.length === 0 ? (
                <div
                  className="text-center py-16 bg-white rounded-2xl border border-border shadow-card"
                  data-ocid="vehicle_messages.empty_state"
                >
                  <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-navy mb-1">
                    No messages yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Share your QR code to start receiving messages.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg: Message, idx: number) => (
                    <motion.div
                      key={msg.id.toString()}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className={`bg-white rounded-2xl border shadow-card p-5 ${
                        msg.isRead
                          ? "border-border"
                          : "border-primary/40 ring-1 ring-primary/20"
                      }`}
                      data-ocid={`vehicle_messages.item.${idx + 1}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 bg-teal-light rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-navy text-sm">
                                {msg.senderName ?? "Anonymous"}
                              </span>
                              {!msg.isRead && (
                                <Badge className="bg-primary/10 text-primary text-xs px-2 py-0">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">
                              {msg.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                        {!msg.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkRead(msg.id)}
                            disabled={markingRead}
                            className="text-primary hover:text-primary/80 hover:bg-primary/5 gap-1.5 flex-shrink-0"
                            data-ocid={`vehicle_messages.secondary_button.${idx + 1}`}
                          >
                            <Check className="w-4 h-4" />
                            Mark read
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* QR sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-border shadow-card p-6 sticky top-24">
                <h3 className="font-bold text-navy mb-2 flex items-center gap-2">
                  <Car className="w-4 h-4 text-primary" /> Your QR Code
                </h3>
                <p className="text-xs text-muted-foreground mb-5">
                  Print this QR code and stick it on your vehicle. Anyone who
                  scans it can get notified.
                </p>
                <QRCodeDisplay
                  url={`${window.location.origin}/message/${id}`}
                  size={180}
                />
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`${window.location.origin}/message/${id}`)}`}
                  download={`parkping-qr-${id}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 border-primary text-primary hover:bg-primary/5"
                    data-ocid="vehicle_messages.secondary_button"
                  >
                    Download QR Code
                  </Button>
                </a>
                <PrintQRButton
                  vehicleName={vehicle?.name ?? "Vehicle"}
                  licensePlate={vehicle?.licensePlate}
                  vehicleId={id}
                  className="w-full mt-2 border-border text-foreground hover:text-primary hover:border-primary"
                />
                <div className="mt-2">
                  <RequestStickerDialog
                    vehicleId={vehicleId}
                    vehicleName={vehicle?.name ?? "Vehicle"}
                    userProfile={userProfile as UserProfile | null}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-primary text-primary hover:bg-primary/5 gap-1.5"
                        data-ocid="vehicle_messages.open_modal_button"
                      >
                        Request Weatherproof Sticker
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
