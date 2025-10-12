# VTU.ng API Integration Guide

## Overview
The WaoCard mobile app now includes integrated support for VTU.ng API to handle airtime purchases through your merchant account.

## Configuration

### 1. Set Merchant Credentials

Update the merchant credentials in `src/config/vtuConfig.js`:

```javascript
export const VTU_MERCHANT_CONFIG = {
  username: 'YOUR_ACTUAL_MERCHANT_USERNAME',
  password: 'YOUR_ACTUAL_MERCHANT_PASSWORD',
  // ... other config
};
```

**Security Note:** In production, these credentials should be stored in environment variables or a secure vault service, not hardcoded in the source code.

### 2. Authentication Flow

The app uses a centralized merchant account for all VTU.ng transactions:

1. **Automatic Authentication**: On app startup, the service automatically authenticates using the merchant credentials
2. **Token Management**: Authentication tokens are cached and automatically refreshed every 12 hours
3. **Retry Logic**: Failed requests due to expired tokens are automatically retried with a fresh token

## Features

### Dual API Support
- Primary: Uses your existing WaoCard API
- Fallback: Automatically switches to VTU.ng if the primary API fails
- Seamless experience for users regardless of which API is used

### Network Auto-Detection
The app automatically detects the network provider based on Nigerian phone number prefixes:
- MTN: 0803, 0806, 0703, 0706, 0813, 0816, 0810, 0814, 0903, 0906, 0913, 0916, 07025, 07026, 0704
- Airtel: 0802, 0808, 0708, 0812, 0701, 0902, 0901, 0904, 0907, 0912, 0911
- Glo: 0805, 0807, 0705, 0815, 0811, 0905, 0915
- 9mobile: 0809, 0818, 0817, 0909, 0908

### Transaction History
- Stores transactions locally for offline access
- Syncs with both WaoCard and VTU.ng APIs
- Maintains last 50 transactions in local storage

### Error Handling
Comprehensive error messages for:
- Insufficient balance
- Invalid phone numbers
- Network issues
- Service unavailability
- Duplicate transactions

## API Endpoints Used

The integration uses the following VTU.ng endpoints:
- `/auth/login` - Merchant authentication
- `/balance` - Check wallet balance
- `/airtime/purchase` - Purchase airtime
- `/validate/phone` - Validate phone numbers
- `/transaction/requery/{reference}` - Check transaction status
- `/transactions` - Get transaction history

## Testing

1. Update the merchant credentials in `vtuConfig.js`
2. Run the app: `npm start` or `expo start`
3. Navigate to the Airtime screen
4. Try purchasing airtime - it will use VTU.ng as fallback if main API fails

## Monitoring

Check the console logs for:
- "VTU.ng service initialized: Success" - Service ready
- "VTU.ng merchant authentication successful" - Login successful
- "VTU.ng API Request/Response" - API communication details

## Troubleshooting

### Authentication Issues
- Verify merchant credentials are correct
- Check that the merchant account is active
- Ensure the merchant wallet has sufficient balance

### Transaction Failures
- Check error messages for specific issues
- Verify phone number format (11 digits, starting with 0)
- Ensure amount is between ₦50 and ₦50,000

### Network Issues
- Check internet connectivity
- Verify VTU.ng API is accessible
- Check for any firewall or proxy issues

## Support

For VTU.ng API issues:
- Email: support@vtu.ng
- Documentation: https://vtu.ng/api/

For WaoCard integration issues:
- Contact your development team
- Check the error logs in the console