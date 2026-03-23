import { Toaster } from "@/components/ui/sonner";
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
  redirect,
} from "@tanstack/react-router";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

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

const routeTree = rootRoute.addChildren([
  landingRoute,
  dashboardRoute,
  vehicleMessagesRoute,
  publicMessageRoute,
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
