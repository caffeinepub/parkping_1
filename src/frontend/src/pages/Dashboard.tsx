import AddVehicleDialog from "@/components/AddVehicleDialog";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProfileSetup from "@/components/ProfileSetup";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Car, ChevronRight, LogIn, MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import type { Vehicle } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetMyVehicles,
  useGetUnreadMessages,
} from "../hooks/useQueries";

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

export default function Dashboard() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { data: vehicles, isLoading: vehiclesLoading } = useGetMyVehicles();
  const { data: unreadMessages = [] } = useGetUnreadMessages();
  const {
    isLoading: profileLoading,
    isFetched: profileFetched,
    data: userProfile,
  } = useGetCallerUserProfile();

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
              Access your vehicle dashboard and manage QR codes.
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

      <main
        className="flex-1 pt-20 pb-16 px-4 sm:px-6"
        data-ocid="dashboard.section"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 mt-6">
            <div>
              <h1 className="text-3xl font-bold text-navy">Your Vehicles</h1>
              <p className="text-muted-foreground mt-1">
                {userProfile
                  ? `Welcome back, ${(userProfile as any).name}`
                  : "Manage your registered vehicles and QR codes"}
              </p>
            </div>
            <AddVehicleDialog />
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
                <Car className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-navy mb-2">
                No vehicles yet
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                Register your first vehicle to get a QR code sticker for your
                windshield.
              </p>
              <AddVehicleDialog />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((vehicle: Vehicle, idx: number) => (
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
                          <Car className="w-5 h-5 text-primary" />
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
                          <p className="text-xs text-muted-foreground font-mono">
                            {vehicle.licensePlate}
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/dashboard/vehicle/$id"
                        params={{ id: vehicle.id.toString() }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-primary"
                          data-ocid={`dashboard.edit_button.${idx + 1}`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </Link>
                    </div>

                    {vehicle.description && (
                      <p className="text-sm text-muted-foreground mb-5 line-clamp-2">
                        {vehicle.description}
                      </p>
                    )}

                    <div className="flex items-end justify-between gap-4">
                      <div className="flex-1">
                        <QRCodeDisplay
                          url={`${window.location.origin}/message/${vehicle.id.toString()}`}
                          size={120}
                          label="Scan to leave a message"
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
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
