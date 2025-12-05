# Quick Start - Build APK

## Step 1: Navigate to project directory
```bash
cd /workspaces/kidtracker
```

## Step 2: Install dependencies
```bash
npm install
```

## Step 3: Commit the conversion
```bash
git add -A
git commit -m "React Native conversion complete - ready for native APK build"
git push origin main
```

## Step 4: Build APK for testing
```bash
eas build --platform android --profile preview
```

This will:
1. Upload your project to EAS Build
2. Generate a native Android APK
3. Provide a download link

## Step 5: Install on phone
- Download the APK from the link provided
- Transfer to your Android phone via USB or email
- Open file manager on phone and tap the APK to install
- Grant permissions and launch the app

---

## Alternative: Development Testing

If you want to test locally before building APK:

```bash
npx expo start
```

Then use the Expo Go app on your phone to scan the QR code.

---

## Build for Google Play Store

When ready to submit to Play Store:

```bash
eas build --platform android
```

This generates an AAB (Android App Bundle) instead of APK, which is required for Play Store submission.

---

## Troubleshooting

**Q: Build fails with "expo doctor" errors**
A: Run `npx expo install --check` to fix dependencies

**Q: Missing icon errors**
A: The current build skips custom icons. To add them later:
   1. Add PNG files to `assets/` folder
   2. Update `app.json` with icon references
   3. Rebuild

**Q: APK takes long to build**
A: First builds take 5-15 minutes. Subsequent builds are faster.

---

Ready? Run the 4 steps above! 🚀
