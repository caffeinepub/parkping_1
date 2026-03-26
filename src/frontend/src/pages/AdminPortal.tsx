import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { printQRCode } from "@/components/PrintQRButton";
import QRCodeDisplay from "@/components/QRCodeDisplay";
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
  CreditCard,
  Loader2,
  MessageSquare,
  Package,
  Printer,
  QrCode,
  ShieldOff,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  AdminStats,
  PrintableQRCode,
  StickerRequest,
  UserSummary,
  Vehicle,
} from "../backend.d";
import {
  useGeneratePrintableQRCodes,
  useGetAdminStats,
  useGetAllPrintableQRCodes,
  useGetAllStickerRequests,
  useGetAllUsers,
  useGetAllVehicles,
  useIsCallerAdmin,
  useRevokePrintableQRCode,
  useUpdateStickerStatus,
} from "../hooks/useQueries";
import {
  useIsStripeConfigured,
  useSetStripeConfiguration,
} from "../hooks/useStripe";

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

function AdminPrintQRButton({
  req,
  vehicleMap,
}: {
  req: StickerRequest;
  vehicleMap: Map<string, Vehicle>;
}) {
  const vehicle = vehicleMap.get(req.vehicleId.toString());

  function handlePrint() {
    printQRCode({
      vehicleName: vehicle?.name ?? req.name,
      licensePlate: vehicle?.licensePlate || undefined,
      vehicleId: req.vehicleId.toString(),
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handlePrint}
      data-ocid="admin.print_qr_button"
      className="text-xs h-7 px-2 border-primary/30 text-primary hover:bg-teal-light"
    >
      <Printer className="w-3 h-3 mr-1" />
      Print QR
    </Button>
  );
}

function RevokeQRButton({ code }: { code: PrintableQRCode }) {
  const [confirm, setConfirm] = useState(false);
  const { mutateAsync, isPending } = useRevokePrintableQRCode();

  async function handleRevoke() {
    try {
      await mutateAsync(code.id);
      toast.success(`QR code ${code.uniqueIdentifier} revoked.`);
      setConfirm(false);
    } catch {
      toast.error("Failed to revoke QR code.");
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="destructive"
          onClick={handleRevoke}
          disabled={isPending}
          className="text-xs h-7 px-2"
          data-ocid="admin.confirm_button"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setConfirm(false)}
          className="text-xs h-7 px-2"
          data-ocid="admin.cancel_button"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => setConfirm(true)}
      className="text-xs h-7 px-2 border-red-200 text-destructive hover:bg-red-50"
      data-ocid="admin.delete_button"
    >
      Revoke
    </Button>
  );
}

function AdminQRCodesTab() {
  const [quantity, setQuantity] = useState(10);
  const [prefix, setPrefix] = useState("QR");
  const [generatedCodes, setGeneratedCodes] = useState<PrintableQRCode[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const printRef = useRef<HTMLDivElement>(null);

  const { mutateAsync: generate, isPending: generating } =
    useGeneratePrintableQRCodes();
  const { data: allCodes, isLoading: codesLoading } =
    useGetAllPrintableQRCodes();

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const codes = await generate({
        quantity: BigInt(quantity),
        prefix: prefix.toUpperCase().trim() || "QR",
      });
      setGeneratedCodes(codes as PrintableQRCode[]);
      toast.success(`Generated ${codes.length} QR codes!`);
    } catch {
      toast.error("Failed to generate QR codes.");
    }
  }

  function handlePrintAll() {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>ScanLink QR Codes</title>
          <style>
            body { margin: 0; padding: 20px; font-family: monospace; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
            .qr-card { display: flex; flex-direction: column; align-items: center; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; page-break-inside: avoid; }
            .qr-card img, .qr-card canvas, .qr-card svg { width: 120px; height: 120px; }
            .identifier { font-size: 12px; font-weight: bold; margin-top: 8px; letter-spacing: 1px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }

  const filteredCodes = useMemo(() => {
    if (!allCodes) return [];
    if (statusFilter === "all") return allCodes as PrintableQRCode[];
    return (allCodes as PrintableQRCode[]).filter(
      (c) => c.status === statusFilter,
    );
  }, [allCodes, statusFilter]);

  const statusFilters = ["all", "generated", "assigned", "revoked"];

  return (
    <div className="space-y-6">
      {/* Generate Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border shadow-card">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-9 h-9 bg-teal-light rounded-xl flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-navy">Generate QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleGenerate}
              className="flex flex-col sm:flex-row gap-4 items-end"
            >
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="qr-quantity" className="text-navy font-medium">
                  Quantity
                </Label>
                <Input
                  id="qr-quantity"
                  type="number"
                  min={1}
                  max={200}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, Math.min(200, Number(e.target.value))),
                    )
                  }
                  className="w-full"
                  data-ocid="admin.input"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="qr-prefix" className="text-navy font-medium">
                  Prefix{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="qr-prefix"
                  placeholder="QR"
                  maxLength={8}
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  className="font-mono"
                  data-ocid="admin.input"
                />
              </div>
              <Button
                type="submit"
                disabled={generating}
                className="bg-primary text-white hover:bg-primary/90 shrink-0"
                data-ocid="admin.primary_button"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate Codes
                  </>
                )}
              </Button>
            </form>

            {/* Preview */}
            {generatedCodes.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-navy">
                      Generated Codes Preview
                    </h3>
                    <Badge className="bg-teal-light text-primary border-primary/20">
                      {generatedCodes.length} codes
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintAll}
                    className="border-primary/40 text-primary hover:bg-teal-light gap-1.5"
                    data-ocid="admin.secondary_button"
                  >
                    <Printer className="w-4 h-4" />
                    Download / Print All
                  </Button>
                </div>

                {/* Hidden print layout */}
                <div ref={printRef} style={{ display: "none" }}>
                  <div className="grid">
                    {generatedCodes.map((code) => (
                      <div key={code.id.toString()} className="qr-card">
                        <QRCodeDisplay url={code.qrData} size={120} />
                        <div className="identifier">
                          {code.uniqueIdentifier}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visible preview grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {generatedCodes.map((code) => (
                    <motion.div
                      key={code.id.toString()}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center p-3 bg-muted/30 rounded-xl border border-border"
                    >
                      <QRCodeDisplay url={code.qrData} size={100} />
                      <span className="font-mono text-xs font-bold text-navy mt-2 tracking-wider">
                        {code.uniqueIdentifier}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* All QR Codes Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-light rounded-xl flex items-center justify-center">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-navy">All QR Codes</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {statusFilters.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  data-ocid="admin.tab"
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                    statusFilter === f
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-teal-light hover:text-primary"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {codesLoading ? (
              <div className="space-y-3" data-ocid="admin.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredCodes.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                No QR codes found
                {statusFilter !== "all" ? ` with status "${statusFilter}"` : ""}
                .
              </div>
            ) : (
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.map((code: PrintableQRCode, idx: number) => (
                    <TableRow
                      key={code.id.toString()}
                      data-ocid={`admin.row.${idx + 1}`}
                    >
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-navy tracking-wider bg-muted px-2 py-1 rounded">
                          {code.uniqueIdentifier}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            code.status === "generated"
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : code.status === "assigned"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-muted text-muted-foreground"
                          }
                        >
                          {code.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {code.assignedVehicleId !== undefined ? (
                          `Vehicle #${code.assignedVehicleId.toString()}`
                        ) : (
                          <span className="italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTime(code.createdAt)}
                      </TableCell>
                      <TableCell>
                        {code.status !== "revoked" ? (
                          <RevokeQRButton code={code} />
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Revoked
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StripeConfigPanel() {
  const { data: isConfigured, isLoading: checkingConfig } =
    useIsStripeConfigured();
  const { mutateAsync: setConfig, isPending } = useSetStripeConfiguration();
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("US,CA,GB,AU");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!secretKey.trim()) return;
    try {
      const countryList = countries
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);
      await setConfig({
        secretKey: secretKey.trim(),
        allowedCountries: countryList,
      });
      toast.success("Stripe configuration saved!");
      setSecretKey("");
    } catch {
      toast.error("Failed to save Stripe configuration.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.24 }}
    >
      <Card className="border-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-light rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-navy">Stripe Configuration</CardTitle>
          </div>
          {!checkingConfig && isConfigured && (
            <Badge
              className="bg-green-100 text-green-700 border-green-200 gap-1.5"
              variant="outline"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Configured
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {checkingConfig ? (
            <div className="space-y-3" data-ocid="admin.loading_state">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {isConfigured && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm text-green-700">
                  ✅ Stripe payments are active. Enter a new key below to
                  reconfigure.
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                <Input
                  id="stripe-key"
                  type="password"
                  placeholder="sk_live_..."
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  required
                  data-ocid="admin.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stripe-countries">Allowed Countries</Label>
                <Input
                  id="stripe-countries"
                  placeholder="US,CA,GB,AU"
                  value={countries}
                  onChange={(e) => setCountries(e.target.value)}
                  data-ocid="admin.input"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated ISO country codes
                </p>
              </div>
              <Button
                type="submit"
                disabled={!secretKey.trim() || isPending}
                className="bg-primary text-white hover:bg-primary/90"
                data-ocid="admin.submit_button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isConfigured ? (
                  "Update Configuration"
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminPortal() {
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: stats } = useGetAdminStats();
  const { data: users, isLoading: usersLoading } = useGetAllUsers();
  const { data: stickerRequests, isLoading: stickersLoading } =
    useGetAllStickerRequests();
  const { data: allVehicles } = useGetAllVehicles();

  const vehicleMap = useMemo(() => {
    const map = new Map<string, Vehicle>();
    if (allVehicles) {
      for (const v of allVehicles as Vehicle[]) {
        map.set(v.id.toString(), v);
      }
    }
    return map;
  }, [allVehicles]);

  if (adminCheckLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 pb-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto mt-6">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 mb-10">
              {[1, 2, 3, 4, 5].map((i) => (
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
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
            <StatCard
              title="Printable QR Codes"
              value={(stats as AdminStats | undefined)?.totalPrintableQRCodes}
              icon={QrCode}
              delay={0.24}
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
              <TabsTrigger value="qrcodes" data-ocid="admin.tab">
                QR Codes
              </TabsTrigger>
              <TabsTrigger value="stripe" data-ocid="admin.tab">
                Stripe
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
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(stickerRequests as StickerRequest[]).map(
                            (req: StickerRequest, idx: number) => {
                              const vehicle = vehicleMap.get(
                                req.vehicleId.toString(),
                              );
                              return (
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
                                  <TableCell>
                                    {vehicle ? (
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium text-navy">
                                          {vehicle.name}
                                        </span>
                                        {vehicle.licensePlate && (
                                          <span className="text-xs font-mono text-muted-foreground">
                                            {vehicle.licensePlate}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground font-mono">
                                        {req.vehicleId.toString().slice(0, 8)}…
                                      </span>
                                    )}
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
                                    <div className="flex flex-col gap-1.5">
                                      <AdminPrintQRButton
                                        req={req}
                                        vehicleMap={vehicleMap}
                                      />
                                      {req.status === "pending" ? (
                                        <MarkShippedDialog req={req} />
                                      ) : req.status === "shipped" ? (
                                        <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          Shipped
                                        </span>
                                      ) : null}
                                    </div>
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

            <TabsContent value="qrcodes">
              <AdminQRCodesTab />
            </TabsContent>

            <TabsContent value="stripe">
              <StripeConfigPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
