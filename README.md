# Lumen 💎

Lumen is a premium, state-of-the-art personal finance manager built with **React Native** (using Expo-free bare workflow). It features a modern glassmorphism design system, secure multi-user data isolation, and smart AI-assisted budget coaching.

Lumen separates your finances into **Cash** and **UPI** wallets independently, allowing you to track exactly where your money goes.

---

## Key Features 🚀

- **Premium Glassmorphic UI**: Vibrant gradient background orbs, smooth transitions, and frosted-glass card containers (`@react-native-community/blur`).
- **Independent Wallet Tracking**: Split your balances and ledger views between physical Cash and UPI wallets.
- **Smart AI Budget Assistant**: Chat with your financial assistant powered by Google Gemini to analyze spending, filter transaction logs, and automatically register savings goals.
- **Goal Allocations & Spending Limits**: Set saving targets via the AI chat to automatically compute your safe weekly spending limits on the Dashboard.
- **Custom Categories & Limits**: Dynamically create new expense categories, color-code them, configure monthly caps, and track budget utilization in real-time.
- **Over-Limit Warnings**: Receive instant warnings if logging a payment will push you past your available wallet balance or monthly category budget.
- **Unified Firebase Settings**: Fully customizable data synchronization intervals (Real-time, Daily, Weekly, or Manual) with direct manual sync triggers and live status feedback.
- **Staggered Entrance Splash Screen**: Fluid and modern animations where wallet cards spin clockwise/anticlockwise into position and the Rupee symbol performs a physics-based spring bounce.

---

## Technical Stack 🛠️

- **Core**: React Native (v0.86.0), React (v19.2.3), TypeScript (v5.8.3)
- **Local Storage**: `react-native-mmkv` for high-performance offline caching
- **Database & Sync**: `@react-native-firebase/firestore` (Google Cloud)
- **Authentication**: `@react-native-firebase/auth` with Google Sign-In
- **AI Brain**: Google Gemini API via Generative Language SDK
- **Styling**: NativeWind (Tailwind CSS for React Native) & `react-native-linear-gradient`

---

## Firestore Database Security & Isolation 🔒

Lumen enforces strict privacy rules. User accounts and ledger records are fully isolated under:
`/users/{userId}` and `/users/{userId}/transactions/{transactionId}`

Ensure your Firestore Rules are set as follows to prevent unauthorized cross-user access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{allChildren=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## Getting Started ⚙️

### Prerequisites
- Node.js >= 22.11.0
- Java Development Kit (JDK) 17 (for Android)
- Android Studio & Android SDK (configured on system path)
- Xcode & CocoaPods (for iOS)

### Step 1: Clone and Install Dependencies
```bash
npm install
```

### Step 2: Environment Variables
Create a `.env` file at the root of the project to securely load the Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 3: Run Development Server
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## Creating a Release APK (Android) 📦

To build a standalone APK that can run independently on other devices (without a running Metro server):

1. **Generate a Signing Keystore**:
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```
2. **Move keystore file**: Move `my-release-key.keystore` inside `android/app/` folder.
3. **Configure Gradle properties**: Open `android/gradle.properties` and replace variables:
   ```properties
   MYAPP_UPLOAD_STORE_FILE=my-release-key.keystore
   MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
   MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
   MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
   ```
4. **Build APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   *The built APK will be saved at `android/app/build/outputs/apk/release/app-release.apk`.*
