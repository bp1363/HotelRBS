import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AirbnbSearchBar from "@/components/AirbnbSearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Heart, Camera, Award, Wifi, Car, Coffee } from "lucide-react";

const DestinationDetail = () => {
  const { destination } = useParams();

  // Mock data based on destination
  const destinationData = {
    riyadh: {
      name: "Riyadh",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop",
      description: "Discover Saudi Arabia's dynamic capital city, where modern skyscrapers meet traditional markets, and ancient heritage blends with cutting-edge innovation.",
      highlights: ["Kingdom Centre Tower", "National Museum", "Masmak Fortress", "King Abdulaziz Historical Center"],
      experiences: [
        {
          title: "Desert Adventures",
          image: "https://images.unsplash.com/photo-1539650116574-75c0c6d89c0e?w=600&h=400&fit=crop",
          description: "Experience camel riding and traditional Bedouin culture"
        },
        {
          title: "Cultural Heritage",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
          description: "Explore museums, souks, and historic sites"
        },
        {
          title: "Modern Luxury",
          image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop",
          description: "Shop at world-class malls and dine at fine restaurants"
        }
      ]
    },
    jeddah: {
      name: "Jeddah",
      image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1200&h=800&fit=crop",
      description: "The gateway to Mecca and the beating heart of the Red Sea, where ancient trading routes meet modern cosmopolitan life.",
      highlights: ["Historic Jeddah", "Corniche Waterfront", "King Fahd Fountain", "Al-Balad Old Town"],
      experiences: [
        {
          title: "Red Sea Activities",
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
          description: "Diving, snorkeling, and water sports"
        },
        {
          title: "Historic Al-Balad",
          image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
          description: "UNESCO World Heritage old town exploration"
        },
        {
          title: "Waterfront Dining",
          image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
          description: "Fresh seafood and international cuisine by the sea"
        }
      ]
    }
  };

  const currentDestination = destinationData[destination as keyof typeof destinationData] || destinationData.riyadh;

  const hotels = [
    {
      id: "1",
      name: `Luxury Hotel ${currentDestination.name}`,
      location: `Downtown ${currentDestination.name}`,
      price: 450,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      amenities: ["Pool", "Spa", "Restaurant", "Gym"],
      isGuestFavorite: true
    },
    {
      id: "2",
      name: `Boutique Hotel ${currentDestination.name}`,
      location: `Historic District`,
      price: 320,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      amenities: ["Wifi", "Breakfast", "Rooftop", "Concierge"]
    },
    {
      id: "3",
      name: `Business Hotel ${currentDestination.name}`,
      location: `Financial District`,
      price: 280,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
      amenities: ["Meeting Rooms", "Business Center", "Airport Shuttle"]
    },
    {
      id: "4",
      name: `Resort ${currentDestination.name}`,
      location: `Waterfront Area`,
      price: 590,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      amenities: ["Private Beach", "Multiple Pools", "Spa", "Fine Dining"],
      isGuestFavorite: true
    },
    {
      id: "5",
      name: `Eco Lodge ${currentDestination.name}`,
      location: `Nature Reserve`,
      price: 380,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      amenities: ["Sustainable", "Hiking", "Local Cuisine", "Wellness"]
    },
    {
      id: "6",
      name: `Heritage Hotel ${currentDestination.name}`,
      location: `Old Town`,
      price: 420,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop",
      amenities: ["Traditional Architecture", "Cultural Tours", "Authentic Dining"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-header-plus-20" style={{ paddingTop: 'calc(var(--header-height-default) + 20px + 20px)' }}>
        {/* Hero Section */}
        <section className="relative h-96 overflow-hidden">
          <img 
            src={currentDestination.image} 
            alt={currentDestination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-5xl font-bold mb-4">{currentDestination.name}</h1>
              <p className="text-xl max-w-2xl mx-auto px-4">
                {currentDestination.description}
              </p>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="w-full px-6 lg:px-8 -mt-8 relative z-10">
          <AirbnbSearchBar />
        </section>

        {/* Highlights */}
        <section className="w-full px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-8">Must-Visit Attractions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentDestination.highlights.map((highlight, index) => (
              <Card key={index} className="p-4 text-center shadow-intense-3d hover:shadow-intense-3d-hover transition-all duration-300 rounded-2xl hover:scale-[1.05] hover:-translate-y-2">
                <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-medium text-sm">{highlight}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Experiences */}
        <section className="bg-muted/30 py-16">
          <div className="w-full px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8">Popular Experiences</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {currentDestination.experiences.map((experience, index) => (
                <Card key={index} className="group cursor-pointer overflow-hidden shadow-intense-3d hover:shadow-intense-3d-hover transition-all duration-300 rounded-3xl hover:scale-[1.05] hover:-translate-y-2">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img 
                      src={experience.image} 
                      alt={experience.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <h3 className="text-white font-bold text-xl mb-2">
                        {experience.title}
                      </h3>
                      <p className="text-white/90 text-sm">
                        {experience.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Hotels Section */}
        <section className="w-full px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Places to stay in {currentDestination.name}
              </h2>
              <p className="text-muted-foreground mt-2">
                Over 300 places to stay
              </p>
            </div>
            <Button variant="outline" className="rounded-full">
              <Camera className="h-4 w-4 mr-2" />
              Show map
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel, index) => (
              <Link key={hotel.id} to={`/hotel/${hotel.id}`}>
                <Card className="group cursor-pointer overflow-hidden shadow-intense-3d hover:shadow-intense-3d-hover transition-all duration-300 rounded-3xl hover:scale-[1.05] hover:-translate-y-2">
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={hotel.image} 
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button className="absolute top-3 right-3 p-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition-all duration-200 hover:scale-110">
                        <Heart className="h-4 w-4 text-white" />
                      </button>
                      
                      {hotel.isGuestFavorite && (
                        <div className="absolute top-3 left-3">
                          <div className="bg-white text-gray-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <Award className="h-3 w-3 mr-1" />
                            Guest favorite
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {hotel.name}
                          </h3>
                          <div className="flex items-center text-muted-foreground text-sm mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{hotel.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-medium text-sm">{hotel.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {hotel.amenities.slice(0, 3).map((amenity) => (
                          <span key={amenity} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full flex items-center">
                            {amenity === "Wifi" && <Wifi className="h-3 w-3 mr-1" />}
                            {amenity === "Parking" && <Car className="h-3 w-3 mr-1" />}
                            {amenity === "Restaurant" && <Coffee className="h-3 w-3 mr-1" />}
                            {amenity}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-baseline space-x-1">
                        <span className="font-semibold text-foreground text-lg">
                          ${hotel.price}
                        </span>
                        <span className="text-muted-foreground text-sm">night</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button size="lg" variant="outline" className="px-8 rounded-full">
              Show all properties
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default DestinationDetail;