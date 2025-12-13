import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Menu,
  User,
  Globe,
  ChevronDown,
  Home,
  MapPin,
  Tag,
  LogIn,
  UserPlus,
  HelpCircle,
  Settings,
  Search,
  LogOut,
  Calendar,
  Heart,
} from "lucide-react";
import homeIcon from "@/assets/home-icon.png";
import destinationIcon from "@/assets/destination-icon.png";
import dealsIcon from "@/assets/deals-icon.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewCustomSearchBar from "@/components/NewCustomSearchBar";
import SearchFilters from "@/components/SearchFilters";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, Map } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { MobileAvailabilitySearchBar } from "@/components/MobileAvailabilitySearchBar";
import { CountryCodeSelector } from "@/components/CountryCodeSelector";
import { NATIONALITIES, DEFAULT_NATIONALITY } from "@/config/nationalities";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/config/currencies";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useTranslation } from "@/contexts/TranslationContext";

interface HeaderProps {
  variant?: "default" | "compact";
}

const Header = ({ variant = "default" }: HeaderProps) => {
  console.log("Header component is rendering");
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
  ];
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const storedLang = localStorage.getItem("language") || "en";
    const langObj = languages.find(l => l.code === storedLang);
    return langObj?.name || "English";
  });
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [countryCode, setCountryCode] = useState("+971");
  const [nationality, setNationality] = useState<string>(() => {
    return localStorage.getItem("selectedNationality") || DEFAULT_NATIONALITY;
  });
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem("selectedCurrency") || DEFAULT_CURRENCY;
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isHomePage = location.pathname === "/";
  const isHotelDetailsPage = location.pathname.startsWith("/hotel/");
  const isCompact = variant === "compact";
  
  // Get search params for hotel details page
  const checkIn = isHotelDetailsPage ? searchParams.get("checkIn") : null;
  const checkOut = isHotelDetailsPage ? searchParams.get("checkOut") : null;
  const adults = isHotelDetailsPage ? parseInt(searchParams.get("adults") || "2") : 2;
  const children = isHotelDetailsPage ? parseInt(searchParams.get("children") || "0") : 0;
  const rooms = isHotelDetailsPage ? parseInt(searchParams.get("rooms") || "1") : 1;

  // Get navigation items with translations
  const navigation = [
    { name: t?.hotels || "Hotels", href: "/", icon: Home, customIcon: homeIcon },
    {
      name: t?.destinations || "Destinations",
      href: "/destinations",
      icon: MapPin,
      customIcon: destinationIcon,
    },
    { name: t?.deals || "Deals", href: "/deals", icon: Tag, customIcon: dealsIcon },
  ];

  const handleLanguageChange = (lang: {
    code: string;
    name: string;
    flag: string;
  }) => {
    setCurrentLanguage(lang.name);
    setLanguage(lang.code); // Use translation context
    // Direction is handled globally in TranslationContext - always LTR layout
  };

  // Sync currentLanguage with language from context
  useEffect(() => {
    const langObj = languages.find(l => l.code === language);
    if (langObj) {
      setCurrentLanguage(langObj.name);
    }
  }, [language]);

  // Note: Document direction is handled by TranslationContext

  const handleNationalityChange = (value: string) => {
    setNationality(value);
    localStorage.setItem("selectedNationality", value);
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent("nationalityChanged", { detail: value }));
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    localStorage.setItem("selectedCurrency", value);
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent("currencyChanged", { detail: value }));
  };

  const handleEmailPasswordLogin = async (email: string, password: string) => {
    try {
      console.log('🚀 Starting email + password login for:', email);
      
      // Import the auth service
      const { loginCustomer, generateBookingReference } = await import('../services/authApi');
      
      // Login with email and password
      const result = await loginCustomer(email, password);
      
      if (result.success) {
        // Store user data and token in localStorage
        localStorage.setItem('userData', JSON.stringify(result.data));
        if (result.token) {
          localStorage.setItem('authToken', result.token);
        }
        
        console.log('✅ Login successful');
        console.log('👤 User data:', result.data);
        
        // Close login dialog
        setShowLoginDialog(false);
        
        // Show success message
        alert(`Welcome back, ${result.data.first_name}! You're now logged in.`);
        
        // Optionally redirect or update UI
        window.location.reload(); // Refresh to show logged-in state
        
      } else {
        console.error('❌ Login failed:', result.message);
        alert(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleSignup = async (signupData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    age: number;
    nationality: string;
    gender: string;
    profile_url?: string;
    phone: string;
  }) => {
    try {
      console.log('🚀 Starting signup process for:', signupData.email);
      
      // Import the auth service
      const { signupCustomer, generateBookingReference } = await import('../services/authApi');
      
      // Signup with customer data
      const result = await signupCustomer(signupData);
      
      if (result.success) {
        // Store user data and token in localStorage
        localStorage.setItem('userData', JSON.stringify(result.data));
        if (result.token) {
          localStorage.setItem('authToken', result.token);
        }
        
        console.log('✅ Signup successful');
        console.log('👤 User data:', result.data);
        
        // Close login dialog
        setShowLoginDialog(false);
        
        // Show success message
        alert(`Welcome "${signupData.first_name}", your account has been created successfully with HotelRBS. Book seamless hotels worldwide with us. Thank you.`);
        
        // Optionally redirect or update UI
        window.location.reload(); // Refresh to show logged-in state
        
      } else {
        console.error('❌ Signup failed:', result.message);
        alert(result.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      alert('Signup failed. Please try again.');
    }
  };

  const handleEmailLogin = async (email: string) => {
    try {
      console.log('🚀 Starting email-only login for:', email);
      
      // Import the auth service
      const { getCustomerByEmail } = await import('../services/authApi');
      
      // Get customer data by email (without password)
      const result = await getCustomerByEmail(email);
      
      if (result.success) {
        // Store user data in localStorage
        localStorage.setItem('userData', JSON.stringify(result.data));
        
        console.log('✅ Email login successful');
        console.log('👤 User data:', result.data);
        
        // Close login dialog
        setShowLoginDialog(false);
        
        // Show success message
        alert(`Welcome back, ${result.data.first_name}! You're now logged in.`);
        
        // Optionally redirect or update UI
        window.location.reload(); // Refresh to show logged-in state
        
      } else {
        console.error('❌ Email login failed:', result.message);
        alert('Email not found. Please check your email or sign up first.');
      }
    } catch (error) {
      console.error('❌ Email login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for custom event to open login dialog (e.g., from Reserve button)
  useEffect(() => {
    const handleOpenLoginDialog = () => {
      setShowLoginDialog(true);
    };

    window.addEventListener('openLoginDialog', handleOpenLoginDialog);
    return () => window.removeEventListener('openLoginDialog', handleOpenLoginDialog);
  }, []);

  console.log("Header about to return JSX");
  return (
    <header
      className="fixed top-0 left-0 right-0 z-[9999] w-full transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-border/50 shadow-xl shadow-black/5"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        width: "100%",
        display: "block",
        visibility: "visible",
      }}
    >
      <div
        className={`w-full max-w-none transition-all duration-300 ${
          isCompact ? "px-4 lg:px-6" : "px-6 lg:px-12 xl:px-16"
        } ${isScrolled ? "py-2" : ""}`}
      >
        <div
          className={`flex items-center transition-all duration-300 ${
            isCompact ? "justify-start space-x-6 h-14" : "justify-between"
          } ${!isCompact && (isScrolled ? "h-16" : "h-20")}`}
        >
          {/* Left Side Actions - Language and Profile */}
          <div
            className={`flex items-center space-x-4 ${isCompact ? "ml-4" : ""} order-2 lg:order-1`}
          >
            {/* Language Selector - Now visible on mobile */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex hover:bg-muted/80 transition-all duration-200 rounded-pill shadow-sm hover:shadow-md"
                    >
                      <span className="text-sm font-medium uppercase">{language || "EN"}</span>
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
                    <span>{language.name}</span>
                    {currentLanguage === language.name && (
                      <div className="ml-auto h-2 w-2 bg-primary rounded-full" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency Selector - Next to Language */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex hover:bg-muted/80 transition-all duration-200 rounded-pill shadow-sm hover:shadow-md"
                    >
                      <span className="text-sm font-medium">
                        {CURRENCIES.find(c => c.code === currency)?.code || "USD"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select Currency</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent
                align="end"
                className="z-[10000] bg-background border shadow-lg max-h-[300px] overflow-y-auto"
              >
                {CURRENCIES.map((curr) => (
                  <DropdownMenuItem
                    key={curr.code}
                    onClick={() => handleCurrencyChange(curr.code)}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <span>{curr.code}</span>
                    <span>- {curr.name}</span>
                    {currency === curr.code && (
                      <div className="ml-auto h-2 w-2 bg-primary rounded-full" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Menu with Enhanced Animations */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-2 border border-border rounded-full p-2 hover:shadow-xl transition-all duration-300 cursor-pointer group bg-background/90 backdrop-blur-sm hover:bg-background hover:scale-105 active:scale-95">
                  <Menu className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-all duration-300 group-hover:rotate-180" />
                  <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                    {isAuthenticated && user ? (
                      user.profile_url ? (
                        <img src={user.profile_url} alt={user.first_name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <span className="text-xs font-semibold text-primary-foreground">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      )
                    ) : (
                      <User className="h-4 w-4 text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
                    )}
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 bg-background border shadow-xl rounded-xl p-2 z-[10000]"
              >
                {/* User Info Section - Show when logged in */}
                {isAuthenticated && user && (
                  <>
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold text-sm">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </>
                )}

                {/* Login/Signup - Show only when NOT logged in */}
                {!isAuthenticated && (
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
                )}
                
                {!isAuthenticated && <DropdownMenuSeparator className="my-2" />}
                
                {/* Account-related menu items - Only visible for authenticated users */}
                {isAuthenticated && (
                  <>
                    <div className="py-2">
                      <DropdownMenuItem
                        onClick={() => navigate("/account")}
                        className="flex items-center space-x-3 cursor-pointer px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="leading-5">Your account</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/wishlist')}
                        className="flex items-center space-x-3 cursor-pointer px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Heart className="h-5 w-5 text-red-500 fill-red-500 flex-shrink-0" />
                        <span className="leading-5">Your wishlist</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/profile')}
                        className="flex items-center space-x-3 cursor-pointer px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="leading-5">Your bookings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/account-settings')}
                        className="flex items-center space-x-3 cursor-pointer px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Settings className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="leading-5">Account settings</span>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="my-2" />
                  </>
                )}
                <div className="py-2">
                  <DropdownMenuItem className="flex items-center space-x-3 cursor-pointer px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    <span>Help Centre</span>
                  </DropdownMenuItem>
                </div>
                
                {/* Logout - Show only when logged in */}
                {isAuthenticated && (
                  <>
                    <DropdownMenuSeparator className="my-2" />
                    <div className="py-2">
                      <DropdownMenuItem
                        onClick={() => {
                          logout();
                          window.location.reload();
                        }}
                        className="flex items-center space-x-3 cursor-pointer px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Logout</span>
                      </DropdownMenuItem>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu - Hidden, using pill nav instead */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden hidden">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] bg-white/95 backdrop-blur-md"
              >
                <div className="flex flex-col space-y-6 mt-8">
                  {/* Mobile Navigation */}
                  <nav className="space-y-2">
                    {navigation.map((item) => (
                      <button
                        key={item.name}
                        className="w-full text-left flex items-center space-x-3 text-lg font-medium text-gray-700 hover:text-primary transition-all duration-300 p-4 rounded-xl hover:bg-white/80 group"
                        onClick={() => {
                          navigate(item.href);
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

          {/* Center Navigation - Desktop - Airbnb Style */}
          <div
            className={`hidden lg:flex items-center lg:order-2 ${
              isCompact ? "flex-none" : "flex-1 justify-center"
            }`}
          >
            <nav
              className={`flex items-center backdrop-blur-sm rounded-full border shadow-lg transition-all duration-300 ${
                isCompact
                  ? "bg-white/95 border-border/30 p-0.5 scale-90"
                  : isScrolled
                  ? "bg-white/95 border-border/30 scale-95 p-1"
                  : "bg-white/90 border-border/20 p-1"
              }`}
            >
              {navigation.map((item, index) => (
                <button
                  key={item.name}
                  className={`relative flex items-center space-x-2 text-muted-foreground hover:text-foreground font-medium transition-all duration-300 rounded-full hover:bg-white group ${
                    isCompact ? "text-sm py-2.5 px-5" : "text-base py-3 px-6"
                  }`}
                  onClick={() => {
                    navigate(item.href);
                  }}
                >
                  {}
                  <img
                    src={item.customIcon}
                    alt={item.name}
                    className={isCompact ? "h-5 w-5" : "h-6 w-6"}
                  />
                  <span className="transition-all duration-300 group-hover:font-semibold">
                    {item.name}
                  </span>

                  {/* Active indicator with glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100 -z-10"></div>

                  {/* Separator */}
                  {index < navigation.length - 1 && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-4 bg-border/30"></div>
                  )}
                </button>
              ))}

              {/* Search Icon with enhanced animations */}
              {((isScrolled && isHomePage) || !isHomePage) &&
                !showSearchBar && (
                  <button
                    onClick={() => setShowSearchBar(true)}
                    className={`relative flex items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 aspect-square hover:scale-110 active:scale-95 ml-2 group ${
                      isCompact ? "w-9 h-9" : "w-11 h-11"
                    }`}
                    style={{ backgroundColor: "#165d31" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#134a28";
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#165d31";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <Search className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                )}
            </nav>
          </div>

          {/* Spacer for compact header */}
          {isCompact && <div className="flex-1" />}

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center group cursor-pointer flex-shrink-0 pl-0 pt-5 order-1 lg:order-3"
          >
            <img
              src={logoIcon}
              alt="HotelRBS Logo"
              className={`w-auto transform group-hover:scale-105 transition-all duration-300 -ml-2 mt-1 ${
                isCompact ? "h-14" : isScrolled ? "h-18" : "h-24"
              }`}
            />
          </Link>
        </div>

        {/* Mobile Search Bar for Hotel Details - Only on mobile, only on hotel pages */}
        {isHotelDetailsPage && (
          <div className="md:hidden w-full border-t border-border/50 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-2">
              <MobileAvailabilitySearchBar
                checkIn={checkIn}
                checkOut={checkOut}
                adults={adults}
                children={children}
                rooms={rooms}
                onSearchChange={(params) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set("checkIn", params.checkIn);
                  newParams.set("checkOut", params.checkOut);
                  newParams.set("adults", params.adults.toString());
                  newParams.set("children", params.children.toString());
                  newParams.set("rooms", params.rooms.toString());
                  if (params.childrenAges && params.childrenAges.length > 0) {
                    newParams.set("childrenAges", params.childrenAges.join(","));
                  }
                  navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
                  window.location.reload();
                }}
              />
            </div>
          </div>
        )}

        {/* Integrated Search Bar inside header - only show on home page */}
        <div
          className={`hidden md:block pb-[37px] mt-4 transition-all duration-300 ${
            isHomePage && !isScrolled
              ? "opacity-100 max-h-40"
              : "opacity-0 max-h-0 pb-0 overflow-hidden"
          }`}
        >
          {isHomePage && (
            <div className="w-full">
              <NewCustomSearchBar isSticky />
            </div>
          )}
        </div>

        {/* Overlay Search Bar - Shows when search icon is clicked */}
        <Dialog open={showSearchBar} onOpenChange={setShowSearchBar}>
          <DialogContent 
            className="sm:max-w-5xl z-[10000]"
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Search Hotels</DialogTitle>
              <DialogDescription>
                Find your perfect stay by entering your destination, dates, and guest details
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <NewCustomSearchBar isSticky />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Login/Signup Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl z-[10000]">
          <div className="p-8">
            <DialogHeader className="text-center mb-6">
              <DialogTitle className="text-2xl font-semibold text-foreground">
                Welcome to HotelRBS
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Sign in to your account or create a new one to book hotels
              </DialogDescription>
            </DialogHeader>

            {/* Login/Signup Tabs */}
            <Tabs value={isLogin ? "login" : "signup"} onValueChange={(value) => setIsLogin(value === "login")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  const emailInput = document.getElementById('email') as HTMLInputElement;
                  const passwordInput = document.getElementById('password') as HTMLInputElement;
                  const email = emailInput?.value;
                  const password = passwordInput?.value;
                  
                  if (email && password) {
                    handleEmailPasswordLogin(email, password);
                  } else {
                    alert('Please enter both email and password');
                  }
                }}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="p-3 text-base"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="p-3 text-base"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
                  >
                    Sign In
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <GoogleSignInButton
                    onSuccess={() => {
                      // Close the dialog on successful sign-in
                      setIsLoginDialogOpen(false);
                    }}
                  />
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const phoneNumber = formData.get('phone') as string;
                  const selectedCountryCode = formData.get('countryCode') as string || countryCode;
                  const fullPhoneNumber = selectedCountryCode + phoneNumber.replace(/^\+?[\d\s-()]+/, '').replace(/\D/g, '');
                  
                  const signupData = {
                    first_name: formData.get('first_name') as string,
                    last_name: formData.get('last_name') as string,
                    email: formData.get('email') as string,
                    password: formData.get('password') as string,
                    age: parseInt(formData.get('age') as string),
                    nationality: formData.get('nationality') as string,
                    gender: formData.get('gender') as string,
                    profile_url: 'https://example.com/pic.jpg',
                    phone: fullPhoneNumber
                  };
                  
                  handleSignup(signupData);
                }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        name="first_name"
                        type="text"
                        placeholder="First name"
                        className="p-3 text-base"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        name="last_name"
                        type="text"
                        placeholder="Last name"
                        className="p-3 text-base"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="p-3 text-base"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex">
                      <CountryCodeSelector
                        value={countryCode}
                        onValueChange={setCountryCode}
                      />
                      <div className="relative flex-1">
                        <Input
                          name="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          className="p-3 px-3 text-base rounded-l-none border-l-0"
                          required
                        />
                      </div>
                    </div>
                    <input type="hidden" name="countryCode" value={countryCode} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        name="age"
                        type="number"
                        placeholder="Age"
                        min="18"
                        max="120"
                        className="p-3 text-base"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        name="gender"
                        className="w-full p-3 border border-input rounded-lg bg-background text-base"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      name="nationality"
                      type="text"
                      placeholder="Enter your nationality"
                      className="p-3 text-base"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      className="p-3 text-base"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
                  >
                    Sign Up
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <GoogleSignInButton
                    onSuccess={() => {
                      // Close the dialog on successful sign-in
                      setIsLoginDialogOpen(false);
                    }}
                  />
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
