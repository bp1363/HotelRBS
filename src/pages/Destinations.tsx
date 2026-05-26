import { Link } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import TravelerCommunity from "@/components/TravelerCommunity";
import { useTranslation } from "@/contexts/TranslationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Camera, Sparkles, TrendingUp, Star, Award } from "lucide-react";
import SearchModal from "@/components/SearchModal";

const Destinations = () => {
  const { t } = useTranslation();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const destinations = [
    {
      id: 1,
      name: "Riyadh",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80",
      description: "The capital city with modern architecture and rich culture",
      properties: "500+",
      rating: 4.8,
      highlights: [
        "King Abdulaziz Historical Center",
        "Diriyah",
        "Kingdom Centre",
      ],
      badge: "Popular",
      badgeIcon: "🔥",
    },
    {
      id: 2,
      name: "Jeddah",
      image:
        "https://images.unsplash.com/photo-1590682680031-14e3e31d9f6a?w=800&h=600&fit=crop&q=80",
      description: "Gateway to Mecca with beautiful Red Sea coastline",
      properties: "300+",
      rating: 4.7,
      highlights: ["Historic Jeddah", "Corniche", "King Fahd Fountain"],
      badge: "Trending",
      badgeIcon: "📈",
    },
    {
      id: 3,
      name: "Dubai",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&q=80",
      description: "World-class luxury destination with iconic architecture",
      properties: "450+",
      rating: 4.9,
      highlights: ["Burj Khalifa", "Dubai Mall", "Palm Jumeirah"],
      badge: "Luxury",
      badgeIcon: "✨",
    },
    {
      id: 4,
      name: "Abu Dhabi",
      image:
        "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop&q=80",
      description: "UAE's capital with cultural landmarks and luxury resorts",
      properties: "280+",
      rating: 4.8,
      highlights: ["Sheikh Zayed Mosque", "Louvre Abu Dhabi", "Yas Island"],
      badge: "Cultural",
      badgeIcon: "🕌",
    },
    {
      id: 5,
      name: "Doha",
      image:
        "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&h=600&fit=crop&q=80",
      description: "Qatar's modern capital with stunning skyline and culture",
      properties: "200+",
      rating: 4.6,
      highlights: ["Museum of Islamic Art", "Souq Waqif", "The Pearl"],
      badge: "Modern",
      badgeIcon: "🏙️",
    },
    {
      id: 6,
      name: "Mecca",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80",
      description: "Islam's holiest city and pilgrimage destination",
      properties: "120+",
      rating: 4.9,
      highlights: ["Masjid al-Haram", "Kaaba", "Abraj Al-Bait"],
      badge: "Spiritual",
      badgeIcon: "🕋",
    },
    {
      id: 7,
      name: "Medina",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80",
      description: "The Prophet's city with profound Islamic heritage",
      properties: "95+",
      rating: 4.9,
      highlights: ["Al-Masjid an-Nabawi", "Quba Mosque", "Mount Uhud"],
      badge: "Heritage",
      badgeIcon: "🕌",
    },
    {
      id: 8,
      name: "Dammam",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=80",
      description: "Eastern province hub with coastal attractions",
      properties: "180+",
      rating: 4.5,
      highlights: ["King Fahd Park", "Coral Island", "Half Moon Bay"],
      badge: "Coastal",
      badgeIcon: "🏖️",
    },
    {
      id: 9,
      name: "Taif",
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&q=80",
      description: "Mountain resort known for roses and cool climate",
      properties: "65+",
      rating: 4.7,
      highlights: ["Shubra Palace", "Rose Garden", "Al Hada Mountain"],
      badge: "Nature",
      badgeIcon: "🌹",
    },
    {
      id: 10,
      name: "Al Khobar",
      image:
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop&q=80",
      description: "Vibrant waterfront city with modern shopping and dining",
      properties: "140+",
      rating: 4.6,
      highlights: ["Corniche", "Al Rashid Mall", "Half Moon Beach"],
      badge: "Waterfront",
      badgeIcon: "🌊",
    },
    {
      id: 11,
      name: "Khobar",
      image:
        "https://images.unsplash.com/photo-1580837119756-563d608dd119?w=800&h=600&fit=crop&q=80",
      description: "Business hub with upscale hotels and entertainment",
      properties: "110+",
      rating: 4.5,
      highlights: ["Desert Road", "Al Danah Mall", "Heritage Village"],
      badge: "Business",
      badgeIcon: "💼",
    },
    {
      id: 12,
      name: "Yanbu",
      image:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&q=80",
      description: "Historic port city with pristine beaches and diving spots",
      properties: "75+",
      rating: 4.6,
      highlights: ["Old Town", "Red Sea Beaches", "Diving Sites"],
      badge: "Beach",
      badgeIcon: "🏝️",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-hover to-primary pt-32 md:pt-40 pb-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=600&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <Badge className="mb-6 bg-white/90 text-primary border-white/20 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2 inline" />
            {t?.exploreAmazingDestinations || "Explore Amazing Destinations"}
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white mb-6">
            {t?.discoverYourNext || "Discover Your Next"}
            <span className="block bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
              {t?.adventure || "Adventure"}
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            {t?.fromBustlingCities || "From bustling cities to serene beaches, explore"} {destinations.length}+ {t?.incredibleDestinations || "incredible destinations across the Middle East"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">{destinations.length} {t?.cities || "Cities"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white">
              <Users className="w-5 h-5" />
              <span className="font-semibold">2,500+ {t?.hotels || "Hotels"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">4.7 {t?.avgRating || "Avg Rating"}</span>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-white">
        {/* Destinations Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                {t?.popularDestinations || "Popular Destinations"}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t?.handPickedDestinations || "Hand-picked destinations offering the best accommodations and experiences"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {destinations.map((destination, index) => {
                const handleExploreHotels = (e: React.MouseEvent) => {
                  e.preventDefault();
                  setSelectedDestination(destination.name);
                  setIsSearchModalOpen(true);
                };
                
                return (
                <div
                  key={destination.id}
                  className="group block"
                >
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 rounded-2xl">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Badge */}
                      <Badge className="absolute top-4 left-4 bg-white/95 text-foreground border-0 shadow-lg">
                        {destination.badgeIcon} {destination.badge}
                      </Badge>
                      
                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-white font-bold text-2xl mb-2 transform group-hover:translate-y-[-4px] transition-transform duration-300">
                          {destination.name}
                        </h3>
                        <div className="flex items-center gap-4 text-white/90 text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{destination.properties} hotels</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{destination.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {destination.description}
                      </p>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                          {t?.topAttractions || "Top Attractions"}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {destination.highlights.map((highlight, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs py-1 px-2 border-gray-200 hover:border-primary hover:text-primary transition-colors"
                            >
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleExploreHotels}
                        className="w-full mt-6 bg-primary hover:bg-primary-hover text-white shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        {t?.exploreHotels || "Explore Hotels"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Our Destinations Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                {t?.whyBookWithUs || "Why Book With Us"}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t?.discoverBenefits || "Discover the benefits of choosing HotelRBS for your travels"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t?.bestPrices || "Best Prices"}</h3>
                  <p className="text-muted-foreground">
                    {t?.comparePrices || "Compare prices across 2,500+ hotels and get the best deals guaranteed"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t?.verifiedReviews || "Verified Reviews"}</h3>
                  <p className="text-muted-foreground">
                    {t?.readAuthenticReviews || "Read authentic reviews from real travelers who stayed there"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t?.localExpertise || "Local Expertise"}</h3>
                  <p className="text-muted-foreground">
                    {t?.getInsiderTips || "Get insider tips and recommendations for each destination"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Traveler Community - Real Stories from Real Travelers */}
      <TravelerCommunity />

      <main className="bg-white">
        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
              <CardContent className="p-12 text-center relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <Camera className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                    {t?.cantFindDestination || "Can't Find Your Destination?"}
                  </h2>
                  <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
                    We're constantly adding new destinations. Let us know where you'd like to stay, and we'll help you find the perfect accommodation.
                  </p>
                  <Button size="lg" className="bg-primary hover:bg-primary-hover text-white shadow-lg hover:shadow-xl transition-all duration-300 h-14 px-8 text-lg">
                    {t?.requestNewDestination || "Request New Destination"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
      <ChatBot />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSelectedDestination("");
        }}
        defaultDestination={selectedDestination}
      />
    </div>
  );
};

export default Destinations;
