# Maintech App - Database Setup Guide

## ✅ Firestore Security Rules Deployed

Your Firestore security rules have been successfully deployed!

## 🔒 Security Rules Overview

### User Permissions:
- **All Authenticated Users Can:**
  - Read all properties, rooms, tasks, inventory, and approval requests
  - Create tasks (report issues)
  - Update room statuses
  - Update inventory levels
  - Create approval requests
  - Upload schematics
  - Update their own profile

- **Admins Can:**
  - Everything regular users can do, PLUS:
  - Create/update/delete properties
  - Create/delete rooms
  - Update/delete any task
  - Create/delete inventory items
  - Approve/reject approval requests
  - Delete any schematic
  - Update any user profile

## 🚀 Getting Started Fresh

### Step 1: Clear Existing Data (Optional)
If you want to start completely fresh:

```bash
./clear-database.sh
```

Or manually delete collections in Firebase Console:
https://console.firebase.google.com/project/maintech-v-1/firestore

### Step 2: Create Your First Admin Account

1. Go to your deployed app: https://maintech-v-1.web.app
2. Sign up with a new account
3. **Important**: Go to Firebase Console → Firestore → users collection
4. Find your user document and manually set the `role` field to `"Admin"`

### Step 3: Start Using the App

Once you're an admin, you can:
1. Create properties
2. Generate rooms for properties
3. Add inventory items
4. Invite other users (they sign up, you set their roles in Firestore)

## 📝 Setting User Roles

To make someone an admin or change roles:
1. Go to: https://console.firebase.google.com/project/maintech-v-1/firestore
2. Navigate to: `users` collection
3. Click on the user's document (their UID)
4. Edit the `role` field to one of:
   - `"Admin"` - Full access
   - `"Maintenance"` - Standard user
   - `"Other Staff"` - Standard user

## 🔐 Current Security Rules Features

- ✅ All users must be authenticated
- ✅ Role-based access control (Admin vs regular users)
- ✅ Users can only update their own profiles
- ✅ Task creators can update their own tasks
- ✅ Schematic uploaders can manage their own uploads
- ✅ Admins have full control over all data

## 📱 App URLs

- **Live App**: https://maintech-v-1.web.app
- **Firebase Console**: https://console.firebase.google.com/project/maintech-v-1
- **Firestore Database**: https://console.firebase.google.com/project/maintech-v-1/firestore
- **Authentication**: https://console.firebase.google.com/project/maintech-v-1/authentication

## 🛠️ Deployment Commands

Deploy everything:
```bash
npm run build
firebase deploy
```

Deploy only hosting:
```bash
npm run build
firebase deploy --only hosting
```

Deploy only rules:
```bash
firebase deploy --only firestore:rules
```

## ⚠️ Important Notes

1. **First User Must Be Manually Made Admin**: The first user to sign up won't have admin privileges automatically. You must manually set their role in Firestore.

2. **Mock Data**: The app will no longer show mock data once Firestore rules are working and you have real data.

3. **Authentication Required**: All users must create an account to use the app.

4. **Property Assignment**: Make sure to assign users to properties they should manage.

## 🆘 Troubleshooting

**If you see "Permission Denied" errors:**
- Make sure you're signed in
- Check that your user has the correct role in Firestore
- Verify the security rules are deployed: `firebase deploy --only firestore:rules`

**If mock data still appears:**
- Clear your browser cache
- Sign out and sign back in
- Check that Firestore rules are properly deployed

**To reset everything:**
- Run `./clear-database.sh` to clear all data
- Delete users from Firebase Authentication console
- Start fresh with new accounts
