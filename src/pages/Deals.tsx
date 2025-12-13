import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, MapPin, Tag, TrendingDown, Sparkles, Percent, Gift, Zap } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

const Deals = () => {
  const { t } = useTranslation();
  const deals = [
    {
      id: 1,
      title: "Weekend Getaway Special",
      originalPrice: 450,
      salePrice: 320,
      discount: 29,
      hotel: "Riyadh Palace Hotel",
      location: "Riyadh",
      rating: 4.5,
      reviews: 234,
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      validUntil: "Dec 31, 2024",
      features: ["Free Breakfast", "Pool Access", "WiFi"],
    },
    {
      id: 2,
      title: "Early Bird Booking",
      originalPrice: 380,
      salePrice: 285,
      discount: 25,
      hotel: "Jeddah Corniche Resort",
      location: "Jeddah",
      rating: 4.7,
      reviews: 189,
      image:
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
      validUntil: "Dec 25, 2024",
      features: ["Sea View", "Spa Access", "Restaurant"],
    },
    {
      id: 3,
      title: "Family Package Deal",
      originalPrice: 520,
      salePrice: 399,
      discount: 23,
      hotel: "Al Khobar Beach Hotel",
      location: "Al Khobar",
      rating: 4.3,
      reviews: 156,
      image:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
      validUntil: "Jan 15, 2025",
      features: ["Kids Club", "Family Rooms", "Pool"],
    },
    {
      id: 4,
      title: "Business Traveler Special",
      originalPrice: 340,
      salePrice: 275,
      discount: 19,
      hotel: "Executive Tower Hotel",
      location: "Riyadh",
      rating: 4.6,
      reviews: 298,
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      validUntil: "Dec 20, 2024",
      features: ["Business Center", "Meeting Rooms", "Airport Shuttle"],
    },
  ];

  const flashDeals = [
    {
      id: 1,
      title: "Flash Sale - 48 Hours Only!",
      discount: 40,
      hotel: "Luxury Resort Abha",
      originalPrice: 600,
      salePrice: 360,
      timeLeft: "23:45:12",
    },
    {
      id: 2,
      title: "Limited Time Offer",
      discount: 35,
      hotel: "Desert Oasis Hotel",
      originalPrice: 420,
      salePrice: 273,
      timeLeft: "15:23:45",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-hover to-primary pt-32 md:pt-40 pb-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=600&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <Badge className="mb-6 bg-white/90 text-primary border-white/20 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2 inline" />
            {t?.limitedTime || "Limited Time Offers"}
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white mb-6">
            {t?.exclusiveOffers || "Exclusive Deals"}
            <span className="block bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
              {t?.findBestDeals || "Save Up to 50%"}
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            {t?.findBestDeals || "Discover unbeatable offers on premium hotels and resorts. Book now and save big on your next adventure!"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white">
              <Percent className="w-5 h-5" />
              <span className="font-semibold">Up to 50% {t?.off || "Off"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">{t?.flashDeals || "Flash Deals"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">{t?.exclusiveOffers || "Exclusive Perks"}</span>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-white">
        {/* Premium Deals Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Badge className="bg-yellow-500 text-black font-bold px-3 py-1 shadow-lg border-0">
                    <Star className="w-4 h-4 mr-1 fill-black" />
                    Premium Collection
                  </Badge>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                  Luxury Deals
                </h2>
                <p className="text-lg text-muted-foreground">
                  Exclusive offers on 5-star hotels and resorts
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {deals.slice(0, 3).map((deal) => (
              <Card
                key={deal.id}
                className="group overflow-hidden shadow-intense-3d hover:shadow-intense-3d-hover transition-all duration-300 cursor-pointer rounded-2xl border-0 bg-gradient-to-br from-white to-muted/30 hover:scale-[1.05] hover:-translate-y-2"
                onClick={() => (window.location.href = `/hotel/${deal.id}`)}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.hotel}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <Badge className="bg-white/90 text-primary border-0 font-semibold backdrop-blur-sm">
                      {deal.discount}% {t?.off?.toUpperCase() || "OFF"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-black/70 text-white border-0 backdrop-blur-sm"
                    >
                      {t?.featured || "Premium"}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{deal.rating}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {deal.location}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">
                    {deal.hotel}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {deal.title}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {deal.features.slice(0, 2).map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-muted-foreground line-through text-lg">
                      ${deal.originalPrice}
                    </span>
                    <span className="text-3xl font-bold text-foreground">
                      ${deal.salePrice}
                    </span>
                    <span className="text-muted-foreground">{t?.perNight || "per night"}</span>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl group-hover:shadow-lg transition-all">
                    {t?.bookNow || "Book Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          </div>
        </section>

        {/* Regular Deals */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Best Deals Available
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {deals.map((deal) => (
              <Card
                key={deal.id}
                className="overflow-hidden shadow-intense-3d hover:shadow-intense-3d-hover transition-all duration-300 group cursor-pointer rounded-2xl hover:scale-[1.05] hover:-translate-y-2"
                onClick={() => (window.location.href = `/hotel/${deal.id}`)}
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.hotel}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    {deal.discount}% {t?.off?.toUpperCase() || "OFF"}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{deal.title}</h3>
                  </div>
                  <p className="text-foreground font-medium mb-1">
                    {deal.hotel}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-black text-black" />
                      <span>{deal.rating}</span>
                      <span>({deal.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{deal.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {deal.features.map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-muted px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-muted-foreground line-through">
                      ${deal.originalPrice}
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      ${deal.salePrice}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {t?.perNight || "per night"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
                    <Clock className="h-4 w-4" />
                    <span>{t?.validUntil || "Valid until"} {deal.validUntil}</span>
                  </div>

                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/hotel/${deal.id}`;
                    }}
                  >
                    {t?.bookNow || "Book Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-primary to-primary-hover text-white overflow-hidden relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>
              <CardContent className="p-12 text-center relative z-10">
                <Gift className="w-16 h-16 mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  {t?.specialDeals || "Never Miss a Deal"}
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  {t?.findBestDeals || "Subscribe to our newsletter and be the first to know about exclusive offers, flash sales, and special promotions"}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder={t?.enterDetails || "Enter your email"}
                    className="flex-1 px-6 py-4 rounded-xl border-0 text-gray-900 shadow-lg"
                  />
                  <Button size="lg" className="bg-white text-primary hover:bg-blue-50 rounded-xl px-8 py-4 font-bold shadow-xl">
                    {t?.submit || "Subscribe"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default Deals;
