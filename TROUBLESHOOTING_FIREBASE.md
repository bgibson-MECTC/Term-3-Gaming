# Firebase Leaderboard & Analytics Troubleshooting

## Issue: Leaderboard and Analytics Not Saving

The app has been fixed to properly connect to Firebase, but you may need to check your Firebase configuration.

## Step 1: Check Firebase Console Logs

1. Open your app: https://bgibson-mectc.github.io/Term-3-Gaming
2. Open browser console (F12 → Console tab)
3. Look for these messages:
   - `Firebase initialized: {db: true, auth: true}` ✅ Good
   - `Signing in anonymously` ✅ Good
   - `Auth state changed: User logged in` ✅ Good
   - `Error...` ❌ Problem

## Step 2: Verify Firebase Security Rules

Your Firestore needs proper security rules to allow writes. Go to:
**Firebase Console → Firestore Database → Rules**

### Required Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to artifacts collection
    match /artifacts/{appId}/public/data/scores/{scoreId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
    
    // Allow authenticated users to save analytics
    match /artifacts/{appId}/public/data/analytics/{analyticsId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Allow reading custom chapters
    match /customChapters/{chapterId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Click "Publish" after adding these rules**

## Step 3: Enable Anonymous Authentication

1. Go to **Firebase Console → Authentication**
2. Click **Sign-in method** tab
3. Click **Anonymous** 
4. Toggle **Enable**
5. Click **Save**

## Step 4: Test the Leaderboard

1. Go to your app
2. Play a chapter in **Ranked Mode**
3. On the summary screen, check the status indicator:
   - 🟢 Green = Ready to submit
   - 🟡 Yellow = Still connecting (wait a few seconds)
   - 🔴 Red = Not connected (see Step 5)
4. Enter your name
5. Click the save button
6. You should see: "Score submitted successfully! 🎉"

If you see an error, note the exact error message.

## Step 5: Common Error Messages

### "Authentication required"
**Cause:** Anonymous auth not enabled or failing
**Fix:**
1. Check Step 3 (Enable Anonymous Authentication)
2. Clear browser cache and cookies for your site
3. Try in incognito/private browsing mode

### "Missing or insufficient permissions"
**Cause:** Firestore security rules are too restrictive
**Fix:**
1. Check Step 2 (Verify Firebase Security Rules)
2. Make sure you clicked "Publish" after editing rules
3. Wait 1-2 minutes for rules to propagate

### "Network error" or "Failed to fetch"
**Cause:** Internet connection or Firebase project issue
**Fix:**
1. Check internet connection
2. Verify Firebase project is active (not over quota)
3. Check Firebase Console → Usage for any quota warnings

### "Collection not found" or "Document not found"
**Cause:** Collections don't exist yet (this is normal)
**Fix:** Nothing - Firestore creates collections automatically on first write

## Step 6: Verify Data is Saving

1. Go to **Firebase Console → Firestore Database**
2. Look for these collections:
   - `artifacts/rn-mastery-game/public/data/scores` - Leaderboard entries
   - `artifacts/rn-mastery-game/public/data/analytics` - Individual question attempts
3. If you see data appearing here, it's working! ✅

## Step 7: Check Browser Console for Errors

If still not working, check the browser console:

1. Open dev tools (F12)
2. Go to Console tab
3. Play a chapter and try to submit
4. Look for red error messages
5. Share those error messages for further help

## Step 8: Verify appId

The app uses appId `rn-mastery-game` by default. If you changed this, make sure it's consistent.

Check the console log:
```
Firebase initialized: {db: true, auth: true}
```

If you see `{db: false, auth: false}`, there's a connection problem.

## Quick Test Checklist

✅ Firebase project exists and is active  
✅ Anonymous authentication is enabled  
✅ Firestore security rules allow writes  
✅ Browser console shows "Firebase initialized: {db: true, auth: true}"  
✅ Browser console shows "Auth state changed: User logged in"  
✅ Status indicator shows green on summary screen  
✅ No error messages in console  

If all of the above are checked, the leaderboard should work!

## Still Not Working?

If you've completed all steps and it's still not working:

1. Take a screenshot of your Firebase Console → Firestore Database → Rules
2. Take a screenshot of your Firebase Console → Authentication → Sign-in method
3. Take a screenshot of browser console errors (F12 → Console)
4. Share these for further troubleshooting

## Working? Great!

Once working, you can:
- View leaderboard submissions in Firebase Console → Firestore → `artifacts/rn-mastery-game/public/data/scores`
- View student analytics in Firebase Console → Firestore → `artifacts/rn-mastery-game/public/data/analytics`
- Export data for analysis
- Set up Firebase functions for automated reports
