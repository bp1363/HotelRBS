# Telr Payment Gateway API - Quick Reference

## API Endpoint

```
https://secure.telr.com/gateway/order.json
```

---

## 1. Create Order API

### Request

**Method:** `POST`  
**Content-Type:** `application/json`

### Exact Request Structure

```json
{
  "method": "create",
  "store": "YOUR_STORE_ID",
  "authkey": "YOUR_AUTH_KEY",
  "framed": 0,
  "language": "en",
  "order": {
    "cartid": "UNIQUE_CART_ID",
    "test": "1",
    "amount": "123.45",
    "currency": "AED",
    "description": "Transaction Description",
    "trantype": "sale"
  },
  "customer": {
    "ref": "CUSTOMER_ID",
    "email": "customer@example.com",
    "name": {
      "forenames": "John",
      "surname": "Doe"
    },
    "address": {
      "line1": "123 Main Street",
      "city": "Dubai",
      "country": "AE"
    },
    "phone": "+971501234567"
  },
  "return": {
    "authorised": "https://yoursite.com/payment/success",
    "declined": "https://yoursite.com/payment/failure",
    "cancelled": "https://yoursite.com/payment/cancelled"
  }
}
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `method` | string | Yes | Must be `"create"` |
| `store` | string | Yes | Your Telr Store ID |
| `authkey` | string | Yes | Your Telr Authentication Key |
| `framed` | number | No | `0` = redirect (default), `2` = iframe |
| `language` | string | No | `"en"` (default), `"ar"` |
| **order.cartid** | string | Yes | Unique cart/booking ID |
| **order.test** | string | Yes | `"1"` = test mode, `"0"` = live mode |
| **order.amount** | string | Yes | Amount to charge (e.g., `"123.45"`) |
| **order.currency** | string | Yes | Currency code (`"AED"`, `"USD"`, etc.) |
| **order.description** | string | Yes | Transaction description |
| **order.trantype** | string | Yes | Usually `"sale"` |
| **customer.ref** | string | Yes | Customer reference/ID |
| **customer.email** | string | Yes | Customer email |
| **customer.name.forenames** | string | Yes | First name |
| **customer.name.surname** | string | Yes | Last name |
| **customer.address.line1** | string | Yes | Address line 1 |
| **customer.address.city** | string | Yes | City |
| **customer.address.country** | string | Yes | ISO country code |
| **customer.phone** | string | Yes | Phone number |
| **return.authorised** | string | Yes | Success redirect URL |
| **return.declined** | string | Yes | Failure redirect URL |
| **return.cancelled** | string | Yes | Cancel redirect URL |

### Response

```json
{
  "method": "create",
  "trace": "transaction_trace_id",
  "order": {
    "ref": "TELR_ORDER_REFERENCE",
    "url": "https://secure.telr.com/gateway/process.html?o=ORDER_ID",
    "cartid": "YOUR_CART_ID",
    "test": 1,
    "amount": "123.45",
    "currency": "AED",
    "description": "Transaction Description"
  }
}
```

### Usage

```typescript
// Redirect user to payment page
window.location.href = response.order.url;
```

---

## 2. Check Order Status API

### Request

**Method:** `POST`  
**Content-Type:** `application/json`

### Exact Request Structure

```json
{
  "method": "check",
  "store": "YOUR_STORE_ID",
  "authkey": "YOUR_AUTH_KEY",
  "order": {
    "ref": "TELR_ORDER_REFERENCE"
  }
}
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `method` | string | Yes | Must be `"check"` |
| `store` | string | Yes | Your Telr Store ID |
| `authkey` | string | Yes | Your Telr Authentication Key |
| **order.ref** | string | Yes | Telr order reference from create response |

### Response

```json
{
  "method": "check",
  "trace": "trace_id",
  "order": {
    "ref": "TELR_ORDER_REF",
    "cartid": "YOUR_CART_ID",
    "test": 1,
    "amount": "123.45",
    "currency": "AED",
    "description": "Transaction Description",
    "status": {
      "code": 3,
      "text": "Authorised"
    },
    "transaction": {
      "ref": "TRANSACTION_REF",
      "date": "2025-10-27T10:30:00Z",
      "type": "sale",
      "class": "ecom",
      "status": "A",
      "code": "000.000.000",
      "message": "Transaction successful"
    },
    "paymethod": "card",
    "card": {
      "last4": "1111",
      "type": {
        "name": "Visa",
        "code": "001"
      },
      "country": {
        "name": "United Arab Emirates",
        "code": "AE"
      },
      "expiry": {
        "month": "12",
        "year": "2025"
      }
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| **order.ref** | string | Telr order reference |
| **order.cartid** | string | Your cart/booking ID |
| **order.amount** | string | Transaction amount |
| **order.currency** | string | Currency code |
| **order.status.code** | number | Status code (see table below) |
| **order.status.text** | string | Status text |
| **transaction.ref** | string | Transaction reference |
| **transaction.status** | string | Transaction status code |
| **transaction.message** | string | Transaction message |
| **card.last4** | string | Last 4 digits of card |
| **card.type.name** | string | Card type (Visa, Mastercard, etc.) |

---

## 3. Status Codes

| Code | Status | Description | Action |
|------|--------|-------------|--------|
| -2 | Blocked | Payment blocked | Contact support |
| -1 | Cancelled | User cancelled payment | Allow retry |
| 0 | Not Paid | Payment not initiated | - |
| 1 | Pending | Payment processing | Wait/check again |
| 2 | Declined | Payment declined by bank | Show failure page |
| **3** | **Authorised** | **Payment successful** | ✅ Confirm booking |
| 4 | Void | Payment voided | - |
| 5 | Credited | Amount credited | - |
| 6 | Settled | Payment settled | - |
| 7 | Refunded | Payment refunded | - |

---

## 4. Webhook Payload

When payment status changes, Telr sends a webhook to your configured URL.

### Webhook Request

**Method:** `POST`  
**Content-Type:** `application/json`

### Payload Structure

```json
{
  "method": "check",
  "trace": "trace_id",
  "order": {
    "ref": "TELR_ORDER_REF",
    "cartid": "YOUR_CART_ID",
    "test": 1,
    "amount": "123.45",
    "currency": "AED",
    "description": "Transaction Description",
    "status": {
      "code": 3,
      "text": "Authorised"
    },
    "transaction": {
      "ref": "TRANSACTION_REF",
      "type": "sale",
      "status": "A"
    }
  }
}
```

### Webhook Response

Your endpoint should return:

```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

**HTTP Status:** `200 OK`

---

## 5. Test Cards

### Successful Payment

```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25 (any future date)
Name: Any name
```

### Declined Payment

```
Card Number: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25
Name: Any name
```

---

## 6. Error Codes

### HTTP Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (invalid credentials) |
| 500 | Server Error |

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid store ID | Wrong credentials | Check store ID |
| Invalid auth key | Wrong credentials | Check auth key |
| Invalid amount | Format error | Use string format: `"123.45"` |
| Invalid currency | Unsupported currency | Use supported currency code |
| Invalid cartid | Empty or duplicate | Use unique cart ID |

---

## 7. Supported Currencies

| Code | Currency |
|------|----------|
| AED | UAE Dirham |
| USD | US Dollar |
| EUR | Euro |
| GBP | British Pound |
| SAR | Saudi Riyal |

*Check Telr dashboard for complete list of supported currencies*

---

## 8. Code Examples

### TypeScript/JavaScript

```typescript
// Create Order
const createOrder = async () => {
  const response = await fetch('https://secure.telr.com/gateway/order.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'create',
      store: 'YOUR_STORE_ID',
      authkey: 'YOUR_AUTH_KEY',
      framed: 0,
      language: 'en',
      order: {
        cartid: 'CART123',
        test: '1',
        amount: '123.45',
        currency: 'AED',
        description: 'Test Payment',
        trantype: 'sale'
      },
      customer: {
        ref: 'CUST001',
        email: 'test@example.com',
        name: { forenames: 'John', surname: 'Doe' },
        address: { line1: '123 Main St', city: 'Dubai', country: 'AE' },
        phone: '+971501234567'
      },
      return: {
        authorised: 'https://yoursite.com/success',
        declined: 'https://yoursite.com/failure',
        cancelled: 'https://yoursite.com/cancelled'
      }
    })
  });
  
  const data = await response.json();
  window.location.href = data.order.url;
};

// Check Status
const checkStatus = async (orderRef: string) => {
  const response = await fetch('https://secure.telr.com/gateway/order.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'check',
      store: 'YOUR_STORE_ID',
      authkey: 'YOUR_AUTH_KEY',
      order: { ref: orderRef }
    })
  });
  
  const data = await response.json();
  return data.order.status.code === 3; // true if authorised
};
```

### Python

```python
import requests
import json

# Create Order
def create_order():
    url = 'https://secure.telr.com/gateway/order.json'
    payload = {
        'method': 'create',
        'store': 'YOUR_STORE_ID',
        'authkey': 'YOUR_AUTH_KEY',
        'framed': 0,
        'language': 'en',
        'order': {
            'cartid': 'CART123',
            'test': '1',
            'amount': '123.45',
            'currency': 'AED',
            'description': 'Test Payment',
            'trantype': 'sale'
        },
        'customer': {
            'ref': 'CUST001',
            'email': 'test@example.com',
            'name': {'forenames': 'John', 'surname': 'Doe'},
            'address': {'line1': '123 Main St', 'city': 'Dubai', 'country': 'AE'},
            'phone': '+971501234567'
        },
        'return': {
            'authorised': 'https://yoursite.com/success',
            'declined': 'https://yoursite.com/failure',
            'cancelled': 'https://yoursite.com/cancelled'
        }
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    return data['order']['url']

# Check Status
def check_status(order_ref):
    url = 'https://secure.telr.com/gateway/order.json'
    payload = {
        'method': 'check',
        'store': 'YOUR_STORE_ID',
        'authkey': 'YOUR_AUTH_KEY',
        'order': {'ref': order_ref}
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    return data['order']['status']['code'] == 3
```

---

## 9. Best Practices

1. **Always verify server-side**
   - Never trust return URL alone
   - Always call status check API

2. **Use unique cart IDs**
   - Each transaction must have unique cartid
   - Prevents duplicate charges

3. **Store order references**
   - Save Telr order ref for reconciliation
   - Link to your booking ID

4. **Handle all statuses**
   - Authorised → Confirm booking
   - Declined → Show error, allow retry
   - Cancelled → Allow retry
   - Pending → Check again later

5. **Implement webhooks**
   - Don't rely only on return URLs
   - Webhooks ensure you don't miss status changes

6. **Test thoroughly**
   - Test all payment scenarios
   - Use test cards in sandbox

7. **Log everything**
   - Log order creation
   - Log status checks
   - Log webhook events

---

## 10. Security Checklist

- [ ] Store credentials in environment variables
- [ ] Never expose credentials client-side
- [ ] Use HTTPS for all URLs
- [ ] Validate webhook signatures
- [ ] Implement rate limiting
- [ ] Check for duplicate orders
- [ ] Whitelist server IP (production)
- [ ] Log all transactions
- [ ] Monitor for fraud

---

*Quick Reference Guide - Telr Payment Gateway*  
*Last Updated: October 27, 2025*

