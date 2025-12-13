import React, { useState } from "react";
import {
  LayoutGrid,
  Package,
  FileText,
  Map,
  BarChart3,
  Calendar,
  Gift,
  CircleDot,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ModernSidebar = () => {
  const [activeItem, setActiveItem] = useState("overview");
  const [openSections, setOpenSections] = useState(["dashboard"]);

  const toggleSection = (id) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const menuItems = [
    {
      id: "dashboard",
      icon: LayoutGrid,
      label: "DASHBOARD",
      hasSubmenu: true,
      submenuItems: [
        { id: "overview", label: "Overview" },
        { id: "stats", label: "Stats" },
      ],
    },
    {
      id: "components",
      icon: Package,
      label: "COMPONENTS",
    },
    {
      id: "forms",
      icon: FileText,
      label: "FORMS",
    },
    {
      id: "tableList",
      icon: LayoutGrid,
      label: "TABLE LIST",
    },
    {
      id: "maps",
      icon: Map,
      label: "MAPS",
    },
    {
      id: "charts",
      icon: BarChart3,
      label: "CHARTS",
    },
    {
      id: "calendar",
      icon: Calendar,
      label: "CALENDAR",
    },
    {
      id: "pages",
      icon: Gift,
      label: "PAGES",
    },
  ];

  return (
    <Sidebar className="border-r-0 bg-[#1a1a1a]">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-gray-800 px-4 py-5">
        <h1 className="text-base font-normal tracking-[0.15em] text-white/90 uppercase">
          CREATIVE TIM
        </h1>
      </SidebarHeader>

      {/* User Profile Section */}
      {/* <div className="border-b border-gray-800 px-4 py-4">
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800/30 rounded-lg p-2 transition-colors">
          <Avatar className="h-10 w-10 border-2 border-gray-700">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Chet" />
            <AvatarFallback className="bg-gray-700 text-white text-sm">
              CF
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Chet Faker</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div> */}

      {/* Menu Content */}
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  {item.hasSubmenu ? (
                    <Collapsible
                      open={openSections.includes(item.id)}
                      onOpenChange={() => toggleSection(item.id)}
                      className="group/collapsible"
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={`h-11 text-xs font-medium tracking-wider transition-all rounded-md ${
                            activeItem === item.id ||
                            item.submenuItems?.some(
                              (sub) => sub.id === activeItem
                            )
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                              : "text-gray-400 hover:bg-gray-800/40 hover:text-white"
                          }`}
                        >
                          <item.icon className="h-[18px] w-[18px]" />
                          <span>{item.label}</span>
                          <ChevronRight
                            className={`ml-auto h-4 w-4 transition-transform ${
                              openSections.includes(item.id) ? "rotate-90" : ""
                            }`}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1">
                        <SidebarMenuSub className="border-l-0 ml-4 space-y-1">
                          {item.submenuItems?.map((subitem) => (
                            <SidebarMenuSubItem key={subitem.id}>
                              <SidebarMenuSubButton
                                onClick={() => setActiveItem(subitem.id)}
                                className={`h-9 text-xs transition-all rounded-md pl-8 relative ${
                                  activeItem === subitem.id
                                    ? "bg-orange-500/80 text-white"
                                    : "text-gray-500 hover:bg-gray-800/40 hover:text-gray-300"
                                }`}
                              >
                                <CircleDot className="h-2 w-2 absolute left-4" />
                                <span>{subitem.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      onClick={() => setActiveItem(item.id)}
                      className={`h-11 text-xs font-medium tracking-wider transition-all rounded-md ${
                        activeItem === item.id
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                          : "text-gray-400 hover:bg-gray-800/40 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default ModernSidebar;
