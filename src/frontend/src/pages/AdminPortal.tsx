import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Car, MessageSquare, ShieldOff, Users } from "lucide-react";
import { motion } from "motion/react";
import type { AdminStats, UserSummary } from "../backend.d";
import {
  useGetAdminStats,
  useGetAllUsers,
  useIsCallerAdmin,
} from "../hooks/useQueries";

function truncatePrincipal(principal: string): string {
  if (principal.length <= 14) return principal;
  return `${principal.slice(0, 8)}...${principal.slice(-4)}`;
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

export default function AdminPortal() {
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: stats } = useGetAdminStats();
  const { data: users, isLoading: usersLoading } = useGetAllUsers();

  if (adminCheckLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 pb-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto mt-6">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {[1, 2, 3].map((i) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
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
          </div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-navy">All Users</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-3" data-ocid="admin.loading_state">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
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
                        <TableHead className="text-right">Vehicles</TableHead>
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
