import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslation } from '@/contexts/TranslationContext';

const PaymentCancelled = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleRetry = () => {
    // Navigate back to the booking page to retry payment
    const cartId = searchParams.get('cart_id');
    if (cartId) {
      navigate(`/booking/${cartId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16 mt-24">
        <Card className="max-w-2xl mx-auto border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-20 w-20 text-orange-600" />
            </div>
            <CardTitle className="text-center text-3xl text-orange-700">
              {t?.paymentCancelled || "Payment Cancelled"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-orange-800">
                {t?.paymentCancelledMessage || "You have cancelled the payment process."}
              </p>
              <p className="text-sm text-orange-600 mt-2">
                {t?.bookingNotConfirmed || "Your booking has not been confirmed. No charges have been made to your account."}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg mb-4">What happened?</h3>
              <p className="text-muted-foreground">
                The payment was cancelled before completion. This could happen if you:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>Clicked the "Cancel" or "Back" button on the payment page</li>
                <li>Closed the payment window</li>
                <li>Experienced a timeout during the payment process</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Want to complete your booking?</h4>
              <p className="text-sm text-blue-700">
                Your booking is still available. Click the button below to return and complete the payment.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleRetry}
                className="w-full"
                size="lg"
              >
                Complete My Booking
              </Button>
              
              <Button 
                onClick={() => navigate('/search')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Search for Other Hotels
              </Button>
              
              <Button 
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full"
                size="lg"
              >
                Back to Home
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Need assistance? Our support team is here to help: support@hotelrbs.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentCancelled;

