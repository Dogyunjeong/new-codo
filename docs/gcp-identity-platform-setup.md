# GCP Identity Platform Setup Guide

## Prerequisites
- GCP Account with billing enabled
- Firebase project created (or existing GCP project)
- Node.js 18+ installed
- Access to Firebase Console

## Step 1: Enable Identity Platform

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project or create a new one
3. Navigate to Authentication > Sign-in method
4. Enable the following providers:
   - Email/Password
   - Google
   - Apple (requires Apple Developer account)

## Step 2: Configure OAuth Providers

### Google Sign-In
1. In Firebase Console > Authentication > Sign-in method > Google
2. Click "Enable" and provide:
   - Public-facing name for your project
   - Project support email
3. Copy the Web Client ID for mobile client configuration

### Apple Sign-In
1. In Apple Developer Console:
   - Create an App ID with Sign In with Apple capability
   - Create a Service ID for web authentication
   - Create a Sign In with Apple key
2. In Firebase Console > Authentication > Sign-in method > Apple:
   - Upload the private key
   - Enter Team ID, Key ID, and Service ID

## Step 3: Generate Service Account Credentials

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Extract the following values for backend configuration:
   - `project_id` → FIREBASE_PROJECT_ID
   - `client_email` → FIREBASE_CLIENT_EMAIL  
   - `private_key` → FIREBASE_PRIVATE_KEY

## Step 4: Get Firebase Configuration for Mobile Client

1. Go to Firebase Console > Project Settings > General
2. Under "Your apps", add an iOS and/or Android app
3. Download configuration files:
   - iOS: `GoogleService-Info.plist`
   - Android: `google-services.json`
4. Extract configuration values for environment variables

## Step 5: Configure Backend Environment

Create `.env` file in `backend/ziririt-auth-service/`:
```env
# Copy values from service account JSON
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Set secure JWT secrets
JWT_SECRET=generate-32-char-random-string
JWT_REFRESH_SECRET=generate-another-32-char-random-string
```

## Step 6: Configure Mobile Client Environment

Create `.env` file in `frontend/mobile_client/`:
```env
# Copy from Firebase Console > Project Settings
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config values
```

## Step 7: Apply Database Migrations

```bash
# Run migration to add Firebase UID columns
docker exec -i ziririt-postgres psql -U ziririt_user -d ziririt_db < backend/ziririt-auth-service/src/db/migrations/003_add_firebase_uid.sql
```

## Step 8: Test Authentication Flow

1. Start backend services:
```bash
docker compose -f deploy/local/docker-compose.yml up -d
```

2. Start mobile client:
```bash
cd frontend/mobile_client
npx expo start
```

3. Test authentication methods:
   - Email/Password registration and login
   - Google Sign-In
   - Apple Sign-In (iOS only)

## Security Best Practices

1. **Never commit credentials**:
   - Add `.env` to `.gitignore`
   - Use environment variables or secret management services

2. **Rotate keys regularly**:
   - JWT secrets should be rotated monthly
   - Service account keys should be rotated quarterly

3. **Enable security rules**:
   - Configure Firebase Security Rules for Firestore/Storage if used
   - Enable App Check for additional security

4. **Monitor authentication**:
   - Set up alerts for suspicious activity
   - Review authentication logs regularly

## Troubleshooting

### "Service account object must contain a string 'private_key' property"
- Ensure FIREBASE_PRIVATE_KEY is properly formatted with escaped newlines

### "Token verification failed"
- Check that Firebase project ID matches between backend and mobile client
- Ensure service account has proper permissions

### "Google Sign-In not working"
- Verify SHA-1 fingerprint is added to Firebase Console (Android)
- Check bundle ID matches Firebase configuration (iOS)

### "Apple Sign-In not available"
- Ensure capability is enabled in Xcode project
- Verify Service ID matches Firebase configuration

## Monitoring

Enable monitoring in GCP Console:
1. Cloud Logging for authentication events
2. Cloud Monitoring for API latency
3. Error Reporting for authentication failures

## Next Steps

1. Configure custom claims for role-based access control
2. Implement multi-factor authentication
3. Set up account linking for multiple providers
4. Configure custom email templates