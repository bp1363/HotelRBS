/**
 * PayORC Iframe Payment Component
 * 
 * Embeds PayORC payment form in an iframe for seamless checkout experience
 * Reference: https://api.payorc.com/#api-Checkout-iframe
 */

import { useEffect, useRef, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PayORCIframeProps {
  iframeUrl: string;
  orderId: string;
  onSuccess: (orderId: string, transactionId?: string) => void;
  onFailure: (orderId: string, error?: string) => void;
  onCancel: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const PayORCIframe: React.FC<PayORCIframeProps> = ({
  iframeUrl,
  orderId,
  onSuccess,
  onFailure,
  onCancel,
  isOpen,
  onClose,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Listen for postMessage from PayORC iframe
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security (adjust based on PayORC's domain)
      // const allowedOrigins = ['https://nodeserver.payorc.com', 'https://payorc.com'];
      // if (!allowedOrigins.includes(event.origin)) {
      //   console.warn('⚠️ Message from unauthorized origin:', event.origin);
      //   return;
      // }

      console.log('📨 Received message from PayORC iframe:', event.data);

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Handle different message types from PayORC
        if (data.type === 'payment_success' || data.status === 'success' || data.status === 'AUTHORIZED') {
          console.log('✅ Payment successful via iframe');
          setIsLoading(false);
          onSuccess(orderId, data.transaction_id || data.transactionId);
        } else if (data.type === 'payment_failure' || data.status === 'failed' || data.status === 'DECLINED') {
          console.log('❌ Payment failed via iframe');
          setIsLoading(false);
          onFailure(orderId, data.error || data.message || 'Payment failed');
        } else if (data.type === 'payment_cancelled' || data.status === 'cancelled') {
          console.log('⚠️ Payment cancelled via iframe');
          setIsLoading(false);
          onCancel();
        } else if (data.type === 'iframe_loaded') {
          console.log('✅ PayORC iframe loaded');
          setIsLoading(false);
        } else if (data.type === 'iframe_error') {
          console.error('❌ Iframe error:', data.error);
          setError(data.error || 'Failed to load payment form');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('❌ Error parsing iframe message:', err);
      }
    };

    // Listen for URL changes in iframe (for redirect-based flows)
    const checkIframeUrl = () => {
      try {
        if (iframeRef.current?.contentWindow) {
          const iframeUrl = iframeRef.current.contentWindow.location.href;
          console.log('🔍 Iframe URL changed:', iframeUrl);

          // Check for success/failure indicators in URL
          if (iframeUrl.includes('success') || iframeUrl.includes('payment_success')) {
            onSuccess(orderId);
          } else if (iframeUrl.includes('failure') || iframeUrl.includes('payment_failure')) {
            onFailure(orderId, 'Payment failed');
          } else if (iframeUrl.includes('cancel') || iframeUrl.includes('payment_cancelled')) {
            onCancel();
          }
        }
      } catch (err) {
        // Cross-origin restrictions - this is expected
        // We'll rely on postMessage instead
      }
    };

    window.addEventListener('message', handleMessage);

    // Set loading timeout
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ Iframe loading timeout');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(loadingTimeout);
    };
  }, [isOpen, orderId, onSuccess, onFailure, onCancel, isLoading]);

  const handleIframeLoad = () => {
    console.log('✅ Iframe loaded');
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    console.error('❌ Iframe failed to load');
    setError('Failed to load payment form. Please try again.');
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Complete Payment</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative flex-1 px-6 pb-6">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading payment form...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-center p-6">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  if (iframeRef.current) {
                    iframeRef.current.src = iframeUrl;
                  }
                }}>
                  Retry
                </Button>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="w-full h-full min-h-[600px] border-0 rounded-lg"
            title="PayORC Payment Form"
            allow="payment"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{ minHeight: '600px' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

