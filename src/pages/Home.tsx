import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import ReviewsSection from "@/components/ReviewsSection";
import DiscoveryFeed from "@/components/DiscoveryFeed";
import DestinationStorySection from "@/components/DestinationStorySection";
import MobileSearchBar from "@/components/MobileSearchBar";
import MobileFooterNav from "@/components/MobileFooterNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Heart, Sparkles } from "lucide-react";
import SimpleHotelCard from "@/components/SimpleHotelCard";
import { hotels } from "@/data/hotels";
import { useFavorites } from "@/hooks/useFavorites";
import { useTranslation } from "@/contexts/TranslationContext";

const Home = () => {
  const { t } = useTranslation();
  const { toggleFavorite, isFavorite } = useFavorites();

  const featuredHotels = hotels.slice(0, 6);
  const luxuryHotels = hotels.filter(hotel => hotel.category === "luxury").slice(0, 6);
  const businessHotels = hotels.filter(hotel => hotel.category === "business").slice(0, 6);
  const weekendHotels = hotels.filter(hotel => hotel.category === "weekend").slice(0, 6);
  const familyHotels = hotels.filter(hotel => hotel.category === "family").slice(0, 6);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full">
      <Header />

      {/* Mobile Search Bar - Only visible on mobile devices */}
      {/* Positioned at 80px (below header h-20) with padding and button h-14 (56px) */}
      <div className="md:hidden fixed top-[80px] left-0 right-0 z-[9998] px-4 py-3 bg-white/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <MobileSearchBar />
      </div>

      {/* Spacer for mobile search bar - Header (80px) + Search bar area (~80px) = ~160px total */}
      <div className="md:hidden h-[160px]"></div>

      {/* Hero Section - Full Width, No Padding */}
      <HeroSection showSearch={false} />

      {/* Main Content */}
      <main className="relative bg-white">
        {/* Discovery Feed - Discover Your Next Destination */}
        <DiscoveryFeed />

        {/* Hotel Categories Quick Access */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                {t?.browseByCategory || "Browse by Category"}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t?.findPerfectAccommodation || "Find the perfect accommodation for your needs"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: t?.luxuryHotels || "Luxury Hotels",
                  image:
                    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop&q=80",
                  description: t?.starAccommodations || "5-star accommodations",
                  link: "/search?category=luxury",
                  icon: "✨",
                },
                {
                  name: t?.businessHotels || "Business Hotels",
                  image:
                    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop&q=80",
                  description: t?.perfectForBusinessTrips || "Perfect for business trips",
                  link: "/search?category=business",
                  icon: "💼",
                },
                {
                  name: t?.familySuites || "Family Suites",
                  image:
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop&q=80",
                  description: t?.spaciousFamilyRooms || "Spacious family rooms",
                  link: "/search?category=family",
                  icon: "👨‍👩‍👧‍👦",
                },
                {
                  name: t?.weekendGetaways || "Weekend Getaways",
                  image:
                    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=400&fit=crop&q=80",
                  description: t?.perfectForShortTrips || "Perfect for short trips",
                  link: "/search?category=weekend",
                  icon: "🏖️",
                },
              ].map((category, index) => (
                <Link 
                  key={index} 
                  to={category.link}
                  className="group block"
                >
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer rounded-2xl group-hover:-translate-y-2">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                          {category.icon}
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2 transform group-hover:translate-x-1 transition-transform duration-300">
                          {category.name}
                        </h3>
                        <p className="text-white/90 text-sm transform group-hover:translate-x-1 transition-transform duration-300">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Hotels */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Badge className="bg-secondary-coral/10 text-secondary-coral border-secondary-coral/20">
                    <Star className="w-4 h-4 mr-1 inline fill-current" />
                    {t?.featured || "Featured"}
                  </Badge>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                  {t?.featuredHotels || "Featured Hotels"}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t?.handPickedAccommodations || "Hand-picked accommodations for your perfect stay"}
                </p>
              </div>
              <Link to="/search">
                <Button 
                  variant="outline" 
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold"
                >
                  {t?.viewAll || "View All"}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHotels.map((hotel, index) => (
                <SimpleHotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onFavoriteToggle={toggleFavorite}
                  isFavorite={isFavorite(hotel.id)}
                  animationDelay={index * 100}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Luxury Hotels */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                  ✨ {t?.luxuryHotels || "Luxury Hotels"}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t?.experienceFinestHospitality || "Experience the finest hospitality"}
                </p>
              </div>
              <Link to="/search?category=luxury">
                <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold">
                  {t?.viewAllLuxury || "View All Luxury"}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {luxuryHotels.map((hotel, index) => (
                <SimpleHotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onFavoriteToggle={toggleFavorite}
                  isFavorite={isFavorite(hotel.id)}
                  animationDelay={index * 100}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Business Hotels */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                  💼 {t?.businessHotels || "Business Hotels"}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t?.perfectForBusinessTravelers || "Perfect for business travelers"}
                </p>
              </div>
              <Link to="/search?category=business">
                <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold">
                  {t?.viewAllBusiness || "View All Business"}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessHotels.map((hotel, index) => (
                <SimpleHotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onFavoriteToggle={toggleFavorite}
                  isFavorite={isFavorite(hotel.id)}
                  animationDelay={index * 100}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Weekend Getaways */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                  🏖️ {t?.weekendGetaways || "Weekend Getaways"}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t?.perfectEscapes || "Perfect escapes for short trips"}
                </p>
              </div>
              <Link to="/search?category=weekend">
                <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold">
                  {t?.viewAllGetaways || "View All Getaways"}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {weekendHotels.map((hotel, index) => (
                <SimpleHotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onFavoriteToggle={toggleFavorite}
                  isFavorite={isFavorite(hotel.id)}
                  animationDelay={index * 100}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Family Hotels */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                  👨‍👩‍👧‍👦 {t?.familyFriendlyHotels || "Family-Friendly Hotels"}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t?.greatAccommodations || "Great accommodations for the whole family"}
                </p>
              </div>
              <Link to="/search?category=family">
                <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold">
                  {t?.viewAllFamily || "View All Family"}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {familyHotels.map((hotel, index) => (
                <SimpleHotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onFavoriteToggle={toggleFavorite}
                  isFavorite={isFavorite(hotel.id)}
                  animationDelay={index * 100}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Destination Story Section - Immersive Storytelling */}
        <DestinationStorySection />
      </main>

      <ReviewsSection />
      <Footer />
      <MobileFooterNav />
      <ChatBot />
    </div>
  );
};

export default Home;
