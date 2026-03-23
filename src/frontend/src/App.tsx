import { Toaster } from "@/components/ui/sonner";
import AdminPortal from "@/pages/AdminPortal";
import Dashboard from "@/pages/Dashboard";
import LandingPage from "@/pages/LandingPage";
import PublicMessagePage from "@/pages/PublicMessagePage";
import VehicleMessages from "@/pages/VehicleMessages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
});

const vehicleMessagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/vehicle/$id",
  component: VehicleMessages,
});

const publicMessageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/message/$vehicleId",
  component: PublicMessagePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPortal,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  dashboardRoute,
  vehicleMessagesRoute,
  publicMessageRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
