import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const DestinationHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredDestinations = [
    {
      id: 1,
      name: "Beach",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
      subtitle: "Coastal Paradise",
    },
    {
      id: 2,
      name: "Nature",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
      subtitle: "Wild Adventures",
    },
    {
      id: 3,
      name: "Hotel",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
      subtitle: "Luxury Stays",
    },
    {
      id: 4,
      name: "City",
      image:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
      subtitle: "Urban Exploration",
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredDestinations.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + featuredDestinations.length) % featuredDestinations.length
    );
  };

  const getVisibleCards = () => {
    const visibleCount = 3; // Show 3 cards at a time
    const result = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % featuredDestinations.length;
      result.push(featuredDestinations[index]);
    }
    return result;
  };

  return (
    <section className="destination-hero-section relative min-h-[70vh] overflow-hidden mb-16">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-3xl overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[50vh]">
          {/* Left Side - Text Content */}
          <div className="text-white space-y-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wider opacity-90">
                Travel worldwide
              </p>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                NEVER STOP
                <br />
                EXPLORING THE
                <br />
                WORLD.
              </h1>
            </div>
            <p className="text-lg opacity-90 max-w-md">
              Discover breathtaking destinations, luxury accommodations, and
              unforgettable experiences across the globe.
            </p>
          </div>

          {/* Right Side - Horizontal Cards with Navigation */}
          <div className="relative h-[400px] flex items-center justify-end">
            {/* Navigation Arrows */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm rounded-full"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-[-12px] top-1/2 transform -translate-y-1/2 z-20 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm rounded-full"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Cards Container */}
            <div className="flex space-x-4 px-12 cards-container-horizontal">
              {getVisibleCards().map((destination, index) => (
                <Card
                  key={`${destination.id}-${currentIndex}-${index}`}
                  className="w-56 h-72 overflow-hidden rounded-3xl shadow-2xl transform transition-all duration-500 floating-card-horizontal"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    zIndex: 10 - index,
                  }}
                >
                  <div
                    className="w-full h-full bg-cover bg-center relative group cursor-pointer"
                    style={{ backgroundImage: `url(${destination.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold mb-1">
                        {destination.name}
                      </h3>
                      <p className="text-sm opacity-90">
                        {destination.subtitle}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DestinationHero;
