import React, { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import SiteHeader from "./ui/SiteHeader";
import ModernSidebar from "./ModernSidebar";

const AppLayout = ({ isAdmin = false, children }) => {
  const [currentPage, setCurrentPage] = useState("/");

  const handleNavigation = (href) => {
    setCurrentPage(href);
    // Add your routing logic here
    console.log("Navigating to:", href);
  };

  return (
    <SidebarProvider>
      <div className="flex flex-col w-full min-h-screen">
        {/* Header - Fixed at top */}
        <SiteHeader onNavigate={handleNavigation} />

        {/* Content area with sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <ModernSidebar />

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-white">
            {children || (
              <div className="p-8">
                <div className="mx-auto max-w-6xl">
                  <h2 className="mb-6 text-3xl font-light text-gray-800">
                    Dashboard Overview
                  </h2>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                      <h3 className="mb-2 text-sm text-gray-600">
                        Total Bookings
                      </h3>
                      <p className="text-3xl font-bold text-gray-800">1,234</p>
                      <p className="text-xs text-green-600 mt-2">
                        ↑ 12% from last month
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                      <h3 className="mb-2 text-sm text-gray-600">Revenue</h3>
                      <p className="text-3xl font-bold text-gray-800">
                        $45,678
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        ↑ 8% from last month
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                      <h3 className="mb-2 text-sm text-gray-600">
                        Active Hotels
                      </h3>
                      <p className="text-3xl font-bold text-gray-800">156</p>
                      <p className="text-xs text-blue-600 mt-2">→ No change</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                      <h3 className="mb-2 text-sm text-gray-600">
                        Occupancy Rate
                      </h3>
                      <p className="text-3xl font-bold text-gray-800">78%</p>
                      <p className="text-xs text-green-600 mt-2">
                        ↑ 5% from last month
                      </p>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <p className="font-medium text-gray-800">
                            New booking received
                          </p>
                          <p className="text-sm text-gray-500">
                            Grand Plaza Hotel - Room 305
                          </p>
                        </div>
                        <span className="text-sm text-gray-400">
                          5 mins ago
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <p className="font-medium text-gray-800">
                            Payment confirmed
                          </p>
                          <p className="text-sm text-gray-500">
                            Booking #12345 - $250
                          </p>
                        </div>
                        <span className="text-sm text-gray-400">
                          12 mins ago
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <p className="font-medium text-gray-800">
                            New hotel registered
                          </p>
                          <p className="text-sm text-gray-500">
                            Sunset Beach Resort
                          </p>
                        </div>
                        <span className="text-sm text-gray-400">
                          1 hour ago
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-gray-800">
                            Guest check-in
                          </p>
                          <p className="text-sm text-gray-500">
                            Marina Bay Hotel - Room 201
                          </p>
                        </div>
                        <span className="text-sm text-gray-400">
                          2 hours ago
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Section */}
                  <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Top Performing Hotels
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">
                            Grand Plaza Hotel
                          </span>
                          <span className="font-semibold text-gray-800">
                            95%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">
                            Marina Bay Resort
                          </span>
                          <span className="font-semibold text-gray-800">
                            89%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">
                            Sunset Beach Hotel
                          </span>
                          <span className="font-semibold text-gray-800">
                            87%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Quick Actions
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                          <p className="font-medium text-gray-800">Add Hotel</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Register new property
                          </p>
                        </button>
                        <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                          <p className="font-medium text-gray-800">
                            New Booking
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Create reservation
                          </p>
                        </button>
                        <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                          <p className="font-medium text-gray-800">Reports</p>
                          <p className="text-xs text-gray-500 mt-1">
                            View analytics
                          </p>
                        </button>
                        <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                          <p className="font-medium text-gray-800">Settings</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Configure system
                          </p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
