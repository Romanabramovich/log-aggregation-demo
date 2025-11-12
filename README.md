# Logs & Found - Interactive Demo

This is a **standalone demo page** that simulates the log aggregation system entirely in the browser. No backend required!

## 📁 Files

```
demo/
├── index.html       # Main demo page (UI - matches production)
├── demo.js          # Simulation engine & scenario logic
├── OPEN_DEMO.bat    # Quick launcher for Windows
└── README.md        # This file
```

## 🚀 How to Use

### **Local Testing:**

**Option 1: Quick Launcher (Windows)**

```bash
cd demo
OPEN_DEMO.bat
```

This will start a local server and open the demo in your browser automatically!

**Option 2: Manual**

1. Start a local server:
   ```bash
   cd demo
   python -m http.server 8080
   ```
2. Open http://127.0.0.1:8080 in your browser

**Option 3: Direct Open**

- Right-click `index.html` → Open with → Chrome/Firefox/Edge

### **Using the Demo:**

1. Select a scenario from the control panel
2. Click "▶️ Start Simulation"
3. Watch logs stream in real-time with live statistics
4. **Use filters to investigate:**
   - Filter by log level (ERROR, WARN, INFO, DEBUG)
   - Filter by source or application
   - Search for specific text in messages
   - Click "Apply Filters" or press Enter
5. Scenario will auto-complete and return to normal
6. Filters work on stored logs (up to 1000) for forensics

## 🎬 Available Scenarios

Choose from **5 realistic incident scenarios** to demonstrate different system behaviors:

### **1. 🟢 Basic Example** (15s)

Simple demonstration: Normal → Error spike → Recovery

- **Best for:** Quick overview, first-time demos

### **2. 🗄️ Database Connection Storm** (25s)

Connection pool exhaustion cascading to all services

- **Intensity:** High (30 logs/sec peak)
- **Best for:** Database/infrastructure discussions

### **3. 🔐 Authentication Service Failure** (20s)

Auth service degradation leading to complete outage

- **Intensity:** Very High (25 logs/sec peak, 80% ERROR)
- **Best for:** Security discussions, OAuth/JWT topics

### **4. ⚡ API Rate Limit Exceeded** (18s)

Sudden traffic spike triggering rate limiters

- **Intensity:** Extreme (35 logs/sec peak!)
- **Best for:** API design, DDoS mitigation, rate limiting

### **5. 🔗 Microservices Cascade Failure** (30s - longest!)

Payment service failure rippling through entire system

- **Intensity:** Maximum (shows dependency chain failures)
- **Best for:** Microservices architecture, circuit breaker patterns

## 📊 Technical Details

### **Simulation Engine:**

- Uses `setTimeout` to simulate log generation
- Calculates logs/second based on phase configuration
- Tracks statistics in real-time
- Auto-cleans old logs (keeps last 100)

### **Browser Compatibility:**

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

### **Performance:**

- Handles up to 50 logs/second smoothly
- Minimal CPU usage
- No network requests after page load
