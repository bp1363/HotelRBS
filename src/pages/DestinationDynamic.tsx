import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, Star, ArrowLeft } from "lucide-react";

const DestinationDynamic = () => {
  const { destination } = useParams<{ destination: string }>();

  const destinationsData = [
    {
      id: 1,
      name: "Riyadh",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      description:
        "The capital city with modern architecture and rich culture. Explore the bustling metropolis where tradition meets innovation.",
      properties: "500+ properties",
      highlights: [
        "King Abdulaziz Historical Center",
        "Diriyah",
        "Kingdom Centre",
      ],
      hotels: [
        {
          id: "1",
          name: "Al Faisaliah Hotel",
          location: "Riyadh City Center",
          price: 450,
          rating: 4.8,
          image:
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
          features: ["Pool", "Spa", "Restaurant"],
        },
        {
          id: "2",
          name: "Four Seasons Hotel Riyadh",
          location: "Kingdom Centre",
          price: 650,
          rating: 4.9,
          image:
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
          features: ["Luxury", "Business Center", "Gym"],
        },
        {
          id: "3",
          name: "The Ritz-Carlton Riyadh",
          location: "Diplomatic Quarter",
          price: 580,
          rating: 4.9,
          image:
            "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
          features: ["Luxury", "Spa", "Fine Dining"],
        },
      ],
    },
    {
      id: 2,
      name: "Jeddah",
      image:
        "https://tse3.mm.bing.net/th/id/OIP.koqoS6v2ls3pVIuqLyWZgAHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      description:
        "Gateway to Mecca with beautiful Red Sea coastline. Experience the historic charm and vibrant culture of this coastal gem.",
      properties: "300+ properties",
      highlights: ["Historic Jeddah", "Corniche", "King Fahd Fountain"],
      hotels: [
        {
          id: "4",
          name: "Jeddah Hilton",
          location: "Corniche Road",
          price: 380,
          rating: 4.6,
          image:
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop",
          features: ["Sea View", "Beach Access", "Pool"],
        },
        {
          id: "5",
          name: "Movenpick Hotel Jeddah",
          location: "City Center",
          price: 320,
          rating: 4.5,
          image:
            "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop",
          features: ["Modern", "Restaurant", "Gym"],
        },
      ],
    },
    {
      id: 3,
      name: "Dubai",
      image:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop",
      description:
        "World-class luxury destination with iconic architecture. Discover the perfect blend of tradition and futuristic innovation.",
      properties: "450+ properties",
      highlights: ["Burj Khalifa", "Dubai Mall", "Palm Jumeirah"],
      hotels: [
        {
          id: "6",
          name: "Burj Al Arab",
          location: "Jumeirah Beach",
          price: 1200,
          rating: 5.0,
          image:
            "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=600&fit=crop",
          features: ["7-Star Luxury", "Butler Service", "Private Beach"],
        },
        {
          id: "7",
          name: "Atlantis The Palm",
          location: "Palm Jumeirah",
          price: 800,
          rating: 4.8,
          image:
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop",
          features: ["Water Park", "Aquarium", "Multiple Restaurants"],
        },
      ],
    },
    {
      id: 4,
      name: "Abu Dhabi",
      image:
        "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop",
      description:
        "UAE's capital with cultural landmarks and luxury resorts. Immerse yourself in the rich heritage and modern marvels.",
      properties: "280+ properties",
      highlights: ["Sheikh Zayed Mosque", "Louvre Abu Dhabi", "Yas Island"],
      hotels: [
        {
          id: "8",
          name: "Emirates Palace",
          location: "Corniche Road",
          price: 900,
          rating: 4.9,
          image:
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
          features: ["Palace Luxury", "Private Beach", "Gold Vending Machine"],
        },
        {
          id: "9",
          name: "St. Regis Saadiyat Island",
          location: "Saadiyat Island",
          price: 650,
          rating: 4.8,
          image:
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
          features: ["Island Resort", "Golf Course", "Spa"],
        },
      ],
    },
    {
      id: 5,
      name: "Doha",
      image:
        "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&h=600&fit=crop",
      description:
        "Qatar's modern capital with stunning skyline and culture. Experience the perfect fusion of Arabian heritage and contemporary luxury.",
      properties: "200+ properties",
      highlights: ["Museum of Islamic Art", "Souq Waqif", "The Pearl"],
      hotels: [
        {
          id: "10",
          name: "Four Seasons Hotel Doha",
          location: "West Bay",
          price: 550,
          rating: 4.7,
          image:
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
          features: ["City Views", "Spa", "Multiple Restaurants"],
        },
      ],
    },
    {
      id: 6,
      name: "Kuwait City",
      image:
        "https://tse4.mm.bing.net/th/id/OIP.8sYh-l-VuCsue09Mdck5sAHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      description:
        "Historic trading hub with modern amenities. Explore the rich history and vibrant culture of this Gulf pearl.",
      properties: "150+ properties",
      highlights: ["Kuwait Towers", "Grand Mosque", "Liberation Tower"],
      hotels: [
        {
          id: "11",
          name: "JW Marriott Kuwait",
          location: "Kuwait City",
          price: 420,
          rating: 4.6,
          image:
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
          features: ["City Center", "Business Facilities", "Pool"],
        },
      ],
    },
    {
      id: 7,
      name: "Mecca",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      description:
        "Islam's holiest city and pilgrimage destination. Experience the spiritual heart of the Islamic world.",
      properties: "120+ properties",
      highlights: ["Masjid al-Haram", "Kaaba", "Abraj Al-Bait"],
      hotels: [
        {
          id: "12",
          name: "Fairmont Makkah Clock Royal Tower",
          location: "Abraj Al-Bait",
          price: 800,
          rating: 4.8,
          image:
            "https://images.unsplash.com/photo-1580192225370-ad0c5b6f5ebc?w=800&h=600&fit=crop",
          features: ["Haram View", "Luxury", "Shopping Mall"],
        },
      ],
    },
    {
      id: 8,
      name: "Medina",
      image:
        "https://travelsetu.com/apps/uploads/new_destinations_photos/destination/2024/07/02/2d6fa30789443a03920f8c4374cda018_1000x1000.jpg",
      description:
        "The Prophet's city with profound Islamic heritage. Connect with the sacred history and peaceful atmosphere.",
      properties: "95+ properties",
      highlights: ["Al-Masjid an-Nabawi", "Quba Mosque", "Mount Uhud"],
      hotels: [
        {
          id: "13",
          name: "Anwar Al Madinah Movenpick",
          location: "Al Haram",
          price: 600,
          rating: 4.7,
          image:
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
          features: ["Haram Proximity", "Modern", "Restaurant"],
        },
      ],
    },
    {
      id: 9,
      name: "Dammam",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      description:
        "Eastern province hub with coastal attractions. Discover the industrial heart with beautiful coastal scenery.",
      properties: "180+ properties",
      highlights: ["King Fahd Park", "Coral Island", "Half Moon Bay"],
      hotels: [
        {
          id: "14",
          name: "Holiday Inn Dammam",
          location: "King Fahd Road",
          price: 280,
          rating: 4.4,
          image:
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
          features: ["Business Center", "Pool", "Restaurant"],
        },
      ],
    },
    {
      id: 10,
      name: "Taif",
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      description:
        "Mountain resort known for roses and cool climate. Escape to the refreshing highlands and fragrant rose gardens.",
      properties: "65+ properties",
      highlights: ["Shubra Palace", "Rose Garden", "Al Hada Mountain"],
      hotels: [
        {
          id: "15",
          name: "Taif Rose Hotel",
          location: "City Center",
          price: 220,
          rating: 4.3,
          image:
            "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
          features: ["Mountain Views", "Garden", "Cool Climate"],
        },
      ],
    },
  ];

  const currentDestination = destinationsData.find(
    (dest) => dest.name.toLowerCase() === destination?.toLowerCase()
  );

  if (!currentDestination) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full px-6 lg:px-8 py-12 pt-header-plus-20 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Destination Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The destination you're looking for doesn't exist.
          </p>
          <Link to="/destinations">
            <Button>Back to Destinations</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main
        className="w-full px-6 lg:px-8 py-12 pt-header-plus-20"
        style={{
          paddingTop: "calc(var(--header-height-default) + 36px + 20px)",
        }}
      >
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            to="/destinations"
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Destinations</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative mb-16 rounded-3xl overflow-hidden">
          <div className="aspect-[21/9] relative">
            <img
              src={currentDestination.image}
              alt={currentDestination.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-12">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                {currentDestination.name}
              </h1>
              <p className="text-xl text-white/90 mb-6 max-w-3xl">
                {currentDestination.description}
              </p>
              <div className="flex items-center space-x-4 text-white/80">
                <div className="flex items-center space-x-1">
                  <Users className="h-5 w-5" />
                  <span>{currentDestination.properties}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Attractions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Popular Attractions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentDestination.highlights.map((highlight, index) => (
              <Card
                key={index}
                className="bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">{highlight}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Hotels in this destination */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              Hotels in {currentDestination.name}
            </h2>
            <Link to="/search" state={{ destination: currentDestination.name }}>
              <Button variant="outline">View All Hotels</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentDestination.hotels.map((hotel) => (
              <Link key={hotel.id} to={`/hotel/${hotel.id}`}>
                <Card className="overflow-hidden shadow-intense-3d hover:shadow-intense-3d-hover transition-all duration-300 group cursor-pointer rounded-2xl hover:scale-[1.05] hover:-translate-y-2">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg leading-tight line-clamp-2">
                        {hotel.name}
                      </h3>
                      <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                        <Star className="h-4 w-4 fill-black text-black" />
                        <span className="text-sm font-medium">
                          {hotel.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {hotel.location}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {hotel.features.map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs bg-muted px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-bold text-primary">
                          ${hotel.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          per night
                        </span>
                      </div>
                      <Button size="sm">Book Now</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <div className="text-center bg-muted/50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Explore {currentDestination.name}?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Book your perfect stay and start creating unforgettable memories in
            this amazing destination.
          </p>
          <Link to="/search" state={{ destination: currentDestination.name }}>
            <Button size="lg">Find Hotels</Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DestinationDynamic;
