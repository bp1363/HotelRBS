import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MapPin, 
  Heart, 
  Users, 
  TrendingUp, 
  Camera,
  MessageCircle,
  Bookmark,
  ArrowRight
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface DiscoveryItem {
  id: string;
  type: "destination" | "experience" | "review";
  title: string;
  subtitle: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  category: string;
  userPhoto?: string;
  userName?: string;
  featured?: boolean;
}

const discoveryItems: DiscoveryItem[] = [
  {
    id: "1",
    type: "destination",
    title: "Discover the Magic of Dubai",
    subtitle: "Skyscrapers, shopping, and desert adventures",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&q=80",
    rating: 4.8,
    reviews: 12453,
    location: "Dubai, UAE",
    category: "City Break",
    featured: true,
  },
  {
    id: "2",
    type: "experience",
    title: "Sunset Desert Safari",
    subtitle: "Experience authentic Bedouin culture",
    image: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800&h=600&fit=crop&q=80",
    rating: 4.9,
    reviews: 8234,
    location: "Dubai, UAE",
    category: "Adventure",
    userName: "Sarah M.",
    userPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    type: "destination",
    title: "Pearl of the Gulf - Doha",
    subtitle: "Modern architecture meets ancient traditions",
    image: "https://images.unsplash.com/photo-1549048469-9f0b83cfa4e6?w=800&h=600&fit=crop&q=80",
    rating: 4.7,
    reviews: 6789,
    location: "Doha, Qatar",
    category: "Culture",
  },
  {
    id: "4",
    type: "experience",
    title: "Maldives Island Hopping",
    subtitle: "Crystal waters and pristine beaches",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&q=80",
    rating: 5.0,
    reviews: 4521,
    location: "Maldives",
    category: "Beach",
    featured: true,
  },
  {
    id: "5",
    type: "review",
    title: "Best Family Vacation Ever!",
    subtitle: "Our kids loved every moment of this trip",
    image: "https://images.unsplash.com/photo-1540202404-2a1b2ec9b2e3?w=800&h=600&fit=crop&q=80",
    rating: 5.0,
    reviews: 2341,
    location: "Abu Dhabi, UAE",
    category: "Family",
    userName: "Michael K.",
    userPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
  {
    id: "6",
    type: "destination",
    title: "Romantic Paris Getaway",
    subtitle: "The city of love awaits you",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop&q=80",
    rating: 4.9,
    reviews: 15632,
    location: "Paris, France",
    category: "Romance",
  },
];

const DiscoveryFeed = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());

  const filters = [
    { id: "all", label: t?.all || "All", icon: TrendingUp },
    { id: "destination", label: t?.destinations || "Destinations", icon: MapPin },
    { id: "experience", label: t?.experiences || "Experiences", icon: Camera },
    { id: "review", label: t?.reviews || "Reviews", icon: MessageCircle },
  ];

  const filteredItems = activeFilter === "all" 
    ? discoveryItems 
    : discoveryItems.filter(item => item.type === activeFilter);

  const toggleSave = (id: string) => {
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-gray-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2">
            <Camera className="w-4 h-4 mr-2 inline" />
            {t?.getInspired || "Get Inspired"}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            {t?.discoverYourNextAdventure || "Discover Your Next Adventure"}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t?.exploreCuratedExperiences || "Explore curated experiences, read traveler stories, and find your perfect destination"}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                className={`rounded-full px-6 py-2.5 font-semibold transition-all duration-300 ${
                  activeFilter === filter.id
                    ? "bg-primary text-white shadow-lg scale-105"
                    : "bg-white hover:bg-primary/5 border-2"
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {filter.label}
              </Button>
            );
          })}
        </div>

        {/* Discovery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredItems.map((item, index) => {
            // Map destinations to search parameters
            const getDestinationParam = () => {
              // Extract city name from location (e.g., "Dubai, UAE" -> "Dubai")
              const cityName = item.location.split(",")[0].trim();
              return cityName;
            };

            const handleCardClick = () => {
              const destination = getDestinationParam();
              // Navigate to search with destination parameter (no API call)
              navigate(`/search?destination=${encodeURIComponent(destination)}&showHardcoded=true`);
            };

            return (
            <Card
              key={item.id}
              className={`group overflow-hidden border-2 border-gray-100 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer ${
                item.featured ? "lg:col-span-2 lg:row-span-1" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={handleCardClick}
            >
              <div className={`relative ${item.featured ? "h-80" : "h-64"} overflow-hidden`}>
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Featured Badge */}
                {item.featured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-yellow-500 text-black font-bold px-3 py-1 shadow-lg border-0">
                      <Star className="w-3 h-3 mr-1 fill-black" />
                      {t?.featured || "Featured"}
                    </Badge>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/95 text-primary font-semibold px-3 py-1 shadow-lg border border-white/50">
                    {item.category}
                  </Badge>
                </div>

                {/* Save Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSave(item.id);
                  }}
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
                >
                  <Bookmark
                    className={`w-5 h-5 transition-colors ${
                      savedItems.has(item.id) ? "fill-primary text-primary" : "text-gray-600"
                    }`}
                  />
                </button>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  {/* User Info (for reviews/experiences) */}
                  {item.userName && (
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={item.userPhoto}
                        alt={item.userName}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                      />
                      <span className="text-white text-sm font-semibold drop-shadow-lg">
                        {item.userName}
                      </span>
                    </div>
                  )}

                  {/* Title & Subtitle */}
                  <h3 className="text-white text-xl md:text-2xl font-bold mb-2 drop-shadow-lg leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-white/90 text-sm md:text-base mb-3 drop-shadow-md line-clamp-2">
                    {item.subtitle}
                  </p>

                  {/* Rating & Location */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-full shadow-lg">
                        <Star className="w-4 h-4 fill-white" />
                        <span className="font-bold text-sm">{item.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/90 text-sm">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{item.reviews.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-white/90 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{item.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            );
          })}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            className="rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Explore More Inspiration
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DiscoveryFeed;

