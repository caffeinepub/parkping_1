import AddVehicleDialog from "@/components/AddVehicleDialog";
import EditObjectDialog from "@/components/EditObjectDialog";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PrintQRButton from "@/components/PrintQRButton";
import ProfileSetup from "@/components/ProfileSetup";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import RequestStickerDialog from "@/components/RequestStickerDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Bike,
  Briefcase,
  Car,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Info,
  Key,
  Laptop,
  Loader2,
  LogIn,
  MessageSquare,
  PawPrint,
  Pencil,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfileFull, Vehicle } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { usePushNotifications } from "../hooks/usePushNotifications";
import {
  useDeleteVehicle,
  useGetCallerUserProfile,
  useGetMyVehicles,
  useGetUnreadMessages,
  useGetVehicleCategories,
  useUpdateCallerUserProfile,
} from "../hooks/useQueries";

function getCategoryIcon(category: string) {
  switch (category) {
    case "Bicycle / Scooter":
      return Bike;
    case "Pet / Animal":
      return PawPrint;
    case "Luggage / Bag":
      return Briefcase;
    case "Electronics":
      return Laptop;
    case "Keys / Personal Item":
      return Key;
    case "Vehicle":
      return Car;
    default:
      return Tag;
  }
}

function UnreadBadge({
  vehicleId,
  unreadMessages,
}: { vehicleId: bigint; unreadMessages: any[] }) {
  const count = unreadMessages.filter((m) => m.vehicleId === vehicleId).length;
  if (!count) return null;
  return (
    <Badge className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
      {count}
    </Badge>
  );
}

function orNull(val: string): string | null {
  return val.trim() === "" ? null : val.trim();
}

function ProfileEditor({ profile }: { profile: UserProfileFull }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(profile.name ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [addressLine1, setAddressLine1] = useState(profile.addressLine1 ?? "");
  const [addressLine2, setAddressLine2] = useState(profile.addressLine2 ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [stateProvince, setStateProvince] = useState(
    profile.stateProvince ?? "",
  );
  const [postcode, setPostcode] = useState(profile.postcode ?? "");
  const [country, setCountry] = useState(profile.country ?? "");

  const updateProfile = useUpdateCallerUserProfile();

  useEffect(() => {
    setName(profile.name ?? "");
    setEmail(profile.email ?? "");
    setPhone(profile.phone ?? "");
    setAddressLine1(profile.addressLine1 ?? "");
    setAddressLine2(profile.addressLine2 ?? "");
    setCity(profile.city ?? "");
    setStateProvince(profile.stateProvince ?? "");
    setPostcode(profile.postcode ?? "");
    setCountry(profile.country ?? "");
  }, [profile]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }
    updateProfile.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        phone: orNull(phone),
        addressLine1: orNull(addressLine1),
        addressLine2: orNull(addressLine2),
        city: orNull(city),
        stateProvince: orNull(stateProvince),
        postcode: orNull(postcode),
        country: orNull(country),
      },
      {
        onSuccess: () => toast.success("Profile updated successfully!"),
        onError: () =>
          toast.error("Failed to update profile. Please try again."),
      },
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-border shadow-card overflow-hidden mt-8"
      data-ocid="profile.card"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/30 transition-colors"
        data-ocid="profile.toggle"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-light rounded-xl flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy">My Profile</h2>
            <p className="text-sm text-muted-foreground">
              Update your name, email, phone and mailing address
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="profile-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <form onSubmit={handleSubmit} className="px-6 pb-6">
              <div className="border-t border-border mb-6" />

              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">
                Personal Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="profile-name"
                    className="text-navy font-medium"
                  >
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    data-ocid="profile.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="profile-email"
                    className="text-navy font-medium"
                  >
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    data-ocid="profile.input"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label
                    htmlFor="profile-phone"
                    className="text-navy font-medium"
                  >
                    Phone Number
                    <span className="text-muted-foreground font-normal ml-1 text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    data-ocid="profile.input"
                  />
                </div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">
                Mailing Address
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label
                    htmlFor="profile-addr1"
                    className="text-navy font-medium"
                  >
                    Address Line 1
                  </Label>
                  <Input
                    id="profile-addr1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="123 Main Street"
                    data-ocid="profile.input"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label
                    htmlFor="profile-addr2"
                    className="text-navy font-medium"
                  >
                    Address Line 2
                  </Label>
                  <Input
                    id="profile-addr2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Apt, Suite, Unit…"
                    data-ocid="profile.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="profile-city"
                    className="text-navy font-medium"
                  >
                    City
                  </Label>
                  <Input
                    id="profile-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    data-ocid="profile.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="profile-state"
                    className="text-navy font-medium"
                  >
                    State / Province
                  </Label>
                  <Input
                    id="profile-state"
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    placeholder="NY"
                    data-ocid="profile.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="profile-postcode"
                    className="text-navy font-medium"
                  >
                    Postcode / ZIP
                  </Label>
                  <Input
                    id="profile-postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="10001"
                    data-ocid="profile.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="profile-country"
                    className="text-navy font-medium"
                  >
                    Country
                  </Label>
                  <Input
                    id="profile-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    data-ocid="profile.input"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="bg-primary text-white hover:bg-primary/90 rounded-full px-8"
                  data-ocid="profile.save_button"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Dashboard() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { data: vehicles, isLoading: vehiclesLoading } = useGetMyVehicles();
  const { data: unreadMessages = [] } = useGetUnreadMessages();
  const { data: categoryMap } = useGetVehicleCategories();
  const deleteVehicle = useDeleteVehicle();
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const {
    isLoading: profileLoading,
    isFetched: profileFetched,
    data: userProfile,
  } = useGetCallerUserProfile();

  usePushNotifications(unreadMessages.length);

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pt-16">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-teal-light rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-navy mb-3">
              Sign in to continue
            </h1>
            <p className="text-muted-foreground mb-8">
              Access your objects and manage QR codes.
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="bg-primary text-white hover:bg-primary/90 w-full rounded-full"
              data-ocid="dashboard.button"
            >
              {isLoggingIn ? "Signing in…" : "Sign In with Internet Identity"}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <ProfileSetup open={showProfileSetup} />
      {editingVehicle && (
        <EditObjectDialog
          open={!!editingVehicle}
          onOpenChange={(val) => {
            if (!val) setEditingVehicle(null);
          }}
          vehicle={editingVehicle}
          currentCategory={
            categoryMap?.get(editingVehicle.id.toString()) ?? "Other"
          }
        />
      )}

      <main
        className="flex-1 pt-20 pb-16 px-4 sm:px-6"
        data-ocid="dashboard.section"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-6">
            <div>
              <h1 className="text-3xl font-bold text-navy">My Objects</h1>
              <p className="text-muted-foreground mt-1">
                {userProfile
                  ? `Welcome back, ${(userProfile as UserProfileFull).name}`
                  : "Manage your registered objects and QR codes"}
              </p>
            </div>
            <AddVehicleDialog />
          </div>

          <div className="flex items-center gap-2 bg-teal-light/40 border border-primary/15 rounded-xl px-4 py-2.5 mb-8 text-sm text-muted-foreground">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>
              Subscriptions:{" "}
              <span className="font-semibold text-navy">$9.99/yr</span> per
              account — up to{" "}
              <span className="font-semibold text-navy">
                10 Digital Identities
              </span>
              .
            </span>
          </div>

          {vehiclesLoading ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              data-ocid="dashboard.loading_state"
            >
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : !vehicles || vehicles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 bg-white rounded-2xl border border-border shadow-card"
              data-ocid="dashboard.empty_state"
            >
              <div className="w-16 h-16 bg-teal-light rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Tag className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-navy mb-2">
                No objects yet
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                Create your first Digital ID to get a QR code sticker.
              </p>
              <AddVehicleDialog />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((vehicle: Vehicle, idx: number) => {
                const CategoryIcon = getCategoryIcon(
                  categoryMap?.get(vehicle.id.toString()) ?? "",
                );
                return (
                  <motion.div
                    key={vehicle.id.toString()}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="bg-white rounded-2xl border border-border shadow-card overflow-hidden"
                    data-ocid={`dashboard.item.${idx + 1}`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-light rounded-xl flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-navy">
                                {vehicle.name}
                              </h3>
                              <UnreadBadge
                                vehicleId={vehicle.id}
                                unreadMessages={unreadMessages}
                              />
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {categoryMap?.get(vehicle.id.toString()) && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                  {categoryMap?.get(vehicle.id.toString())}
                                </span>
                              )}
                              {vehicle.licensePlate && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  {vehicle.licensePlate}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-primary"
                            onClick={() => setEditingVehicle(vehicle)}
                            title="Edit Digital Identity"
                            data-ocid={`dashboard.edit_button.${idx + 1}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Link
                            to="/dashboard/vehicle/$id"
                            params={{ id: vehicle.id.toString() }}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {vehicle.description && (
                        <p className="text-sm text-muted-foreground mb-5 line-clamp-2">
                          {vehicle.description}
                        </p>
                      )}

                      <div className="flex items-end justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <QRCodeDisplay
                            url={`${window.location.origin}/message/${vehicle.id.toString()}`}
                            size={120}
                            label="Scan to message owner"
                          />
                        </div>
                        <Link
                          to="/dashboard/vehicle/$id"
                          params={{ id: vehicle.id.toString() }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary/5 gap-2"
                            data-ocid={`dashboard.secondary_button.${idx + 1}`}
                          >
                            <MessageSquare className="w-4 h-4" />
                            Messages
                            <UnreadBadge
                              vehicleId={vehicle.id}
                              unreadMessages={unreadMessages}
                            />
                          </Button>
                        </Link>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-border">
                        <PrintQRButton
                          vehicleName={vehicle.name}
                          licensePlate={vehicle.licensePlate}
                          vehicleId={vehicle.id.toString()}
                          className="flex-1 border-border text-foreground hover:text-primary hover:border-primary"
                        />
                        <RequestStickerDialog
                          vehicleId={vehicle.id}
                          vehicleName={vehicle.name}
                          userProfile={userProfile as UserProfileFull | null}
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 px-2"
                              data-ocid={`dashboard.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent data-ocid="dashboard.dialog">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Digital Identity?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This Digital Identity will be permanently
                                deleted and your QR code will stop working. You
                                will need to create a new Digital ID and
                                generate a new QR code if needed. This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="dashboard.cancel_button">
                                Keep It
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                data-ocid="dashboard.confirm_button"
                                onClick={async () => {
                                  await deleteVehicle.mutateAsync(vehicle.id);
                                  toast.success("Digital Identity deleted.");
                                }}
                              >
                                Delete Permanently
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {isAuthenticated &&
            userProfile !== null &&
            userProfile !== undefined && (
              <ProfileEditor profile={userProfile as UserProfileFull} />
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
