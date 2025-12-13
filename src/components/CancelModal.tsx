import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { cancelHotelBooking, validateConfirmationNumber, formatCancellationMessage } from '@/services/cancelService';

interface CancelModalProps {
  onClose: () => void;
  hotelName?: string;
  bookingReference?: string;
}

const CancelModal: React.FC<CancelModalProps> = ({ 
  onClose, 
  hotelName = "Hotel", 
  bookingReference 
}) => {
  const [confirmationNumber, setConfirmationNumber] = useState(bookingReference || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cancellationResult, setCancellationResult] = useState<any>(null);

  const handleCancelBooking = async () => {
    console.log('🚫 Cancel booking initiated');
    
    // Validate confirmation number
    if (!validateConfirmationNumber(confirmationNumber)) {
      setErrorMessage('Please enter a valid confirmation number');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setCancellationResult(null);

    try {
      console.log('📋 Cancelling booking with confirmation number:', confirmationNumber);
      
      const result = await cancelHotelBooking(confirmationNumber);
      console.log('✅ Cancellation result:', result);
      
      setCancellationResult(result);
      
      if (result.Status.Code === "200" || result.Status.Code === "201") {
        setSuccessMessage(formatCancellationMessage(result));
      } else {
        setErrorMessage(`Cancellation failed: ${result.Status.Description}`);
      }
    } catch (error) {
      console.error('❌ Cancellation error:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to cancel booking. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Cancel Booking
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Hotel Information */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Hotel: <span className="font-medium">{hotelName}</span></p>
          {bookingReference && (
            <p className="text-sm text-gray-600">Booking Reference: <span className="font-medium">{bookingReference}</span></p>
          )}
        </div>

        {/* Confirmation Number Input */}
        <div className="space-y-2">
          <Label htmlFor="confirmation-number">Confirmation Number *</Label>
          <Input
            id="confirmation-number"
            type="text"
            placeholder="Enter your confirmation number"
            value={confirmationNumber}
            onChange={(e) => setConfirmationNumber(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Enter the confirmation number you received when booking
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 whitespace-pre-line">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Cancellation Details */}
        {cancellationResult && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Cancellation Details</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p><strong>Status:</strong> {cancellationResult.Status.Description}</p>
              {cancellationResult.ConfirmationNumber && (
                <p><strong>Confirmation Number:</strong> {cancellationResult.ConfirmationNumber}</p>
              )}
              {cancellationResult.CancellationFee !== undefined && (
                <p><strong>Cancellation Fee:</strong> {cancellationResult.Currency || 'USD'} {cancellationResult.CancellationFee}</p>
              )}
              {cancellationResult.RefundAmount !== undefined && (
                <p><strong>Refund Amount:</strong> {cancellationResult.Currency || 'USD'} {cancellationResult.RefundAmount}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            {successMessage ? 'Close' : 'Cancel'}
          </Button>
          
          {!successMessage && (
            <Button
              onClick={handleCancelBooking}
              disabled={isLoading || !confirmationNumber.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </Button>
          )}
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Warning:</strong> Cancelling your booking may incur fees. 
            Please check the cancellation policy before proceeding.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CancelModal;
