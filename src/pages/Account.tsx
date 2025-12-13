import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Calendar,
  Star,
  Camera,
  Mail,
  Phone,
  Globe,
  User as UserIcon,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";

const Account = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  const [profile, setProfile] = useState({
    name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : "Guest User",
    email: user?.email || "guest@example.com",
    phone: user?.phone || "Not provided",
    location: user?.nationality || "Not specified",
    avatar: user?.profile_url || "https://github.com/shadcn.png",
    bio: "Passionate traveler exploring the world one destination at a time.",
    joinDate: user?.created_at ? (() => {
      const date = new Date(user.created_at);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    })() : "Recently",
  });

  useEffect(() => {
    // Give time for auth to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect after loading is complete
    if (!isLoading && !isAuthenticated && !user) {
      console.log('⚠️ Not authenticated, redirecting to home');
      navigate('/');
      return;
    }

    if (user) {
      setProfile({
        name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : "Guest User",
        email: user.email || "guest@example.com",
        phone: user.phone || "Not provided",
        location: user.nationality || "Not specified",
        avatar: user.profile_url || "https://github.com/shadcn.png",
        bio: "Passionate traveler exploring the world one destination at a time.",
        joinDate: user.created_at ? (() => {
      const date = new Date(user.created_at);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    })() : "Recently",
      });
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  const stats = [
    { label: "Trips completed", value: "12" },
    { label: "Reviews written", value: "8" },
    { label: "Years hosting", value: "2" },
  ];

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main
        className="w-full py-8 px-6 pt-header-plus-15"
        style={{
          paddingTop: "calc(var(--header-height-default) + 31px + 14px)",
        }}
      >
        {/* Profile Header */}
        <Card className="mb-8 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback>
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/account-settings')}
                    className="flex items-center space-x-2"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>{t?.editProfile || "Edit Profile"}</span>
                  </Button>
                </div>

                <p className="text-muted-foreground mb-4">{profile.bio}</p>

                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {profile.joinDate}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-current text-yellow-400" />
                    4.9 rating
                  </div>
                  <Badge variant="secondary">Verified</Badge>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6">Account Details</h2>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{profile.email}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{profile.phone}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Nationality</div>
                  <div className="font-medium">{profile.location}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t flex gap-4">
              <Button onClick={() => navigate('/account-settings')} className="flex-1">
                Edit Profile
              </Button>
              <Button onClick={() => navigate('/profile')} variant="outline" className="flex-1">
                View Bookings
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
