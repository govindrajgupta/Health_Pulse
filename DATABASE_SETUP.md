# Database Setup - Local Mock Backend

## Overview
This health tracker app now uses a **local mock backend** instead of Supabase. All data is stored in your browser's localStorage, so no external database or internet connection is required.

## ✅ What Changed

1. **Replaced Supabase** with a custom mock backend (`src/lib/mockBackend.ts`)
2. **Data Storage**: All user data and health information now stored in browser localStorage
3. **No External Dependencies**: Works completely offline
4. **Demo Account**: Pre-configured demo account for testing

## 🚀 Getting Started

### Demo Credentials
Use these credentials to login immediately:
- **Email**: `demo@health.app`
- **Password**: `demo123`

### Creating New Users
You can create new accounts through the registration page. All data will be stored locally in your browser.

## 📦 Features

### Current Features:
- ✅ User Authentication (Login/Register/Logout)
- ✅ Profile Management
- ✅ Dashboard with Health Metrics
- ✅ Mock Health Data Generation
- ✅ Persistent Sessions (survives page refresh)
- ✅ Multiple User Accounts

### Data Storage:
All data is stored in `localStorage` with these keys:
- `health_app_users` - User accounts
- `health_app_current_user` - Current session
- `health_app_data` - Health data (future use)

## 🛠️ Technical Details

### Mock Backend API
Located in `src/lib/mockBackend.ts`, provides:
- `signIn(email, password)` - User login
- `signUp(email, password, displayName)` - User registration
- `signOut()` - User logout
- `getSession()` - Get current session
- `updateUser(updates)` - Update user profile
- `onAuthStateChange(callback)` - Listen for auth changes

### Supabase Adapter
`src/lib/supabase.ts` now wraps the mock backend with a Supabase-like interface, so no changes were needed to existing components.

## 🔄 Migration from Supabase

The app previously used Supabase but is now completely self-contained. If you want to switch back to Supabase:

1. Install Supabase: `npm install @supabase/supabase-js`
2. Add credentials to `.env`:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Restore original `src/lib/supabase.ts` code

## 🧪 Testing

### Clear All Data
To reset the app and clear all stored data:
```javascript
localStorage.clear();
```
Then refresh the page.

### Inspect Data
Open browser DevTools > Application > Local Storage to view stored data.

## 📝 Notes

- Data persists only in the current browser
- Clearing browser data will delete all accounts and data
- Each browser/device has separate data
- No server-side validation or security (demo only)

## 🎯 Next Steps

To extend functionality:
1. Add more health data storage methods in `mockBackend.ts`
2. Implement data export/import features
3. Add data visualization for tracked metrics
4. Create backup/restore functionality

## ⚠️ Important

This is a **development/demo solution**. For production:
- Use a real database (Supabase, Firebase, etc.)
- Implement proper password hashing
- Add server-side validation
- Implement proper security measures
