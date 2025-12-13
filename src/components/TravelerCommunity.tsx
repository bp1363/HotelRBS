import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  ThumbsUp, 
  MessageCircle, 
  Camera,
  MapPin,
  TrendingUp,
  Users,
  Award
} from "lucide-react";

interface TravelerStory {
  id: string;
  userName: string;
  userPhoto: string;
  userBadge: string;
  destination: string;
  rating: number;
  title: string;
  excerpt: string;
  photos: string[];
  likes: number;
  comments: number;
  helpful: number;
  date: string;
  verified: boolean;
}

const travelerStories: TravelerStory[] = [
  {
    id: "1",
    userName: "Emma Thompson",
    userPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    userBadge: "Elite Traveler",
    destination: "Dubai, UAE",
    rating: 5,
    title: "An Unforgettable Week in the Desert Jewel",
    excerpt: "From the moment we arrived, Dubai exceeded all expectations. The Burj Khalifa views at sunset were absolutely breathtaking...",
    photos: [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80",
    ],
    likes: 342,
    comments: 28,
    helpful: 289,
    date: "2 days ago",
    verified: true,
  },
  {
    id: "2",
    userName: "James Rodriguez",
    userPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    userBadge: "Adventure Seeker",
    destination: "Maldives",
    rating: 5,
    title: "Paradise Found: Our Honeymoon in the Maldives",
    excerpt: "Words cannot describe the beauty of waking up to crystal-clear waters every morning. The overwater villa was pure luxury...",
    photos: [
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&h=300&fit=crop&q=80",
    ],
    likes: 567,
    comments: 45,
    helpful: 412,
    date: "5 days ago",
    verified: true,
  },
  {
    id: "3",
    userName: "Sophia Chen",
    userPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    userBadge: "Frequent Traveler",
    destination: "Paris, France",
    rating: 5,
    title: "The Magic of Paris Never Fades",
    excerpt: "My fifth visit to Paris and it still takes my breath away. Hidden gems in Montmartre, perfect croissants, and the Seine at twilight...",
    photos: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop&q=80",
    ],
    likes: 234,
    comments: 19,
    helpful: 187,
    date: "1 week ago",
    verified: true,
  },
];

const TravelerCommunity = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2">
            <Users className="w-4 h-4 mr-2 inline" />
            Traveler Community
          </Badge>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Real Stories from Real Travelers
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Join millions of travelers sharing their experiences, tips, and photos
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          {[
            { icon: Users, label: "Active Travelers", value: "2.5M+" },
            { icon: Camera, label: "Photos Shared", value: "50M+" },
            { icon: Star, label: "Reviews Written", value: "100M+" },
            { icon: Award, label: "Top Contributors", value: "15K+" },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-2 border-gray-100 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Traveler Stories Grid */}
        <div className="space-y-6 mb-12">
          {travelerStories.map((story, index) => (
            <Card
              key={story.id}
              className="overflow-hidden border-2 border-gray-100 hover:border-primary/30 hover:shadow-2xl transition-all duration-500"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-6 md:p-8">
                {/* User Header */}
                <div className="flex items-start gap-4 mb-6">
                  <img
                    src={story.userPhoto}
                    alt={story.userName}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover ring-4 ring-primary/20 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-lg text-foreground">{story.userName}</h3>
                      {story.verified && (
                        <Badge className="bg-blue-500 text-white border-0 px-2 py-0.5">
                          <Award className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge className="bg-primary/10 text-primary border-primary/20 px-2 py-0.5">
                        {story.userBadge}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{story.destination}</span>
                      </div>
                      <span>•</span>
                      <span>{story.date}</span>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-full shadow-md flex-shrink-0">
                    <Star className="w-4 h-4 fill-white" />
                    <span className="font-bold">{story.rating}.0</span>
                  </div>
                </div>

                {/* Story Content */}
                <div className="mb-6">
                  <h4 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                    {story.title}
                  </h4>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {story.excerpt}
                  </p>
                </div>

                {/* Photos Grid */}
                <div className={`grid ${story.photos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-3 mb-6`}>
                  {story.photos.map((photo, photoIndex) => (
                    <div
                      key={photoIndex}
                      className="relative aspect-video overflow-hidden rounded-xl group cursor-pointer"
                    >
                      <img
                        src={photo}
                        alt={`${story.destination} - ${photoIndex + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interaction Bar */}
                <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors group">
                      <ThumbsUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-sm">{story.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors group">
                      <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-sm">{story.comments}</span>
                    </button>
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-semibold text-sm">{story.helpful} found helpful</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold"
                  >
                    Read Full Story
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA to Join Community */}
        <Card className="border-0 bg-gradient-to-br from-primary to-primary-hover text-white shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          <CardContent className="p-12 text-center relative z-10">
            <div className="max-w-2xl mx-auto">
              <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h3 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Share Your Travel Story
              </h3>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                Join our community of passionate travelers. Share your experiences, help others plan their trips, and earn rewards.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100 rounded-full px-8 py-6 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Share Your Story
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8 py-6 font-bold transition-all duration-300"
                >
                  Explore More Stories
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default TravelerCommunity;

