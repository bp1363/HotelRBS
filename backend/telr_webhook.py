"""
Telr Payment Gateway Webhook Handler

This handles asynchronous payment notifications from Telr.
Configure this endpoint in your Telr dashboard.

Endpoint: /api/telr/webhook
Method: POST
"""

from flask import Blueprint, request, jsonify
import logging
import json
from datetime import datetime

# Create blueprint for Telr webhooks
telr_webhook_bp = Blueprint('telr_webhook', __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@telr_webhook_bp.route('/api/telr/webhook', methods=['POST'])
def handle_telr_webhook():
    """
    Handle Telr payment webhook notifications
    
    Telr sends payment status updates to this endpoint.
    Process the notification and update order status accordingly.
    """
    try:
        # Get webhook payload
        payload = request.get_json()
        
        logger.info(f"📨 Received Telr webhook: {json.dumps(payload, indent=2)}")
        
        # Extract order information
        order_ref = payload.get('order', {}).get('ref')
        cart_id = payload.get('order', {}).get('cartid')
        status_code = payload.get('order', {}).get('status', {}).get('code')
        status_text = payload.get('order', {}).get('status', {}).get('text')
        transaction_ref = payload.get('order', {}).get('transaction', {}).get('ref')
        amount = payload.get('order', {}).get('amount')
        currency = payload.get('order', {}).get('currency')
        
        logger.info(f"📋 Order Ref: {order_ref}")
        logger.info(f"🛒 Cart ID: {cart_id}")
        logger.info(f"💳 Status: {status_text} ({status_code})")
        logger.info(f"💰 Amount: {currency} {amount}")
        logger.info(f"🔖 Transaction Ref: {transaction_ref}")
        
        # Process based on status code
        if status_code == 3:  # Authorised
            logger.info(f"✅ Payment successful for order {order_ref}")
            
            # TODO: Update your database
            # - Mark booking as paid
            # - Send confirmation email
            # - Trigger any post-payment workflows
            
            # Example:
            # update_booking_status(cart_id, 'paid', {
            #     'telr_order_ref': order_ref,
            #     'transaction_ref': transaction_ref,
            #     'amount': amount,
            #     'currency': currency,
            #     'payment_date': datetime.utcnow()
            # })
            
        elif status_code == 2:  # Declined
            logger.warning(f"❌ Payment declined for order {order_ref}")
            
            # TODO: Update your database
            # - Mark booking as payment failed
            # - Send failure notification
            
        elif status_code == -1:  # Cancelled
            logger.info(f"⚠️ Payment cancelled for order {order_ref}")
            
            # TODO: Update your database
            # - Mark booking as cancelled
            # - Release inventory if applicable
            
        else:
            logger.info(f"ℹ️ Other status ({status_code}) for order {order_ref}")
        
        # Log webhook for audit trail
        log_webhook_event({
            'timestamp': datetime.utcnow().isoformat(),
            'order_ref': order_ref,
            'cart_id': cart_id,
            'status_code': status_code,
            'status_text': status_text,
            'transaction_ref': transaction_ref,
            'amount': amount,
            'currency': currency,
            'payload': payload
        })
        
        # Acknowledge receipt
        return jsonify({
            'success': True,
            'message': 'Webhook processed successfully',
            'order_ref': order_ref
        }), 200
        
    except Exception as e:
        logger.error(f"💥 Error processing Telr webhook: {str(e)}")
        logger.exception(e)
        
        # Return 200 even on error to prevent Telr from retrying unnecessarily
        # Log the error for manual review
        return jsonify({
            'success': False,
            'message': 'Error processing webhook',
            'error': str(e)
        }), 200


def log_webhook_event(event_data):
    """
    Log webhook events for audit trail and debugging
    
    In production, store this in a database table for:
    - Audit trail
    - Debugging payment issues
    - Reconciliation
    """
    try:
        # TODO: Store in database
        # Example:
        # db.webhook_logs.insert_one(event_data)
        
        # For now, just log to file/console
        logger.info(f"📝 Webhook event logged: {event_data['order_ref']}")
        
    except Exception as e:
        logger.error(f"Failed to log webhook event: {str(e)}")


def update_booking_status(cart_id, status, payment_details):
    """
    Update booking status in your database
    
    Args:
        cart_id: The booking/cart ID
        status: New status ('paid', 'failed', 'cancelled')
        payment_details: Dict with payment information
    """
    try:
        # TODO: Implement database update
        # Example:
        # db.bookings.update_one(
        #     {'booking_reference_id': cart_id},
        #     {
        #         '$set': {
        #             'payment_status': status,
        #             'payment_details': payment_details,
        #             'updated_at': datetime.utcnow()
        #         }
        #     }
        # )
        
        logger.info(f"✅ Booking {cart_id} updated to status: {status}")
        
    except Exception as e:
        logger.error(f"Failed to update booking status: {str(e)}")
        raise


# Webhook security validation (optional but recommended)
def validate_webhook_signature(payload, signature, secret):
    """
    Validate webhook signature if Telr provides signing
    
    Check Telr documentation for signature validation method
    """
    # TODO: Implement signature validation
    # Example:
    # import hmac
    # import hashlib
    # 
    # expected_signature = hmac.new(
    #     secret.encode(),
    #     payload.encode(),
    #     hashlib.sha256
    # ).hexdigest()
    # 
    # return hmac.compare_digest(expected_signature, signature)
    
    pass


# Export blueprint
__all__ = ['telr_webhook_bp']

