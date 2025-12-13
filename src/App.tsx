import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { TranslationProvider } from "@/contexts/TranslationContext";
import LazyLoader from "@/components/ui/LazyLoader";
import "./App.css";
import AppLayout from "./components/AppLayout";

// Lazy load all page components
const Home = lazy(() => import("./pages/Home"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const HotelDetails = lazy(() => import("./pages/HotelDetails"));
const Reserve = lazy(() => import("./pages/Reserve"));
const Booking = lazy(() => import("./pages/Booking"));
const Profile = lazy(() => import("./pages/Profile"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Account = lazy(() => import("./pages/Account"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const Destinations = lazy(() => import("./pages/Destinations"));
const DestinationDetail = lazy(() => import("./pages/DestinationDetail"));
const DestinationDynamic = lazy(() => import("./pages/DestinationDynamic"));
const Deals = lazy(() => import("./pages/Deals"));
const NotFound = lazy(() => import("./pages/NotFound"));
const HotelCodeTester = lazy(() => import("./components/HotelCodeTester"));
const ApiTest = lazy(() => import("./components/ApiTest"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailure = lazy(() => import("./pages/PaymentFailure"));
const PaymentCancelled = lazy(() => import("./pages/PaymentCancelled"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

const queryClient = new QueryClient();

// Component to handle scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TranslationProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<LazyLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/hotel/:id" element={<HotelDetails />} />
            <Route path="/reserve/:id" element={<Reserve />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/account" element={<Account />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route
              path="/destination/:destination"
              element={<DestinationDynamic />}
            />
            <Route path="/deals" element={<Deals />} />
            <Route path="/test-hotel-codes" element={<HotelCodeTester />} />
            <Route path="/api-test" element={<ApiTest />} />
            {/* Payment Routes */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/payment/cancelled" element={<PaymentCancelled />} />
            <Route path="*" element={<NotFound />} />
            <Route element={<AppLayout />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </TranslationProvider>
  </QueryClientProvider>
);

export default App;
