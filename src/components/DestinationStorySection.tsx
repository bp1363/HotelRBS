import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Calendar, 
  Star, 
  ArrowRight,
  Plane,
  Camera,
  Coffee,
  Palmtree,
  Building2
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface Destination {
  id: string;
  name: string;
  country: string;
  tagline: string;
  description: string;
  image: string;
  highlights: string[];
  bestTime: string;
  rating: number;
  reviews: number;
  icon: any;
  color: string;
}

const destinations: Destination[] = [
  {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    tagline: "Where modern luxury meets Arabian heritage",
    description: "Experience the pinnacle of luxury in this futuristic metropolis. From the world's tallest building to pristine beaches and desert adventures, Dubai offers an unparalleled blend of innovation and tradition.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=800&fit=crop&q=85",
    highlights: ["Burj Khalifa", "Desert Safari", "Gold Souk", "Palm Jumeirah"],
    bestTime: "Nov - Apr",
    rating: 4.8,
    reviews: 24567,
    icon: Building2,
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "maldives",
    name: "Maldives",
    country: "Indian Ocean Paradise",
    tagline: "Your private island escape awaits",
    description: "Discover pristine turquoise waters, overwater bungalows, and some of the world's most spectacular coral reefs. The Maldives is the ultimate destination for romance, relaxation, and underwater adventures.",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&h=800&fit=crop&q=85",
    highlights: ["Overwater Villas", "Snorkeling", "Spa Retreats", "Sunset Cruises"],
    bestTime: "Nov - Apr",
    rating: 4.9,
    reviews: 18234,
    icon: Palmtree,
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    tagline: "The city of love and lights",
    description: "Discover the romance and elegance of Paris. From the iconic Eiffel Tower to world-class museums, charming cafes, and historic architecture, Paris offers an unforgettable cultural experience.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=800&fit=crop&q=85",
    highlights: ["Eiffel Tower", "Louvre Museum", "Notre-Dame", "Champs-Élysées"],
    bestTime: "Apr - Jun, Sep - Oct",
    rating: 4.9,
    reviews: 45678,
    icon: Building2,
    color: "from-pink-500 to-rose-600",
  },
];

const DestinationStorySection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeDestination, setActiveDestination] = useState(0);
  const destination = destinations[activeDestination];
  const Icon = destination.icon;

  const handleFindHotels = () => {
    // Navigate to search with destination name (show hardcoded hotels)
    navigate(`/search?destination=${encodeURIComponent(destination.name)}&showHardcoded=true`);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2">
            <MapPin className="w-4 h-4 mr-2 inline" />
            {t?.destinationStories || "Destination Stories"}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            {t?.immerseYourselfInCulture || "Immerse Yourself in Culture"}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t?.exploreDestinationsThroughEyes || "Explore destinations through the eyes of travelers and locals"}
          </p>
        </div>

        {/* Destination Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {destinations.map((dest, index) => {
            const DestIcon = dest.icon;
            return (
              <button
                key={dest.id}
                onClick={() => setActiveDestination(index)}
                className={`group flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-500 ${
                  activeDestination === index
                    ? `bg-gradient-to-r ${dest.color} text-white shadow-xl scale-105`
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border-2 border-gray-100"
                }`}
              >
                <DestIcon className={`w-5 h-5 transition-transform duration-300 ${activeDestination === index ? "rotate-12" : ""}`} />
                <span className="hidden sm:inline">{dest.name}</span>
                <span className="sm:hidden">{dest.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Story Card - Large Format */}
        <Card className="overflow-hidden border-0 shadow-2xl bg-white">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Image Side */}
            <div className="relative h-[400px] lg:h-auto overflow-hidden group">
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-black/40 lg:via-transparent lg:to-transparent" />
              
              {/* Floating Stats */}
              <div className="absolute bottom-6 left-6 right-6 lg:bottom-8 lg:left-8 flex flex-wrap items-center gap-3">
                <div className="bg-white/95 backdrop-blur-md rounded-full px-4 py-2 shadow-xl flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-gray-900">{destination.rating}</span>
                  <span className="text-gray-600 text-sm">({destination.reviews.toLocaleString()})</span>
                </div>
                <div className="bg-white/95 backdrop-blur-md rounded-full px-4 py-2 shadow-xl flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-gray-900 text-sm">{t?.bestTimeToVisit || "Best"}: {destination.bestTime}</span>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
              {/* Icon */}
              <div className={`inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br ${destination.color} items-center justify-center mb-6 shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <div className="mb-6">
                <h3 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                  {destination.name}
                </h3>
                <p className="text-primary font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {destination.country}
                </p>
              </div>

              {/* Tagline */}
              <p className="text-xl md:text-2xl text-gray-700 font-medium mb-4 italic">
                "{destination.tagline}"
              </p>

              {/* Description */}
              <p className="text-muted-foreground text-base leading-relaxed mb-8">
                {destination.description}
              </p>

              {/* Highlights */}
              <div className="mb-8">
                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  {t?.mustSeeHighlights || "Must-See Highlights"}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {destination.highlights.map((highlight, index) => (
                    <Badge
                      key={index}
                      className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-semibold hover:bg-primary/20 transition-colors cursor-default"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link to={`/destinations/${destination.id}`} className="flex-1 min-w-[200px]">
                  <Button
                    size="lg"
                    className={`w-full rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r ${destination.color}`}
                  >
                    {t?.exploreDestination || "Explore Destination"} {destination.name}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleFindHotels}
                  className="flex-1 min-w-[200px] w-full rounded-xl font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Plane className="w-5 h-5 mr-2" />
                  {t?.findHotels || "Find Hotels"}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Quick Navigation Dots */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {destinations.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveDestination(index)}
              className={`transition-all duration-300 rounded-full ${
                activeDestination === index
                  ? "w-12 h-3 bg-primary"
                  : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`View ${destinations[index].name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationStorySection;

