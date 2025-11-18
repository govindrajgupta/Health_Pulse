# 🎯 Smart Watch Setup Guide

## New Setup Flow (Updated)

Your app now requires **proper device connection** before showing any data. No more automatic simulation!

---

## How It Works Now

### 1. **Launch App** → Shows Setup Screen
- Open `http://localhost:5174`
- Login with: `demo@health.app` / `demo123`
- You'll see: **"Connect Your Smart Watch"** screen
- **NO data is shown yet** ✅

### 2. **Two Connection Options**

#### Option A: Connect Real Watch (Recommended for Firebolt Cobalt)
```
Click "Connect Real Watch" button
    ↓
Bluetooth pairing dialog appears
    ↓
Select your Firebolt Cobalt from list
    ↓
Click "Pair"
    ↓
Dashboard shows REAL data from your watch! 🎉
```

#### Option B: Use Demo Mode (For testing without hardware)
```
Click "Use Demo Mode" button
    ↓
Simulated data starts immediately
    ↓
Dashboard shows realistic simulated data
```

---

## Connecting Your Firebolt Cobalt Watch

### Prerequisites
1. **Charge your watch** (at least 20% battery)
2. **Enable Bluetooth** on your watch
3. **Disconnect from phone app** (important!)
4. **Keep watch nearby** (within 1-2 meters)

### Step-by-Step Connection

1. **Open the App**
   - Browser: Chrome, Edge, or Opera (required for Web Bluetooth)
   - URL: `http://localhost:5174`
   - Login with demo account

2. **On Setup Screen**
   - You'll see a large Bluetooth icon
   - Title: "Connect Your Smart Watch"
   - Two buttons below

3. **Click "Connect Real Watch"**
   - Bluetooth pairing dialog opens
   - Shows list of nearby devices

4. **Select Your Watch**
   - Look for:
     - "Firebolt Cobalt"
     - "FireBoltt 182" (your model, as shown in image)
     - "Firebolt" + any name
   - Click on your device name

5. **Pair the Device**
   - Click "Pair" button
   - Watch may vibrate or show pairing notification
   - Wait 2-3 seconds for connection

6. **Success!**
   - Green checkmark appears: "Connected Successfully"
   - Status changes to: "🔵 Real Device"
   - Dashboard loads with YOUR actual data

---

## What Data You'll See

### From Your Firebolt Cobalt (Real Data)
- ❤️ **Heart Rate** - Your actual BPM in real-time
- 🔋 **Battery Level** - Watch battery percentage
- 👣 **Steps** (if supported by your model)

### Simulated Data (Still Used For)
- 🫁 Blood Oxygen (SpO2) - Most Firebolt models don't expose this via Bluetooth
- 🌡️ Temperature - Not typically available via Bluetooth
- 😰 Stress Level - Calculated/simulated
- 🌙 Sleep Data - Uses historical/simulated patterns

**Why mixed?** Web Bluetooth has limitations. Not all sensor data is accessible via standard Bluetooth services. Your heart rate and battery are real, other metrics are enhanced with simulation.

---

## Understanding Connection Status

### Setup Screen (No Connection)
```
┌─────────────────────────────────────┐
│   🔵 Connect Your Smart Watch       │
│                                     │
│   [Connect Real Watch]              │
│   [Use Demo Mode]                   │
└─────────────────────────────────────┘
```

### Dashboard - Real Device Connected
```
Status Badge: 🔵 Real Device (blue)
Data Source: Receiving from Firebolt Cobalt
Updates: Real-time as watch sends data
```

### Dashboard - Demo Mode
```
Status Badge: 🟢 Simulated (green)
Data Source: Generated simulation
Updates: Every 2 seconds
```

### Dashboard - Paused
```
Status Badge: 🟡 Paused (yellow)
Data Source: None
Updates: Stopped
```

---

## Troubleshooting Connection

### ❌ "No Bluetooth Device Found"
**Problem:** Pairing dialog shows no devices

**Solutions:**
1. Enable Bluetooth on your watch
2. Disconnect watch from phone app
3. Bring watch closer to laptop
4. Restart watch Bluetooth:
   - Settings → Bluetooth → Toggle Off/On
5. Refresh browser page and try again

### ❌ "Connection Failed"
**Problem:** Selected device but connection failed

**Solutions:**
1. **Forget previous pairing:**
   - Windows: Settings → Bluetooth → Remove "FireBoltt 182"
   - Then try connecting again
2. **Restart watch Bluetooth**
3. **Close other Bluetooth apps** (phone apps, other browsers)
4. **Check watch is not in DND mode**

### ❌ "Connected But No Data"
**Problem:** Status shows connected but no heart rate

**Solutions:**
1. **Check heart rate on watch screen** - Make sure watch is tracking
2. **Wear watch properly** - Sensor needs skin contact
3. **Wait 10-15 seconds** - Initial sync takes time
4. **Check browser console** (F12) for errors
5. **Disconnect and reconnect**

### ❌ "Device Not in List"
**Problem:** Can't find "Firebolt" in pairing dialog

**Solutions:**
1. **Check watch name:**
   - Settings → About → Device Name
   - Might be "FireBoltt 182" or similar
2. **Look for ANY device** in list:
   - Try connecting to see if it's your watch
3. **Reset watch Bluetooth:**
   - Settings → Bluetooth → Reset
4. **Update watch firmware** (via phone app)

---

## Best Practices

### ✅ DO
- ✅ Keep watch charged (>20%)
- ✅ Disconnect from phone before connecting to web app
- ✅ Use Chrome, Edge, or Opera browsers
- ✅ Keep watch within 1-2 meters
- ✅ Wear watch properly for accurate readings
- ✅ Check console (F12) for connection logs

### ❌ DON'T
- ❌ Don't connect watch to phone AND laptop simultaneously
- ❌ Don't use Safari or Firefox (no Web Bluetooth support)
- ❌ Don't move watch too far away during use
- ❌ Don't expect all data via Bluetooth (some is simulated)
- ❌ Don't close browser tab (connection will drop)

---

## Data Flow Diagram

```
[Firebolt Cobalt Watch]
         ↓
   [Bluetooth LE]
         ↓
[Web Bluetooth API]
         ↓
[bluetoothManager.ts]
    - Heart Rate Service (0x180D)
    - Battery Service (0x180F)
         ↓
[hybridSmartBand.ts]
    - Merges real + simulated data
         ↓
[Dashboard.tsx]
    - Displays real-time UI
```

---

## Comparison: Real vs Demo Mode

| Feature | Real Watch | Demo Mode |
|---------|-----------|-----------|
| Heart Rate | ✅ Actual BPM | 🔄 Simulated 60-140 |
| Battery | ✅ Real % | 🔄 Slowly drains |
| Steps | ⚠️ If supported | 🔄 Increases gradually |
| SpO2 | ❌ Not available | 🔄 Simulated 95-99% |
| Temperature | ❌ Not available | 🔄 ~36.5-37°C |
| Stress | ❌ Not available | 🔄 Dynamic 0-100% |
| Sleep | ❌ Not available | 🔄 Detailed breakdown |
| Connection | 🔵 Real device | 🟢 Simulated |

---

## Testing Your Setup

### Test 1: Real Heart Rate
1. Connect your watch
2. Check heart rate on dashboard
3. Do 10 jumping jacks
4. Watch heart rate increase on dashboard
5. **If it increases** → Real data working! ✅

### Test 2: Battery Sync
1. Note battery % on watch screen
2. Check battery % on dashboard
3. **If they match** → Real data working! ✅

### Test 3: Connection Stability
1. Keep app open for 5 minutes
2. Check if status stays "🔵 Real Device"
3. Verify data continues updating
4. **If stable** → Connection solid! ✅

---

## Advanced: Browser Console Logs

Open Console (F12) to see connection details:

```javascript
// Successful connection
> Connected to: FireBoltt 182
> Received Bluetooth data: { heartRate: 72, battery: 85, timestamp: ... }

// Data updates
> Received Bluetooth data: { heartRate: 74, battery: 85, timestamp: ... }
> Received Bluetooth data: { heartRate: 76, battery: 85, timestamp: ... }

// Connection lost
> Bluetooth device disconnected
```

---

## Quick Reference Card

```
┌──────────────────────────────────────────────────┐
│  FIREBOLT COBALT CONNECTION QUICK GUIDE          │
├──────────────────────────────────────────────────┤
│  1. Charge watch (>20%)                          │
│  2. Enable Bluetooth on watch                    │
│  3. Disconnect from phone app                    │
│  4. Open app: http://localhost:5174              │
│  5. Login: demo@health.app / demo123             │
│  6. Click "Connect Real Watch"                   │
│  7. Select "FireBoltt 182" from list             │
│  8. Click "Pair"                                 │
│  9. Wait for green checkmark                     │
│  10. See YOUR heart rate on dashboard! 🎉        │
└──────────────────────────────────────────────────┘
```

---

## Need Help?

### Check These Files:
- `BLUETOOTH_GUIDE.md` - General Bluetooth info
- `FIREBOLT_GUIDE.md` - Firebolt-specific details
- `BLUETOOTH_FIX.md` - Recent bug fix details
- `SMART_BAND_README.md` - Full documentation

### Debug Mode:
1. Open browser Console (F12)
2. Go to Console tab
3. Look for errors or connection logs
4. Screenshot and report any errors

---

## Summary

✅ **Setup screen appears first** (no auto-simulation)  
✅ **Must connect device** to see data  
✅ **Real watch data** prioritized over simulation  
✅ **Demo mode available** for testing  
✅ **Clear status indicators** (Real Device vs Simulated)  
✅ **Proper connection flow** with pairing dialog  

**Your Firebolt Cobalt is now ready to connect! 🚀⌚**
