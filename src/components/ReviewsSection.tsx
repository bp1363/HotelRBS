import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  avatar: string;
  location: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    comment:
      "Amazing experience! The hotel was luxurious and the service was exceptional. Will definitely book again.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    location: "New York, USA",
  },
  {
    id: 2,
    name: "Ahmed Al-Rashid",
    rating: 5,
    comment:
      "Perfect location and wonderful staff. The amenities exceeded our expectations. Highly recommended!",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    location: "Riyadh, Saudi Arabia",
  },
  {
    id: 3,
    name: "Maria Garcia",
    rating: 5,
    comment:
      "Beautiful rooms with stunning views. The breakfast was delicious and the pool area was fantastic.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    location: "Barcelona, Spain",
  },
  {
    id: 4,
    name: "David Chen",
    rating: 5,
    comment:
      "Exceptional service and attention to detail. The concierge helped us with everything we needed.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    location: "Tokyo, Japan",
  },
  {
    id: 5,
    name: "Emma Thompson",
    rating: 5,
    comment:
      "The most relaxing vacation ever! Beautiful spa facilities and amazing room service.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    location: "London, UK",
  },
  {
    id: 6,
    name: "Omar Hassan",
    rating: 5,
    comment:
      "Great value for money. Clean rooms, friendly staff, and excellent location near attractions.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    location: "Dubai, UAE",
  },
  {
    id: 7,
    name: "Sophie Laurent",
    rating: 5,
    comment:
      "Absolutely stunning property! Every detail was perfect, from the elegant decor to the attentive service. A true gem!",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    location: "Paris, France",
  },
  {
    id: 8,
    name: "James Miller",
    rating: 4,
    comment:
      "Wonderful stay with my family. The kids loved the pool and the staff went above and beyond to make us comfortable.",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    location: "Sydney, Australia",
  },
  {
    id: 9,
    name: "Priya Sharma",
    rating: 5,
    comment:
      "Best hotel experience I've had! The rooftop restaurant was incredible and the sunset views were breathtaking.",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
    location: "Mumbai, India",
  },
  {
    id: 10,
    name: "Carlos Rodriguez",
    rating: 5,
    comment:
      "Outstanding hospitality! The room was immaculate and the breakfast buffet had an amazing variety of options.",
    avatar:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop&crop=face",
    location: "Mexico City, Mexico",
  },
  {
    id: 11,
    name: "Yuki Tanaka",
    rating: 5,
    comment:
      "Perfectly located for sightseeing. The concierge recommendations were spot-on and saved us so much time planning.",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop&crop=face",
    location: "Osaka, Japan",
  },
  {
    id: 12,
    name: "Isabella Costa",
    rating: 4,
    comment:
      "Lovely boutique hotel with character. The complimentary wine tasting was a delightful surprise!",
    avatar:
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face",
    location: "Lisbon, Portugal",
  },
  {
    id: 13,
    name: "Michael O'Brien",
    rating: 5,
    comment:
      "First-class service from check-in to check-out. The fitness center and spa were world-class facilities.",
    avatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=face",
    location: "Dublin, Ireland",
  },
  {
    id: 14,
    name: "Fatima Al-Mansoori",
    rating: 5,
    comment:
      "Exceeded all expectations! The attention to detail in every aspect of our stay was remarkable. Will be back soon!",
    avatar:
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=100&h=100&fit=crop&crop=face",
    location: "Abu Dhabi, UAE",
  },
  {
    id: 15,
    name: "Lucas Silva",
    rating: 5,
    comment:
      "Amazing beach resort! Crystal clear waters, pristine beaches, and the most helpful staff. Paradise found!",
    avatar:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face",
    location: "Rio de Janeiro, Brazil",
  },
];

const ReviewsSection = () => {
  const { t } = useTranslation();
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            {t?.whatTravelersSay || "What Travelers Say"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t?.readReviews || "Read reviews from verified travelers"}
          </p>
        </div>

        <div className="relative">
          <div
            className="flex gap-6 animate-scroll"
            style={{ 
              display: 'flex',
              width: 'max-content'
            }}
          >
            {/* Triple reviews for ultra-smooth seamless loop */}
            {[...reviews, ...reviews, ...reviews].map((review, index) => (
              <Card
                key={`${review.id}-${index}`}
                className="min-w-[350px] sm:min-w-[400px] flex-shrink-0 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white border-2 border-gray-100 group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-16 h-16 rounded-full object-cover ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300 shadow-md"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1.5 shadow-lg">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-foreground text-base">
                            {review.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {review.location}
                          </p>
                        </div>
                        <div className="flex items-center space-x-0.5 flex-shrink-0 ml-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                        "{review.comment}"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
