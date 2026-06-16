# Firebase Setup Guide for HabitFlow

This guide explains how to set up your Firebase project and configure the HabitFlow application.

---

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Enter a project name (e.g., `HabitFlow`) and click **Continue**.
4. Choose whether to enable Google Analytics for the project (optional) and click **Create project**.

---

## Step 2: Enable Authentication

HabitFlow supports Email/Password login and Google OAuth.

1. In the Firebase left sidebar, navigate to **Build** > **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Add new provider**:
   - **Email/Password**: Click it, toggle **Enable**, and click **Save**.
   - **Google**: Click it, toggle **Enable**, select a project support email, and click **Save**.
     - *Note: For Google Sign-in to work, make sure your redirect domains are authorized (Firebase handles this by default for localhost).*

---

## Step 3: Create Cloud Firestore Database

Firestore stores your habits and logs.

1. In the left sidebar, navigate to **Build** > **Firestore Database**.
2. Click **Create database**.
3. Select your database location (choose the region closest to you) and click **Next**.
4. Select **Start in production mode** (or **Start in test mode** for local development) and click **Create**.

---

## Step 4: Add security rules for Firestore

To secure your database so that users can only view and manage their own habits and logs:

1. Under the **Firestore Database** page, click the **Rules** tab.
2. Replace the rules with the following configuration:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Habits Rules
    match /habits/{habitId} {
      allow create: if request.auth != null && request.resource.data.user_id == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.user_id == request.auth.uid;
    }

    // Habit Logs Rules
    match /habit_logs/{logId} {
      allow create: if request.auth != null && request.resource.data.habit_id != null &&
        get(/databases/$(database)/documents/habits/$(request.resource.data.habit_id)).data.user_id == request.auth.uid;
      allow read, update, delete: if request.auth != null &&
        get(/databases/$(database)/documents/habits/$(resource.data.habit_id)).data.user_id == request.auth.uid;
    }
  }
}
```

3. Click **Publish** to deploy the rules.

---

## Step 5: Register your Web App & Get Config Keys

1. In the Firebase Console, click the **Project Overview** gear icon in the top left and select **Project settings**.
2. Under the **General** tab, scroll down to the **Your apps** section.
3. Click the **Web** icon (`</>`) to add a Web App.
4. Enter an App nickname (e.g., `HabitFlow Web`) and click **Register app**.
5. Firebase will display your config object. Copy the values:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

---

## Step 6: Configure Environment Variables

1. Open the `.env.local` file in the root of your project: [Link to .env.local](file:///e:/Shashank%20Dubey%20Workspace/Shashank%20Dubey%20Workspace/GitHub%20Personal%20Projects/habitflow/.env.local)
2. Replace the placeholders with your Firebase configuration values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

---

## Step 7: Run Locally

Run the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
