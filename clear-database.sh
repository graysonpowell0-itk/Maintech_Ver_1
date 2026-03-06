#!/bin/bash

# Clear Firestore Database Script
# This will delete all data from your Firestore database

echo "⚠️  WARNING: This will delete ALL data from your Firestore database!"
echo "Project: maintech-v-1"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Clearing Firestore collections..."

# Delete all collections
firebase firestore:delete --all-collections --project maintech-v-1 --force

echo ""
echo "✅ Database cleared successfully!"
echo ""
echo "Next steps:"
echo "1. Your app will now start fresh"
echo "2. Users will need to create new accounts"
echo "3. All properties, rooms, tasks, and inventory will need to be added fresh"
