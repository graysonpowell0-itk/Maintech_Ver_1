#!/bin/bash

# Property Migration Script
# This migrates properties from user-specific collections to the global properties collection

echo "🔄 Property Migration Script"
echo "============================"
echo ""
echo "This script will help you migrate existing properties to the global collection."
echo ""
echo "Steps to migrate manually:"
echo "1. Go to Firebase Console: https://console.firebase.google.com/project/maintech-v-1/firestore"
echo "2. Navigate to: users > [your-user-id] > properties"
echo "3. For each property document:"
echo "   - Copy the document ID"
echo "   - Copy all the document data"
echo "   - Go back to root collections"
echo "   - Create/click 'properties' collection (at root level)"
echo "   - Add document with same ID and data"
echo "4. After migration, you can delete the old user-specific properties"
echo ""
echo "Alternatively, run this Firebase CLI command:"
echo ""
echo "firebase firestore:export ./backup --project maintech-v-1"
echo ""
echo "Then manually move the data in Firestore Console."
echo ""
echo "✅ After migration, all users will see the same properties!"
