import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Car,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Package,
  Printer,
  QrCode,
  ShieldOff,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  AdminStats,
  QrPrintRequest,
  StickerRequest,
  UserSummary,
} from "../backend.d";
import {
  useGetAdminStats,
  useGetAllQrPrintRequests,
  useGetAllStickerRequests,
  useGetAllUsers,
  useIsCallerAdmin,
  useMarkQrPrintComplete,
  useUpdateStickerStatus,
} from "../hooks/useQueries";

function truncatePrincipal(principal: string): string {
  if (principal.length <= 14) return principal;
  return `${principal.slice(0, 8)}...${principal.slice(-4)}`;
}

function formatTime(timestamp: bigint) {
  const ms = Number(timestamp / 1_000_000n);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
}

function StatCard({
  title,
  value,
  icon: Icon,
  delay,
}: {
  title: string;
  value: bigint | undefined;
  icon: React.ElementType;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="w-9 h-9 bg-teal-light rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {value === undefined ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-3xl font-bold text-navy">{value.toString()}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MarkShippedDialog({ req }: { req: StickerRequest }) {
  const [open, setOpen] = useState(false);
  const [trackingNote, setTrackingNote] = useState("");
  const { mutateAsync, isPending } = useUpdateStickerStatus();

  async function handleConfirm() {
    await mutateAsync({
      id: req.id,
      status: "shipped",
      trackingNote: trackingNote.trim() || null,
    });
    toast.success("Sticker marked as shipped");
    setOpen(false);
    setTrackingNote("");
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        data-ocid="admin.open_modal_button"
        className="text-xs h-7 px-2 border-primary/30 text-primary hover:bg-teal-light"
      >
        Mark as Shipped
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>Mark as Shipped</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Confirm shipment for{" "}
              <span className="font-medium text-navy">{req.name}</span> — #
              {req.id.toString()}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="tracking-note">Tracking Number (optional)</Label>
              <Input
                id="tracking-note"
                placeholder="e.g. 1Z999AA10123456784"
                value={trackingNote}
                onChange={(e) => setTrackingNote(e.target.value)}
                data-ocid="admin.input"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              data-ocid="admin.confirm_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm Shipment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PrintQRDialog({ req }: { req: QrPrintRequest }) {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useMarkQrPrintComplete();
  const vehicleIdStr = req.vehicleId.toString();
  const qrDataUrl = `${window.location.origin}/message/${vehicleIdStr}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=440x440&data=${encodeURIComponent(qrDataUrl)}&bgcolor=ffffff&color=0E2A3B&margin=10`;

  function handlePrint() {
    const printWindow = window.open("", "_blank", "width=600,height=750");
    if (!printWindow) return;
    const html = [
      "<!DOCTYPE html><html><head>",
      `<title>ParkPing QR 2014 Vehicle ${vehicleIdStr}</title>`,
      "<style>",
      "*{margin:0;padding:0;box-sizing:border-box}",
      "body{font-family:system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:white;padding:40px}",
      ".card{border:2px solid #000;border-radius:16px;padding:32px;max-width:340px;width:100%;text-align:center}",
      ".logo{font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:4px;color:#0a1628}",
      ".subtitle{font-size:13px;color:#666;margin-bottom:20px}",
      ".qr img{width:220px;height:220px;border-radius:8px}",
      ".vehicle-id{font-size:12px;font-family:monospace;color:#888;margin-top:14px}",
      ".scan-note{margin-top:14px;font-size:15px;font-weight:700;color:#0d9488;letter-spacing:0.3px;text-transform:uppercase}",
      "@media print{body{padding:20px}}",
      "</style></head><body>",
      '<div class="card">',
      '<div class="logo">\u{1F17F} ParkPing</div>',
      '<div class="subtitle">Vehicle QR Code</div>',
      `<div class="qr"><img src="${qrImageUrl}" alt="QR Code"/></div>`,
      `<div class="vehicle-id">Vehicle ID: ${vehicleIdStr}</div>`,
      '<div class="scan-note">Scan to notify the vehicle owner</div>',
      "</div>",
      "<script>window.onload=function(){window.print();}</script>",
      "</body></html>",
    ].join("");
    printWindow.document.write(html);
    printWindow.document.close();
  }

  async function handleMarkPrinted() {
    await mutateAsync(req.id);
    toast.success("QR print marked as complete");
    setOpen(false);
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        data-ocid="admin.open_modal_button"
        className="text-xs h-7 px-2 border-primary/30 text-primary hover:bg-teal-light"
      >
        <Printer className="w-3.5 h-3.5 mr-1" />
        Print QR
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>Print QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="text-sm text-muted-foreground text-center">
              Vehicle ID:{" "}
              <span className="font-mono font-medium text-navy">
                {vehicleIdStr}
              </span>
            </div>
            <div className="bg-white rounded-xl p-3 border border-border shadow-sm">
              <img
                src={qrImageUrl}
                alt={`QR code for vehicle ${vehicleIdStr}`}
                width={220}
                height={220}
                className="rounded-lg"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Scan to notify the vehicle owner
            </p>
            {req.isReplacement && (
              <Badge
                className="bg-amber-100 text-amber-700 border-amber-200"
                variant="outline"
              >
                Replacement — $9.99 + shipping
              </Badge>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="border-primary text-primary hover:bg-teal-light"
              data-ocid="admin.secondary_button"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={handleMarkPrinted}
              disabled={isPending}
              data-ocid="admin.confirm_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Printed
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminPortal() {
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: stats } = useGetAdminStats();
  const { data: users, isLoading: usersLoading } = useGetAllUsers();
  const { data: stickerRequests, isLoading: stickersLoading } =
    useGetAllStickerRequests();
  const { data: qrPrintRequests, isLoading: qrPrintsLoading } =
    useGetAllQrPrintRequests();

  if (adminCheckLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 pb-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto mt-6">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-sm"
            data-ocid="admin.error_state"
          >
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldOff className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-navy mb-3">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to view this page. Admin access is
              required.
            </p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  const pendingQrCount = qrPrintRequests
    ? qrPrintRequests.filter((r) => r.status === "pending").length
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main
        className="flex-1 pt-20 pb-16 px-4 sm:px-6"
        data-ocid="admin.section"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 mb-10"
          >
            <h1 className="text-3xl font-bold text-navy">Admin Portal</h1>
            <p className="text-muted-foreground mt-1">
              Platform overview and user management
            </p>
          </motion.div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <StatCard
              title="Total Users"
              value={(stats as AdminStats | undefined)?.totalUsers}
              icon={Users}
              delay={0}
            />
            <StatCard
              title="Total Vehicles"
              value={(stats as AdminStats | undefined)?.totalVehicles}
              icon={Car}
              delay={0.06}
            />
            <StatCard
              title="Total Messages"
              value={(stats as AdminStats | undefined)?.totalMessages}
              icon={MessageSquare}
              delay={0.12}
            />
            <StatCard
              title="Sticker Requests"
              value={(stats as AdminStats | undefined)?.totalStickerRequests}
              icon={Package}
              delay={0.18}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" data-ocid="admin.tab">
            <TabsList className="mb-6">
              <TabsTrigger value="users" data-ocid="admin.tab">
                Users
              </TabsTrigger>
              <TabsTrigger value="stickers" data-ocid="admin.tab">
                Sticker Requests
              </TabsTrigger>
              <TabsTrigger
                value="qr-prints"
                data-ocid="admin.tab"
                className="flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                QR Prints
                {pendingQrCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">
                    {pendingQrCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
              >
                <Card className="border-border shadow-card">
                  <CardHeader>
                    <CardTitle className="text-navy">All Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {usersLoading ? (
                      <div
                        className="space-y-3"
                        data-ocid="admin.loading_state"
                      >
                        {[1, 2, 3, 4].map((i) => (
                          <Skeleton
                            key={i}
                            className="h-12 w-full rounded-lg"
                          />
                        ))}
                      </div>
                    ) : !users || users.length === 0 ? (
                      <div
                        className="text-center py-12 text-muted-foreground"
                        data-ocid="admin.empty_state"
                      >
                        No users found.
                      </div>
                    ) : (
                      <Table data-ocid="admin.table">
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">
                              Vehicles
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(users as UserSummary[]).map(
                            (user: UserSummary, idx: number) => {
                              const principalStr = user.principal.toString();
                              return (
                                <TableRow
                                  key={principalStr}
                                  data-ocid={`admin.row.${idx + 1}`}
                                >
                                  <TableCell className="font-mono text-xs text-muted-foreground">
                                    {truncatePrincipal(principalStr)}
                                  </TableCell>
                                  <TableCell className="font-medium text-navy">
                                    {user.name ?? (
                                      <span className="text-muted-foreground italic">
                                        No name
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-light text-primary text-sm font-semibold">
                                      {user.vehicleCount.toString()}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              );
                            },
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="stickers">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
              >
                <Card className="border-border shadow-card">
                  <CardHeader>
                    <CardTitle className="text-navy">
                      Sticker Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stickersLoading ? (
                      <div
                        className="space-y-3"
                        data-ocid="admin.loading_state"
                      >
                        {[1, 2, 3].map((i) => (
                          <Skeleton
                            key={i}
                            className="h-12 w-full rounded-lg"
                          />
                        ))}
                      </div>
                    ) : !stickerRequests || stickerRequests.length === 0 ? (
                      <div
                        className="text-center py-12 text-muted-foreground"
                        data-ocid="admin.empty_state"
                      >
                        No sticker requests yet.
                      </div>
                    ) : (
                      <Table data-ocid="admin.table">
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(stickerRequests as StickerRequest[]).map(
                            (req: StickerRequest, idx: number) => (
                              <TableRow
                                key={req.id.toString()}
                                data-ocid={`admin.row.${idx + 1}`}
                              >
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                  #{req.id.toString()}
                                </TableCell>
                                <TableCell className="font-medium text-navy">
                                  {req.name}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {[req.addressLine1, req.city, req.country]
                                    .filter(Boolean)
                                    .join(", ")}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <Badge
                                      className={
                                        req.status === "pending"
                                          ? "bg-amber-100 text-amber-700 border-amber-200"
                                          : req.status === "shipped"
                                            ? "bg-teal-light text-primary"
                                            : "bg-muted text-muted-foreground"
                                      }
                                      variant="outline"
                                    >
                                      {req.status}
                                    </Badge>
                                    {req.trackingNote && (
                                      <span className="text-xs text-muted-foreground">
                                        🚚 {req.trackingNote}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatTime(req.requestedAt)}
                                </TableCell>
                                <TableCell>
                                  {req.status === "pending" ? (
                                    <MarkShippedDialog req={req} />
                                  ) : req.status === "shipped" ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Shipped
                                    </span>
                                  ) : null}
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="qr-prints">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
              >
                <Card className="border-border shadow-card">
                  <CardHeader>
                    <CardTitle className="text-navy">
                      QR Print Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {qrPrintsLoading ? (
                      <div
                        className="space-y-3"
                        data-ocid="admin.loading_state"
                      >
                        {[1, 2, 3].map((i) => (
                          <Skeleton
                            key={i}
                            className="h-12 w-full rounded-lg"
                          />
                        ))}
                      </div>
                    ) : !qrPrintRequests || qrPrintRequests.length === 0 ? (
                      <div
                        className="text-center py-12 text-muted-foreground"
                        data-ocid="admin.empty_state"
                      >
                        No QR print requests yet.
                      </div>
                    ) : (
                      <Table data-ocid="admin.table">
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Vehicle ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(qrPrintRequests as QrPrintRequest[]).map(
                            (req: QrPrintRequest, idx: number) => (
                              <TableRow
                                key={req.id.toString()}
                                data-ocid={`admin.row.${idx + 1}`}
                              >
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                  #{req.id.toString()}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-navy">
                                  {req.vehicleId.toString()}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                  {truncatePrincipal(req.owner.toString())}
                                </TableCell>
                                <TableCell>
                                  {req.isReplacement ? (
                                    <Badge
                                      className="bg-amber-100 text-amber-700 border-amber-200"
                                      variant="outline"
                                    >
                                      Replacement $9.99
                                    </Badge>
                                  ) : (
                                    <Badge
                                      className="bg-teal-light text-primary border-primary/20"
                                      variant="outline"
                                    >
                                      Free
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      req.status === "pending"
                                        ? "bg-amber-100 text-amber-700 border-amber-200"
                                        : "bg-teal-light text-primary border-primary/20"
                                    }
                                    variant="outline"
                                  >
                                    {req.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatTime(req.requestedAt)}
                                </TableCell>
                                <TableCell>
                                  {req.status === "pending" ? (
                                    <PrintQRDialog req={req} />
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Printed
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
