import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { checkTelrOrderStatus } from '@/services/telrPaymentApi';
import { useTranslation } from '@/contexts/TranslationContext';

const PaymentFailure = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [failureDetails, setFailureDetails] = useState<any>(null);

  useEffect(() => {
    const verifyFailure = async () => {
      const orderRef = searchParams.get('order_ref') || searchParams.get('ref');
      
      if (!orderRef) {
        setIsVerifying(false);
        return;
      }

      try {
        console.log('🔍 Checking declined payment for order:', orderRef);
        
        const statusResponse = await checkTelrOrderStatus(orderRef);
        
        console.log('📋 Payment failure details:', statusResponse);
        
        setFailureDetails(statusResponse.order);
      } catch (error) {
        console.error('❌ Error checking payment status:', error);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyFailure();
  }, [searchParams]);

  const handleRetry = () => {
    // Navigate back to the booking page to retry payment
    const cartId = searchParams.get('cart_id') || failureDetails?.cartid;
    if (cartId) {
      navigate(`/booking/${cartId}`);
    } else {
      navigate('/');
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 mt-24">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-16 pb-16">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <h2 className="text-2xl font-bold">{t?.checkingPaymentStatus || "Checking Payment Status..."}</h2>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16 mt-24">
        <Card className="max-w-2xl mx-auto border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <XCircle className="h-20 w-20 text-red-600" />
            </div>
            <CardTitle className="text-center text-3xl text-red-700">
              {t?.paymentDeclined || "Payment Declined"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-red-800">
                {t?.paymentNotSuccessful || "Unfortunately, your payment was not successful."}
              </p>
              <p className="text-sm text-red-600 mt-2">
                {t?.bookingNotConfirmed || "Your booking has not been confirmed. No charges have been made to your account."}
              </p>
            </div>

            {failureDetails && (
              <div className="bg-white rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Payment Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Reference</p>
                    <p className="font-medium">{failureDetails.ref}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Booking ID</p>
                    <p className="font-medium">{failureDetails.cartid}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Attempted Amount</p>
                    <p className="font-medium">
                      {failureDetails.currency} {failureDetails.amount}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium text-red-600">{failureDetails.status.text}</p>
                  </div>

                  {failureDetails.transaction && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Reason</p>
                      <p className="font-medium text-red-600">
                        {failureDetails.transaction.message || 'Payment was declined by your bank'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Common reasons for payment failure:</h4>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                <li>Insufficient funds in your account</li>
                <li>Card details entered incorrectly</li>
                <li>Card expired or blocked</li>
                <li>Transaction limit exceeded</li>
                <li>3D Secure authentication failed</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleRetry}
                className="w-full"
                size="lg"
              >
                Try Again with Different Payment Method
              </Button>
              
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Back to Home
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Need help? Contact our support team at support@hotelrbs.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentFailure;

