#!/bin/bash

# KidCare React Native Build Script
# This script prepares and builds the native Android app

set -e  # Exit on error

echo "🚀 KidCare - React Native Build"
echo "================================"

cd /workspaces/kidtracker

echo ""
echo "1️⃣  Installing dependencies..."
npm install

echo ""
echo "2️⃣  Running Expo doctor to check configuration..."
npx expo doctor

echo ""
echo "3️⃣  Committing final changes..."
git add -A
git commit -m "Final React Native conversion - ready for APK build

- All components converted to React Native
- Dependencies aligned with Expo SDK 54
- Configuration ready for native Android build
- Simplified app.json (no custom assets required)

Build options:
- Preview (APK for direct testing): eas build --platform android --profile preview
- Production (AAB for Play Store): eas build --platform android"

echo ""
echo "4️⃣  Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Configuration complete!"
echo ""
echo "Next step: Build the APK"
echo ""
echo "For testing on device (APK):"
echo "  eas build --platform android --profile preview"
echo ""
echo "For Google Play Store (AAB):"
echo "  eas build --platform android"
echo ""
echo "Or run locally with Expo Go:"
echo "  npx expo start"
echo ""
