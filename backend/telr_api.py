"""
Telr Payment Gateway API Proxy

This module proxies Telr API calls from the frontend to avoid CORS issues.
All Telr API calls should go through this backend proxy.
"""

from flask import Blueprint, request, jsonify
import requests
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create blueprint
telr_api_bp = Blueprint('telr_api', __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Telr API endpoint
TELR_API_URL = 'https://secure.telr.com/gateway/order.json'

# Get Telr credentials from environment variables
TELR_TEST_STORE_ID = os.getenv('TELR_TEST_STORE_ID', '')
TELR_TEST_AUTH_KEY = os.getenv('TELR_TEST_AUTH_KEY', '')
TELR_LIVE_STORE_ID = os.getenv('TELR_LIVE_STORE_ID', '')
TELR_LIVE_AUTH_KEY = os.getenv('TELR_LIVE_AUTH_KEY', '')
TELR_USE_TEST_MODE = os.getenv('TELR_USE_TEST_MODE', 'true').lower() == 'true'

# Log what we loaded (without exposing sensitive data)
logger.info(f"🔐 Telr credentials loaded:")
logger.info(f"  - Test Store ID: {'✅ ' + TELR_TEST_STORE_ID[:5] + '...' if TELR_TEST_STORE_ID else '❌ MISSING'}")
logger.info(f"  - Test Auth Key: {'✅ Present' if TELR_TEST_AUTH_KEY else '❌ MISSING'}")
logger.info(f"  - Use Test Mode: {TELR_USE_TEST_MODE}")


def get_telr_credentials():
    """Get Telr credentials based on current mode"""
    if TELR_USE_TEST_MODE:
        return {
            'store_id': TELR_TEST_STORE_ID,
            'auth_key': TELR_TEST_AUTH_KEY
        }
    else:
        return {
            'store_id': TELR_LIVE_STORE_ID,
            'auth_key': TELR_LIVE_AUTH_KEY
        }


@telr_api_bp.route('/api/telr/create-order', methods=['POST'])
def create_telr_order():
    """
    Create a Telr payment order
    
    Request body should contain:
    - cartId
    - amount
    - currency
    - description
    - customer (object with ref, email, forenames, surname, addressLine1, city, country, phone)
    - returnUrls (object with authorised, declined, cancelled)
    """
    try:
        data = request.get_json()
        
        logger.info(f"📥 Received create order request for cart: {data.get('cartId')}")
        
        # Get credentials
        creds = get_telr_credentials()
        
        if not creds['store_id'] or not creds['auth_key']:
            logger.error("❌ Telr credentials not configured in backend/.env file")
            logger.error(f"Store ID: {'✅' if creds['store_id'] else '❌ MISSING'}")
            logger.error(f"Auth Key: {'✅' if creds['auth_key'] else '❌ MISSING'}")
            return jsonify({
                'success': False,
                'error': 'Telr credentials not configured on server. Please create backend/.env file with TELR_TEST_STORE_ID and TELR_TEST_AUTH_KEY.'
            }), 500
        
        # Build Telr API request
        telr_payload = {
            'method': 'create',
            'store': creds['store_id'],
            'authkey': creds['auth_key'],
            'framed': 0,
            'language': 'en',
            'order': {
                'cartid': data.get('cartId'),
                'test': '1' if TELR_USE_TEST_MODE else '0',
                'amount': data.get('amount'),
                'currency': data.get('currency'),
                'description': data.get('description'),
                'trantype': 'sale'
            },
            'customer': {
                'ref': data.get('customer', {}).get('ref'),
                'email': data.get('customer', {}).get('email'),
                'name': {
                    'forenames': data.get('customer', {}).get('forenames'),
                    'surname': data.get('customer', {}).get('surname')
                },
                'address': {
                    'line1': data.get('customer', {}).get('addressLine1'),
                    'city': data.get('customer', {}).get('city'),
                    'country': data.get('customer', {}).get('country')
                },
                'phone': data.get('customer', {}).get('phone')
            },
            'return': {
                'authorised': data.get('returnUrls', {}).get('authorised'),
                'declined': data.get('returnUrls', {}).get('declined'),
                'cancelled': data.get('returnUrls', {}).get('cancelled')
            }
        }
        
        logger.info(f"📤 Sending request to Telr API (test mode: {TELR_USE_TEST_MODE})")
        logger.debug(f"Payload: {telr_payload}")
        
        # Make request to Telr
        response = requests.post(
            TELR_API_URL,
            json=telr_payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        response.raise_for_status()
        telr_response = response.json()
        
        logger.info(f"✅ Telr order created successfully")
        logger.info(f"Order ref: {telr_response.get('order', {}).get('ref')}")
        
        return jsonify({
            'success': True,
            'data': telr_response
        }), 200
        
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error calling Telr API: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to communicate with Telr: {str(e)}'
        }), 500
        
    except Exception as e:
        logger.error(f"💥 Error creating Telr order: {str(e)}")
        logger.exception(e)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@telr_api_bp.route('/api/telr/check-status', methods=['POST'])
def check_telr_status():
    """
    Check Telr order status
    
    Request body should contain:
    - orderRef: Telr order reference
    """
    try:
        data = request.get_json()
        order_ref = data.get('orderRef')
        
        if not order_ref:
            return jsonify({
                'success': False,
                'error': 'Order reference is required'
            }), 400
        
        logger.info(f"🔍 Checking status for order: {order_ref}")
        
        # Get credentials
        creds = get_telr_credentials()
        
        if not creds['store_id'] or not creds['auth_key']:
            logger.error("❌ Telr credentials not configured")
            return jsonify({
                'success': False,
                'error': 'Telr payment gateway is not configured on the server.'
            }), 500
        
        # Build Telr status check request
        telr_payload = {
            'method': 'check',
            'store': creds['store_id'],
            'authkey': creds['auth_key'],
            'order': {
                'ref': order_ref
            }
        }
        
        logger.info(f"📤 Sending status check request to Telr")
        
        # Make request to Telr
        response = requests.post(
            TELR_API_URL,
            json=telr_payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        response.raise_for_status()
        telr_response = response.json()
        
        status_code = telr_response.get('order', {}).get('status', {}).get('code')
        status_text = telr_response.get('order', {}).get('status', {}).get('text')
        
        logger.info(f"✅ Status retrieved: {status_text} ({status_code})")
        
        return jsonify({
            'success': True,
            'data': telr_response
        }), 200
        
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error calling Telr API: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to communicate with Telr: {str(e)}'
        }), 500
        
    except Exception as e:
        logger.error(f"💥 Error checking Telr status: {str(e)}")
        logger.exception(e)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# Export blueprint
__all__ = ['telr_api_bp']

