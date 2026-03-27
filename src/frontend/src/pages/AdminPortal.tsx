import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { printQRCode } from "@/components/PrintQRButton";
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
  ShieldOff,
  Tag,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  AdminStats,
  PromoCode,
  StickerRequest,
  UserSummary,
  Vehicle,
} from "../backend.d";
import {
  useDeactivatePromoCode,
  useGeneratePromoCode,
  useGetAdminStats,
  useGetAllStickerRequests,
  useGetAllUsers,
  useGetAllVehicles,
  useIsCallerAdmin,
  useListPromoCodes,
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
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (vehicle) {
          printQRCode({
            vehicleId: req.vehicleId.toString(),
            vehicleName: vehicle.name,
            licensePlate: vehicle.licensePlate,
          });
        }
      }}
      className="border-primary/40 text-primary hover:bg-teal-light gap-1.5 text-xs"
      data-ocid="admin.secondary_button"
    >
      <Printer className="w-3 h-3" />
      Print QR
    </Button>
  );
}

function printPromoCard(code: PromoCode) {
  const discount = Number(code.discountPercent);
  const discountLabel =
    discount === 100
      ? "100% OFF — 1 Year Free Subscription"
      : `${discount}% OFF Subscription`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Promo Code — ${code.code}</title>
        <style>
          @page { size: 3.5in 2in; margin: 0; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { width: 3.5in; height: 2in; display: flex; align-items: center; justify-content: center; font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; }
          .card { width: 3.5in; height: 2in; padding: 14px 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border: 2px solid #2AAEA7; border-radius: 8px; text-align: center; background: #fff; }
          .logo { height: 28px; object-fit: contain; }
          .code { font-size: 22px; font-weight: 900; letter-spacing: 3px; color: #1a2540; font-family: 'Courier New', monospace; background: #e8f8f7; padding: 4px 12px; border-radius: 4px; }
          .discount { font-size: 11px; font-weight: 700; color: #2AAEA7; text-transform: uppercase; letter-spacing: 0.5px; }
          .desc { font-size: 10px; color: #666; }
          .url { font-size: 9px; color: #1a2540; font-weight: 600; margin-top: 2px; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="card">
          <img src="/assets/image-019d21e8-c67a-74dd-a137-fcd8265741f1.png" class="logo" alt="ScanLink" />
          <div class="code">${code.code}</div>
          <div class="discount">${discountLabel}</div>
          <div class="desc">${code.description || ""}</div>
          <div class="url">www.scanlink.app</div>
        </div>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

function DeactivatePromoButton({ code }: { code: PromoCode }) {
  const { mutateAsync, isPending } = useDeactivatePromoCode();
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isPending || !code.isActive}
      onClick={async () => {
        try {
          await mutateAsync(code.id);
          toast.success(`Promo code ${code.code} deactivated.`);
        } catch {
          toast.error("Failed to deactivate promo code.");
        }
      }}
      data-ocid="admin.delete_button"
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Deactivate"}
    </Button>
  );
}

function AdminPromoCodesTab() {
  const [codeStr, setCodeStr] = useState("");
  const [discountPct, setDiscountPct] = useState(100);
  const [description, setDescription] = useState("1 year free subscription");
  const [maxUses, setMaxUses] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const { mutateAsync: generate, isPending: generating } =
    useGeneratePromoCode();
  const { data: promoCodes, isLoading: codesLoading } = useListPromoCodes();

  function generateRandomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 8; i++)
      result += chars[Math.floor(Math.random() * chars.length)];
    setCodeStr(result);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const makeRandom = () => {
        let r = "";
        for (let i = 0; i < 8; i++)
          r += chars[Math.floor(Math.random() * chars.length)];
        return r;
      };
      const codes =
        quantity === 1
          ? [codeStr.trim().toUpperCase() || makeRandom()]
          : Array.from({ length: quantity }, makeRandom);
      for (const c of codes) {
        await generate({
          code: c,
          discountPercent: BigInt(discountPct),
          description: description.trim(),
          maxUses: BigInt(maxUses),
        });
      }
      toast.success(
        quantity === 1
          ? "Promo code created!"
          : `${quantity} promo codes created!`,
      );
      setCodeStr("");
    } catch {
      toast.error("Failed to generate promo code(s).");
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border shadow-card">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-9 h-9 bg-teal-light rounded-xl flex items-center justify-center">
              <Tag className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-navy">Generate Promo Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="promo-code" className="text-navy font-medium">
                    Promo Code
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="promo-code"
                      placeholder={
                        quantity > 1
                          ? "Leave blank for random codes"
                          : "e.g. WELCOME2024"
                      }
                      value={codeStr}
                      onChange={(e) => setCodeStr(e.target.value.toUpperCase())}
                      className="font-mono font-bold tracking-widest"
                      data-ocid="admin.input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateRandomCode}
                      className="shrink-0 border-primary/40 text-primary hover:bg-teal-light"
                      data-ocid="admin.secondary_button"
                    >
                      Random
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="promo-discount"
                    className="text-navy font-medium"
                  >
                    Discount %
                  </Label>
                  <Input
                    id="promo-discount"
                    type="number"
                    min={1}
                    max={100}
                    value={discountPct}
                    onChange={(e) =>
                      setDiscountPct(
                        Math.min(100, Math.max(1, Number(e.target.value))),
                      )
                    }
                    data-ocid="admin.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="promo-qty" className="text-navy font-medium">
                    Quantity
                  </Label>
                  <Input
                    id="promo-qty"
                    type="number"
                    min={1}
                    max={50}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.min(50, Math.max(1, Number(e.target.value))),
                      )
                    }
                    data-ocid="admin.input"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="promo-desc" className="text-navy font-medium">
                    Description
                  </Label>
                  <Input
                    id="promo-desc"
                    placeholder="1 year free subscription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    data-ocid="admin.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="promo-maxuses"
                    className="text-navy font-medium"
                  >
                    Max Uses
                  </Label>
                  <Input
                    id="promo-maxuses"
                    type="number"
                    min={1}
                    value={maxUses}
                    onChange={(e) =>
                      setMaxUses(Math.max(1, Number(e.target.value)))
                    }
                    data-ocid="admin.input"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={generating || (quantity === 1 && !codeStr.trim())}
                className="bg-primary text-white hover:bg-primary/90"
                data-ocid="admin.primary_button"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Tag className="mr-2 h-4 w-4" />
                    Generate {quantity > 1 ? `${quantity} Codes` : "Code"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border shadow-card">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-9 h-9 bg-teal-light rounded-xl flex items-center justify-center">
              <Tag className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-navy">All Promo Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {codesLoading ? (
              <div className="space-y-3" data-ocid="admin.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : !promoCodes || promoCodes.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                No promo codes generated yet.
              </div>
            ) : (
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...(promoCodes as PromoCode[])]
                    .sort((a, b) => Number(b.createdAt - a.createdAt))
                    .map((code, idx) => (
                      <TableRow
                        key={code.id.toString()}
                        data-ocid={`admin.row.${idx + 1}`}
                      >
                        <TableCell>
                          <span className="font-mono text-xs font-bold text-navy tracking-widest bg-muted px-2 py-1 rounded">
                            {code.code}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-teal-light text-primary border-primary/20">
                            {Number(code.discountPercent)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {code.description}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {Number(code.usedCount)} / {Number(code.maxUses)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              code.isActive
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {code.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatTime(code.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => printPromoCard(code)}
                              className="border-primary/40 text-primary hover:bg-teal-light gap-1.5"
                              data-ocid="admin.secondary_button"
                            >
                              <Printer className="w-3 h-3" />
                              Print
                            </Button>
                            {code.isActive && (
                              <DeactivatePromoButton code={code} />
                            )}
                          </div>
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
              title="Promo Codes"
              value={(stats as AdminStats | undefined)?.totalPromoCodes}
              icon={Tag}
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
              <TabsTrigger value="promocodes" data-ocid="admin.tab">
                Promo Codes
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

            <TabsContent value="promocodes">
              <AdminPromoCodesTab />
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
