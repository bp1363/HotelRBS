import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft, Lightbulb, ChevronRight } from "lucide-react";

interface Step {
  id: string;
  title: string;
  content: string;
  target: string;
  position: "top" | "bottom" | "left" | "right";
}

const tourSteps: Step[] = [
  {
    id: "welcome",
    title: "Welcome to HotelRBS! 🏨",
    content: "I'm your AI guide. Let me show you around this amazing hotel booking platform. Click Next to start your tour!",
    target: "",
    position: "top"
  },
  {
    id: "search",
    title: "Smart Search",
    content: "Start by entering your destination, dates, and number of guests. Our intelligent search will find the perfect stays for you.",
    target: "search-card",
    position: "bottom"
  },
  {
    id: "listings",
    title: "Hotel Listings",
    content: "Browse through carefully curated hotels with detailed information, photos, and real guest reviews.",
    target: "hotel-listings",
    position: "right"
  },
  {
    id: "map",
    title: "Interactive Map",
    content: "See hotel locations on our interactive map. Click on price pins to get quick details and perfect location insights.",
    target: "map-view",
    position: "left"
  },
  {
    id: "booking",
    title: "Easy Booking",
    content: "Found your perfect stay? Book instantly with our secure, hassle-free reservation system.",
    target: "reserve-button",
    position: "top"
  }
];

const WalkthroughGuide = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    // Auto-start tour for first-time visitors
    const tourSeen = localStorage.getItem('hotelrbs-tour-seen');
    if (!tourSeen) {
      setTimeout(() => setIsActive(true), 2000);
    }
    setHasSeenTour(!!tourSeen);
  }, []);

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('hotelrbs-tour-seen', 'true');
    setHasSeenTour(true);
  };

  const skipTour = () => {
    finishTour();
  };

  if (!isActive && hasSeenTour) {
    return (
      <Button
        onClick={startTour}
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg animate-pulse-glow"
        size="lg"
      >
        <Lightbulb className="h-4 w-4 mr-2" />
        Take Tour
      </Button>
    );
  }

  if (!isActive) return null;

  const currentStepData = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" />
      
      {/* Guide Card */}
      <Card className="fixed z-50 w-96 animate-scale-in shadow-2xl border-primary/20" 
        style={{
          top: currentStep === 0 ? '50%' : '20%',
          left: currentStep === 0 ? '50%' : '20px',
          transform: currentStep === 0 ? 'translate(-50%, -50%)' : 'none',
        }}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 text-sm font-bold">
                AI
              </div>
              {currentStepData.title}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={skipTour}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {currentStepData.content}
          </p>

          {/* Progress Indicators */}
          <div className="flex space-x-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-primary flex-1' 
                    : 'bg-muted w-2'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-muted-foreground">
              {currentStep + 1} of {tourSteps.length}
            </div>
            
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={prevStep}>
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
              )}
              
              {currentStep < tourSteps.length - 1 ? (
                <Button size="sm" onClick={nextStep}>
                  Next
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={finishTour}>
                  Get Started
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {currentStep === 0 && (
            <div className="text-center pt-2">
              <Button variant="link" size="sm" onClick={skipTour} className="text-muted-foreground">
                Skip tour
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spotlight effect for current target */}
      {currentStep > 0 && (
        <div className="fixed inset-0 pointer-events-none z-45">
          <div 
            id={`spotlight-${currentStepData.target}`}
            className="absolute border-2 border-primary rounded-lg animate-pulse-glow"
            style={{
              // This would be dynamically calculated based on target element
              top: '100px',
              left: '50px',
              width: '300px',
              height: '200px',
            }}
          />
        </div>
      )}
    </>
  );
};

export default WalkthroughGuide;