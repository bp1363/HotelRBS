import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  User,
  Globe,
  LogIn,
  UserPlus,
  Settings,
  HelpCircle,
  Home,
  Building2,
  Calendar,
  Heart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { SidebarTrigger } from "@/components/ui/sidebar";

const SiteHeader = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const [currentPage, setCurrentPage] = useState("/");

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
  ];

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Hotels", href: "/hotels", icon: Building2 },
    { name: "Bookings", href: "/bookings", icon: Calendar },
    { name: "Favorites", href: "/favorites", icon: Heart },
  ];

  const handleLanguageChange = (language) => {
    setCurrentLanguage(language.name);
  };

  const handleNavigation = (href) => {
    setCurrentPage(href);
    if (onNavigate) onNavigate(href);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      setIsCompact(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              isCompact ? "h-14" : isScrolled ? "h-16" : "h-20"
            }`}
          >
            {/* Left Side - Sidebar Trigger, Language Selector, Profile Menu & Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* Sidebar Trigger - Only visible on larger screens */}
              <SidebarTrigger className="hidden lg:flex" />
              {/* Language Selector */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex hover:bg-muted/80 transition-all duration-200 rounded-full shadow-sm hover:shadow-md"
                      >
                        <Globe className="h-5 w-5" />
                        <span className="ml-1 text-sm font-medium">EN</span>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select Language</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent
                  align="end"
                  className="z-[10000] bg-background border shadow-lg"
                >
                  {languages.map((language) => (
                    <DropdownMenuItem
                      key={language.code}
                      onClick={() => handleLanguageChange(language)}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <span>{language.flag}</span>
                      <span>{language.name}</span>
                      {currentLanguage === language.name && (
                        <div className="ml-auto h-2 w-2 bg-primary rounded-full" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-2 border border-border rounded-full p-2 hover:shadow-xl transition-all duration-300 cursor-pointer group bg-background/90 backdrop-blur-sm hover:bg-background hover:scale-105 active:scale-95">
                    <Menu className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-all duration-300 group-hover:rotate-180" />
                    <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                      <User className="h-4 w-4 text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 bg-background border shadow-xl rounded-xl p-2 z-[10000]"
                >
                  <div className="py-2">
                    <DropdownMenuItem
                      onClick={() => {
                        setIsLogin(true);
                        setShowLoginDialog(true);
                      }}
                      className="flex items-center space-x-3 cursor-pointer px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <LogIn className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Log in</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setIsLogin(false);
                        setShowLoginDialog(true);
                      }}
                      className="flex items-center space-x-3 cursor-pointer px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <UserPlus className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Sign up</span>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                  <div className="py-2">
                    <DropdownMenuItem
                      onClick={() => handleNavigation("/account")}
                      className="flex items-center space-x-3 cursor-pointer px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span>Your account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center space-x-3 cursor-pointer px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                      onClick={() => handleNavigation('/profile')}
                    >
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span>Your bookings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center space-x-3 cursor-pointer px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                      onClick={() => navigate('/account-settings')}
                    >
                      <Settings className="h-5 w-5 text-muted-foreground" />
                      <span>Account settings</span>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                  <div className="py-2">
                    <DropdownMenuItem className="flex items-center space-x-3 cursor-pointer px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                      <span>Help Centre</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[300px] bg-white/95 backdrop-blur-md"
                >
                  <div className="flex flex-col space-y-6 mt-8">
                    <nav className="space-y-2">
                      {navigation.map((item) => (
                        <button
                          key={item.name}
                          className="w-full text-left flex items-center space-x-3 text-lg font-medium text-gray-700 hover:text-primary transition-all duration-300 p-4 rounded-xl hover:bg-white/80 group"
                          onClick={() => {
                            handleNavigation(item.href);
                            setIsOpen(false);
                          }}
                        >
                          <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </nav>

                    <div className="border-t pt-6 space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-center rounded-xl h-12 border-2"
                        onClick={() => {
                          setIsLogin(false);
                          setShowLoginDialog(true);
                          setIsOpen(false);
                        }}
                      >
                        Sign up
                      </Button>
                      <Button
                        className="w-full justify-center rounded-xl h-12"
                        onClick={() => {
                          setIsLogin(true);
                          setShowLoginDialog(true);
                          setIsOpen(false);
                        }}
                      >
                        Log in
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Right Side - Logo */}
            <div
              onClick={() => handleNavigation("/")}
              className="flex items-center group cursor-pointer flex-shrink-0"
            >
              <img
                src="../public/logo-icon.png"
                alt="Logo"
                className="h-24 w-24 object-contain group-hover:scale-105 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default SiteHeader;
