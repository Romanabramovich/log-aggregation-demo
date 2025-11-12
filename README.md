# 🎭 Log Aggregation System - Interactive Demo

This is a **standalone demo page** that simulates the log aggregation system entirely in the browser. No backend required!

## 🌟 Features

- ✅ **Pure Frontend** - Runs entirely in JavaScript, no API calls
- ✅ **Identical UI** - Matches the production web interface exactly
- ✅ **Real-time Simulation** - Logs appear as if streaming from WebSocket
- ✅ **Search & Filter** - Full filtering by level, source, application, and text search
- ✅ **Log Forensics** - Stored logs (up to 1000) for filtering during and after simulation
- ✅ **Multiple Scenarios** - Different log spike situations to demonstrate
- ✅ **Live Statistics** - Real-time updates of ERROR, WARN, INFO, DEBUG counts
- ✅ **Auto-complete** - Each scenario runs and returns to normal automatically
- ✅ **Free Hosting** - Can be hosted on GitHub Pages, Netlify, or Vercel

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

### **Hosting on GitHub Pages (FREE):**

1. **Create a new repository** or use existing one:
   ```bash
   git add demo/
   git commit -m "Add interactive demo page"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: `main` branch, `/demo` folder
   - Click Save

3. **Access your demo:**
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO/
   ```

### **Alternative Hosting Options:**

| Platform | Price | Setup Time | Custom Domain |
|----------|-------|------------|---------------|
| GitHub Pages | FREE | 2 min | Yes (free) |
| Netlify | FREE | 3 min | Yes (free subdomain) |
| Vercel | FREE | 3 min | Yes (free subdomain) |
| Cloudflare Pages | FREE | 3 min | Yes (free subdomain) |

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

## 🔧 Adding New Scenarios

Edit `demo.js` and add to the `scenarios` object:

```javascript
scenarios.yourScenario = {
    name: "🔥 Your Scenario Name",
    description: "What happens in this scenario",
    duration: 20, // total seconds
    phases: [
        {
            name: "Phase 1",
            duration: 5000, // milliseconds
            logsPerSecond: 10,
            levelDistribution: { INFO: 50, WARN: 30, ERROR: 20 }
        },
        // ... more phases
    ],
    messages: {
        INFO: ["Success message 1", "Success message 2"],
        WARN: ["Warning message 1"],
        ERROR: ["Error message 1", "Error message 2"]
    },
    sources: ["service-1", "service-2"],
    applications: ["app-name"]
};
```

## 🎯 Use Cases

### **Portfolio:**
- Live demo on your resume/portfolio website
- No maintenance required (pure static files)
- Always available, never crashes

### **Job Interviews:**
- "Let me show you a live demo..."
- Walk through different scenarios in real-time
- Demonstrate system behavior under load

### **Project Documentation:**
- Embedded in GitHub README
- Interactive examples for users
- Visual demonstration of capabilities

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

## 🔗 Sharing Your Demo

**Direct Link:**
```
https://your-username.github.io/log-aggregation/
```

**QR Code:** (add to resume/portfolio)
- Use https://qr-code-generator.com/
- Link to your demo page

**Embedded:** (in portfolio website)
```html
<iframe src="https://your-demo-url.com" 
        width="100%" height="800px" 
        frameborder="0">
</iframe>
```

## 🎨 Customization

### **Change Colors:**
Edit CSS variables in `index.html`:
```css
:root {
    --error-color: #dc3545;
    --warn-color: #ffc107;
    --info-color: #02a942;
}
```

### **Adjust Max Logs:**
Edit in `demo.js`:
```javascript
const MAX_DISPLAYED_LOGS = 100; // Change this number
```

### **Change Animation Speed:**
Edit highlight animation in `index.html`:
```css
@keyframes highlight {
    0% { background-color: #ffffcc; }
    100% { background-color: white; }
}
```

## 🚧 Next Steps

- [ ] Add more scenarios (auth failure, database storm, etc.)
- [ ] Add visual charts/graphs
- [ ] Export logs to JSON
- [ ] Dark mode toggle
- [ ] Scenario favorites/bookmarks

## 📝 License

Same as main project (MIT)

