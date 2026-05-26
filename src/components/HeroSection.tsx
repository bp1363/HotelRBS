import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useTranslation } from "@/contexts/TranslationContext";

interface HeroSectionProps {
  variant?: "home" | "search";
  showSearch?: boolean;
}

const HeroSection = ({ variant = "home", showSearch = true }: HeroSectionProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Auto-typing animation state
  const [autoTypingText, setAutoTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Trending destinations - starting with Dubai
  const trendingDestinations = ["Dubai", "New York", "Jeddah", "Riyadh", "Paris", "London"];
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0);

  // Background images array for dynamic rotation
  const backgroundImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop&q=80",
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&h=1080&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=1080&fit=crop&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&h=1080&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&h=1080&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&h=1080&fit=crop&q=80",
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-rotate background images every 5 seconds with slow transition
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Auto-typing effect for destination input
  useEffect(() => {
    if (destination || hasUserInteracted || !showSearch) {
      setIsTyping(false);
      setAutoTypingText("");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      return;
    }

    const deleteDestination = (dest: string) => {
      let currentIndex = dest.length;
      
      const deleteChar = () => {
        if (currentIndex > 0) {
          setAutoTypingText(dest.slice(0, currentIndex - 1));
          currentIndex--;
          typingTimeoutRef.current = setTimeout(deleteChar, 50);
        } else {
          setCurrentDestinationIndex((prev) => (prev + 1) % trendingDestinations.length);
        }
      };
      
      deleteChar();
    };

    const typeDestination = (dest: string) => {
      let currentIndex = 0;
      setAutoTypingText("");
      
      const typeChar = () => {
        if (currentIndex < dest.length) {
          setAutoTypingText(dest.slice(0, currentIndex + 1));
          currentIndex++;
          typingTimeoutRef.current = setTimeout(typeChar, 100);
        } else {
          typingTimeoutRef.current = setTimeout(() => {
            deleteDestination(dest);
          }, 2000);
        }
      };
      
      typeChar();
    };

    // Start auto-typing after a short delay
    const startDelay = setTimeout(() => {
      setIsTyping(true);
      typeDestination(trendingDestinations[currentDestinationIndex]);
    }, 1500);

    return () => {
      clearTimeout(startDelay);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, hasUserInteracted, showSearch, currentDestinationIndex]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams({
      destination: destination || "Dubai",
      checkIn: checkIn || new Date().toISOString().split("T")[0],
      checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      guests: guests.toString(),
    });
    navigate(`/search?${searchParams.toString()}`);
  };

  const popularDestinations = [
    { name: "Dubai", tag: "Luxury", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop&q=80" },
    { name: "Maldives", tag: "Beach", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80" },
    { name: "Paris", tag: "Romance", image: "https://images.unsplash.com/photo-1508050916680-992352b31009?w=400&h=300&fit=crop&q=80" },
    { name: "Tokyo", tag: "Culture", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop&q=80" },
  ];

  return (
    <div className="relative w-full overflow-hidden min-h-[75vh] md:min-h-[80vh]">
      {/* Hero Background with Parallax Effect */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        {/* Background Images with Slow Dynamic Fade Transition */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-[4000ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                index === currentImageIndex 
                  ? 'opacity-100 z-0' 
                  : 'opacity-0 z-[-1]'
              }`}
              style={{ 
                willChange: 'opacity',
              }}
            >
              <img
                src={image}
                alt={`Beautiful hotel destination ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ 
                  minHeight: '100%',
                  transform: `scale(${index === currentImageIndex ? 1 : 1.05}) translateZ(0)`,
                  transition: 'transform 4000ms cubic-bezier(0.4, 0, 0.2, 1)',
                  willChange: 'transform',
                }}
              />
            </div>
          ))}
          {/* Gradient Overlay - Very subtle on mobile to show image, slightly more on desktop */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent md:from-primary/50 md:via-primary/30 md:to-primary/20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10 md:from-black/60 md:via-black/20 md:to-transparent pointer-events-none" />
        </div>

        {/* Animated Shapes */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" 
            style={{ animationDelay: "0s", animationDuration: "8s" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" 
            style={{ animationDelay: "2s", animationDuration: "10s" }} />
          <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" 
            style={{ animationDelay: "4s", animationDuration: "12s" }} />
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 min-h-[75vh] md:min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-40 sm:pt-44 md:pt-40 pb-12 md:pb-24">
        <div className="max-w-7xl w-full mx-auto">
          {/* Trust Badge */}
          <div className="flex justify-center mb-5 md:mb-8 animate-fade-in">
            <Badge 
              variant="secondary" 
              className="bg-white/98 backdrop-blur-md !text-white px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-display font-bold shadow-xl border-2 border-white rounded-full hover:scale-105 transition-transform duration-300 tracking-wide"
              style={{ color: '#ffffff' }}
            >
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2 inline fill-white" />
              {t?.trustedBy || "Trusted by 1M+ travelers worldwide"}
            </Badge>
          </div>

          {/* Hero Title with White Background Frame */}
          <div className="text-center mb-8 md:mb-16 animate-fade-in-up">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl md:rounded-[2rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-white/50 max-w-5xl mx-auto">
              <div className="space-y-3 md:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-gray-900 leading-tight px-2">
                  {t?.findYourPerfect || "Find Your Perfect"}
                  <span className="block bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent mt-2 md:mt-3">
                    {t?.dreamDestination || "Dream Destination"}
                  </span>
                </h1>
                <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto font-medium px-4 leading-relaxed">
                  {t?.discoverAmazingHotels || "Discover amazing hotels, resorts, and stays at the best prices"}
                </p>
              </div>
            </div>
          </div>

          {/* Search Card */}
          {showSearch && (
            <Card className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md shadow-hero border-0 overflow-hidden animate-scale-in">
              <div className="p-4 sm:p-6 md:p-8">
                {/* Tabs for Flights/Hotels */}
                <div className="flex space-x-2 mb-6 border-b border-gray-200">
                  <button className="px-6 py-3 text-sm font-semibold text-primary border-b-2 border-primary transition-colors">
                    Hotels & Stays
                  </button>
                  <button className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-primary transition-colors">
                    Flights (Coming Soon)
                  </button>
                </div>

                <form onSubmit={handleSearch} className="space-y-4">
                  {/* Search Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {/* Destination */}
                    <div className="relative group">
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Destination
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <div className="relative w-full">
                          <Input
                            type="text"
                            placeholder="Where are you going?"
                            value={destination}
                            onChange={(e) => {
                              setDestination(e.target.value);
                              setHasUserInteracted(true);
                              setIsTyping(false);
                              setAutoTypingText("");
                            }}
                            onFocus={() => {
                              setHasUserInteracted(true);
                              setIsTyping(false);
                              setAutoTypingText("");
                            }}
                            className="pl-11 h-14 text-base border-2 border-gray-200 focus:border-primary rounded-xl transition-all shadow-sm hover:shadow-md"
                          />
                          {!destination && isTyping && autoTypingText && (
                            <div className="absolute left-11 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center">
                              {autoTypingText}
                              <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-pulse" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Check-in Date */}
                    <div className="relative group">
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Check-in
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <Input
                          type="date"
                          value={checkIn}
                          onChange={(e) => {
                            setCheckIn(e.target.value);
                            // Automatically set checkout to next day when checkin is selected
                            if (e.target.value) {
                              const checkInDate = new Date(e.target.value);
                              const nextDay = new Date(checkInDate);
                              nextDay.setDate(nextDay.getDate() + 1);
                              setCheckOut(nextDay.toISOString().split('T')[0]);
                            }
                          }}
                          className="pl-11 h-14 text-base border-2 border-gray-200 focus:border-primary rounded-xl transition-all shadow-sm hover:shadow-md"
                        />
                      </div>
                    </div>

                    {/* Check-out Date */}
                    <div className="relative group">
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Check-out
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <Input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="pl-11 h-14 text-base border-2 border-gray-200 focus:border-primary rounded-xl transition-all shadow-sm hover:shadow-md"
                        />
                      </div>
                    </div>

                    {/* Guests */}
                    <div className="relative group">
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Guests
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={guests}
                          onChange={(e) => setGuests(parseInt(e.target.value))}
                          className="pl-11 h-14 text-base border-2 border-gray-200 focus:border-primary rounded-xl transition-all shadow-sm hover:shadow-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search Hotels
                    </Button>
                  </div>
                </form>

                {/* Quick Links / Features */}
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Badge variant="outline" className="text-xs px-3 py-1.5 cursor-pointer hover:bg-primary/5 transition-colors">
                    🔥 Hot Deals
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1.5 cursor-pointer hover:bg-primary/5 transition-colors">
                    ⭐ Top Rated
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1.5 cursor-pointer hover:bg-primary/5 transition-colors">
                    🏖️ Beach Resorts
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1.5 cursor-pointer hover:bg-primary/5 transition-colors">
                    🏙️ City Hotels
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1.5 cursor-pointer hover:bg-primary/5 transition-colors">
                    💼 Business Travel
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Popular Destinations - Carousel */}
          <div className="mt-8 md:mt-16 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="bg-white/90 backdrop-blur-md rounded-2xl md:rounded-3xl px-6 md:px-8 py-4 md:py-5 shadow-xl border-2 border-white/50 max-w-5xl mx-auto mb-4 md:mb-8">
              <p className="text-center text-gray-900 text-xs md:text-sm font-bold mb-0 uppercase tracking-widest">
                {t?.popularDestinations || "Popular Destinations"}
              </p>
            </div>
            <div className="max-w-5xl mx-auto px-4 md:px-8">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {popularDestinations.map((dest, index) => (
                    <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/4">
                      <button
                        onClick={() => {
                          // Navigate directly to search with city name (show hardcoded hotels)
                          navigate(`/search?destination=${encodeURIComponent(dest.name)}&showHardcoded=true`);
                        }}
                        className="group relative overflow-hidden rounded-2xl md:rounded-3xl h-52 sm:h-60 md:h-72 w-full shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105"
                      >
                        <img
                          src={dest.image}
                          alt={dest.name}
                          loading="lazy"
                          className="w-full h-full object-cover rounded-2xl md:rounded-3xl transition-transform duration-700 group-hover:scale-125"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-2xl md:rounded-3xl" />
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl md:rounded-3xl" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                          <Badge className="mb-1 md:mb-2 text-[10px] md:text-xs bg-white/95 text-primary px-2 py-0.5 md:px-2.5 md:py-1 font-semibold shadow-lg border border-white/50 rounded-full">
                            {dest.tag}
                          </Badge>
                          <h3 className="text-white font-bold text-base sm:text-lg md:text-xl leading-tight drop-shadow-lg">{dest.name}</h3>
                        </div>
                      </button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 md:-left-12 h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white hover:text-white border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-300" />
                <CarouselNext className="right-2 md:-right-12 h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white hover:text-white border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-300" />
              </Carousel>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto text-center animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-7 border-2 border-white/30 shadow-2xl hover:bg-white/20 hover:scale-105 transition-all duration-300 hover:border-white/50">
              <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-1 md:mb-3 drop-shadow-lg">1M+</div>
              <div className="text-[11px] sm:text-xs md:text-base text-white/95 font-semibold leading-tight tracking-wide">Happy Travelers</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-7 border-2 border-white/30 shadow-2xl hover:bg-white/20 hover:scale-105 transition-all duration-300 hover:border-white/50">
              <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-1 md:mb-3 drop-shadow-lg">50K+</div>
              <div className="text-[11px] sm:text-xs md:text-base text-white/95 font-semibold leading-tight tracking-wide">Hotels Worldwide</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-7 border-2 border-white/30 shadow-2xl hover:bg-white/20 hover:scale-105 transition-all duration-300 hover:border-white/50">
              <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-1 md:mb-3 drop-shadow-lg">4.8★</div>
              <div className="text-[11px] sm:text-xs md:text-base text-white/95 font-semibold leading-tight tracking-wide">Average Rating</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-7 border-2 border-white/30 shadow-2xl hover:bg-white/20 hover:scale-105 transition-all duration-300 hover:border-white/50">
              <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-1 md:mb-3 drop-shadow-lg">24/7</div>
              <div className="text-[11px] sm:text-xs md:text-base text-white/95 font-semibold leading-tight tracking-wide">Customer Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;

