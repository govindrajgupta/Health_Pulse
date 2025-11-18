# 🎯 Smart Band Monitoring Control App

A comprehensive **Smart Band Monitoring Control App** that simulates a real wearable health and fitness device. This app monitors and displays vital parameters in real-time, providing users with data visualization, progress tracking, and personalized health insights.

## 📱 Features

### Real-Time Vital Signs Monitoring
- **Heart Rate (BPM)** - Continuous heart rate monitoring
- **Blood Oxygen (SpO2)** - Oxygen saturation levels
- **Body Temperature** - Core body temperature tracking
- **Stress Level** - Real-time stress assessment (0-100%)

### Activity & Fitness Tracking
- **Daily Steps** - Step counter with goal tracking (10,000 steps)
- **Calories Burned** - Energy expenditure calculation
- **Distance Traveled** - Automatic distance calculation from steps
- **Active Minutes** - Time spent in active motion

### Sleep Analysis
- **Deep Sleep** - Restorative sleep phase tracking
- **Light Sleep** - Light sleep phase monitoring
- **REM Sleep** - Rapid eye movement sleep tracking
- **Awake Time** - Nighttime disruptions
- **Sleep Quality Score** - Overall sleep quality rating (Poor/Fair/Good/Excellent)

### Device Management
- **Connection Status** - Bluetooth connectivity indicator
- **Battery Level** - Device battery percentage
- **Live Data Sync** - Real-time data updates every 2 seconds
- **Device ID** - Unique identifier for the smart band

### Analytics & Insights
- **Historical Charts** - 7-day, weekly, and monthly trends
- **Progress Tracking** - Goal achievement visualization
- **AI-Powered Insights** - Personalized health recommendations
- **Data Visualization** - Interactive charts and graphs

## 🚀 Getting Started

### Demo Login Credentials
```
Email: demo@health.app
Password: demo123
```

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Open your browser:**
```
http://localhost:5174
```

## 💡 How It Works

### Smart Band Simulation
Since you don't have physical hardware, this app includes a **Smart Band Simulator** that generates realistic sensor data:

1. **Real-Time Data Generation** - Simulates sensor readings every 2 seconds
2. **Realistic Variations** - Heart rate increases during active times, decreases at rest
3. **Time-Aware** - Data patterns change based on time of day
4. **Persistent Storage** - Data saved in browser localStorage
5. **Historical Archives** - Automatic daily data archiving

### Key Components

#### `smartBandSimulator.ts`
- Core simulation engine
- Generates realistic vital signs
- Manages data updates and persistence
- Handles historical data archiving

#### `useSmartBand.ts`
- React hook for accessing smart band data
- Real-time data subscription
- Control functions (start/stop/connect)

#### Dashboard
- Live vital signs display
- Activity metrics with progress bars
- Sleep analysis breakdown
- Historical trend charts
- AI-generated insights

## 📊 Data Simulation Details

### Heart Rate Simulation
- **Resting:** 60-85 BPM
- **Active:** 80-140 BPM
- **Time-Aware:** Higher during day (6 AM - 10 PM)

### Activity Simulation
- **Steps:** Incremental increase throughout the day
- **Calories:** Calculated based on activity level
- **Distance:** 0.8m per step average

### Sleep Analysis
- **Deep Sleep:** 60-120 minutes
- **Light Sleep:** 120-240 minutes
- **REM Sleep:** 60-90 minutes
- **Quality Calculation:** Based on sleep phase distribution

## 🎮 Control Panel

### Start/Pause Sync
Toggle real-time data updates

### Connect/Disconnect Device
Simulate device connection status

### Time Range Selection
- **Day** - Last 24 hours
- **Week** - Last 7 days
- **Month** - Last 30 days

## 📱 Monitored Parameters

| Parameter | Range | Unit | Update Frequency |
|-----------|-------|------|------------------|
| Heart Rate | 60-140 | BPM | 2 seconds |
| Blood Oxygen | 95-99 | % | 2 seconds |
| Temperature | 36.5-37.0 | °C | 2 seconds |
| Stress Level | 0-100 | % | 2 seconds |
| Steps | 0-15000 | count | Real-time |
| Calories | 0-3000 | kcal | Real-time |
| Battery | 0-100 | % | Gradual drain |

## 🔧 Customization

### Adjust Update Frequency
Edit `smartBandSimulator.ts`:
```typescript
startSimulation(updateInterval: number = 2000) // milliseconds
```

### Change Daily Goals
```typescript
smartBand.setDailyGoals(
  steps: 10000,      // daily step goal
  calories: 2000     // daily calorie goal
);
```

### Reset Daily Statistics
```typescript
smartBand.resetDailyStats(); // Call at midnight
```

## 📈 Data Storage

All data is stored locally in your browser:

| Storage Key | Purpose |
|-------------|---------|
| `smartband_current_data` | Current session data |
| `smartband_archives` | Historical data (last 30 days) |
| `health_app_users` | User accounts |
| `health_app_current_user` | Active session |

### Clear All Data
Open browser console and run:
```javascript
localStorage.clear();
location.reload();
```

## 🎨 UI Features

- **Real-Time Updates** - Live data with visual indicators
- **Animated Charts** - Smooth transitions with Chart.js
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Color-Coded Metrics** - Visual status indicators
- **Progress Bars** - Goal achievement visualization
- **Pulse Animation** - Live monitoring indicator

## 🔄 Real-Time Features

### Auto-Sync
- Data updates every 2 seconds automatically
- Visual "live" indicator with pulse animation
- Last updated timestamp

### Connection Status
- Bluetooth icon shows connection state
- Toggle between connected/disconnected
- Affects data simulation behavior

### Battery Simulation
- Gradual battery drain (1% per ~100 updates)
- Low battery warnings in insights
- Realistic power consumption modeling

## 📋 AI Health Insights

The app generates contextual insights based on:
- Daily step goal progress
- Heart rate zones
- Blood oxygen levels
- Stress level assessment
- Battery status
- Historical trends

Example insights:
- "🎯 Great job! You've reached your daily step goal!"
- "💚 Excellent resting heart rate! Your fitness level is great."
- "✨ Blood oxygen levels are optimal!"
- "😌 Your stress levels are well managed today!"

## 🛠️ Technical Stack

- **Frontend:** React + TypeScript
- **Charts:** Chart.js + react-chartjs-2
- **Icons:** Lucide React
- **Routing:** React Router
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **State:** React Hooks + LocalStorage

## 🔮 Future Enhancements

Potential features to add:
- [ ] Data export (CSV/JSON)
- [ ] Week/month comparison reports
- [ ] Heart rate zone analysis
- [ ] Workout mode simulation
- [ ] Medication reminders
- [ ] Hydration tracking
- [ ] Manual data entry
- [ ] Share progress to social media
- [ ] Dark mode
- [ ] Multi-language support

## 📝 Notes

- This is a **simulation** for demonstration purposes
- No actual hardware connection is required
- Data is stored locally and persists across sessions
- Each browser has independent data
- Perfect for prototyping, demos, and development

## 🎯 Use Cases

1. **App Development** - Test UI/UX without hardware
2. **Demonstrations** - Show features to stakeholders
3. **Prototyping** - Rapid iteration and testing
4. **Education** - Learn about health tracking apps
5. **Portfolio** - Showcase development skills

## ⚠️ Important

This app simulates smart band functionality and should NOT be used for:
- Actual medical monitoring
- Diagnosis or treatment decisions
- Emergency situations
- Professional health assessments

## 📞 Support

For questions or issues:
1. Check the browser console for errors
2. Clear localStorage if data seems corrupted
3. Refresh the page to reset simulation

---

**Enjoy your Smart Band Monitoring Control App! 🎉**
