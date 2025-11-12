/**
 * Log Aggregation Demo - Simulation Framework
 * Generates realistic log scenarios without a backend
 */

// ============================================================================
// CONFIGURATION & STATE
// ============================================================================

let currentScenario = null;
let isRunning = false;
let simulationInterval = null;
let currentPhaseIndex = 0;
let phaseStartTime = 0;
let totalLogs = 0;
let logCounts = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0 };
let logsPerSecond = 0;
let logsInLastSecond = 0;
let lastSecondTimestamp = Date.now();

const MAX_DISPLAYED_LOGS = 100; // Keep only last 100 logs in view
const MAX_STORED_LOGS = 1000; // Store up to 1000 logs for filtering

// Store all logs for filtering
let allLogs = [];

// Current filter state
let activeFilters = {
    level: '',
    source: '',
    application: '',
    search: ''
};

// ============================================================================
// SCENARIO DEFINITIONS
// ============================================================================

const scenarios = {
    basic: {
        name: "🟢 Basic Example",
        description: "Simple demonstration: Normal logs → Error spike → Recovery",
        duration: 15, // seconds
        phases: [
            {
                name: "Normal Operations",
                duration: 5000,
                logsPerSecond: 5,
                levelDistribution: { INFO: 70, WARN: 30, ERROR: 0 }
            },
            {
                name: "⚠️ Error Spike",
                duration: 5000,
                logsPerSecond: 20,
                levelDistribution: { INFO: 10, WARN: 20, ERROR: 70 }
            },
            {
                name: "Recovery",
                duration: 5000,
                logsPerSecond: 5,
                levelDistribution: { INFO: 70, WARN: 30, ERROR: 0 }
            }
        ],
        messages: {
            INFO: [
                "Request processed successfully",
                "User session created",
                "Cache hit for user_profile",
                "Health check passed",
                "API response time: 45ms"
            ],
            WARN: [
                "Slow query detected (250ms)",
                "Cache miss for user_data",
                "High memory usage: 75%",
                "Connection pool at 80% capacity"
            ],
            ERROR: [
                "Database connection timeout",
                "Failed to authenticate user",
                "Service unavailable: 503",
                "Connection refused by upstream",
                "Query execution failed"
            ]
        },
        sources: ["web-server-1", "api-gateway", "auth-service"],
        applications: ["nginx", "fastapi", "postgresql"]
    },
    
    databaseStorm: {
        name: "🗄️ Database Connection Storm",
        description: "Connection pool exhausted → Cascade to all services → Recovery",
        duration: 25,
        phases: [
            {
                name: "Normal Traffic",
                duration: 5000,
                logsPerSecond: 5,
                levelDistribution: { INFO: 80, WARN: 20, ERROR: 0 }
            },
            {
                name: "⚠️ Connection Pool Warning",
                duration: 5000,
                logsPerSecond: 10,
                levelDistribution: { INFO: 40, WARN: 50, ERROR: 10 }
            },
            {
                name: "🔥 Pool Exhausted",
                duration: 8000,
                logsPerSecond: 30,
                levelDistribution: { INFO: 5, WARN: 20, ERROR: 75 }
            },
            {
                name: "Recovery",
                duration: 7000,
                logsPerSecond: 8,
                levelDistribution: { INFO: 60, WARN: 30, ERROR: 10 }
            }
        ],
        messages: {
            INFO: [
                "Database query executed successfully",
                "Connection returned to pool",
                "Transaction committed",
                "Health check passed",
                "Query completed in 45ms"
            ],
            WARN: [
                "Connection pool at 85% capacity",
                "Slow query detected (500ms)",
                "High connection wait time",
                "Connection acquisition delayed",
                "Database response time degraded"
            ],
            ERROR: [
                "Database connection timeout after 30s",
                "Connection pool exhausted",
                "Failed to acquire database connection",
                "All connections in use",
                "Connection refused by database",
                "Transaction rollback due to timeout",
                "Unable to connect to postgresql",
                "Max connections reached"
            ]
        },
        sources: ["api-gateway", "web-server-1", "web-server-2", "worker-service"],
        applications: ["postgresql", "pgbouncer", "fastapi", "celery"]
    },
    
    authFailure: {
        name: "🔐 Authentication Service Failure",
        description: "Auth service degradation → Token validation fails → Complete outage",
        duration: 20,
        phases: [
            {
                name: "Normal Authentication",
                duration: 4000,
                logsPerSecond: 6,
                levelDistribution: { INFO: 85, WARN: 15, ERROR: 0 }
            },
            {
                name: "⚠️ Auth Service Degraded",
                duration: 4000,
                logsPerSecond: 12,
                levelDistribution: { INFO: 30, WARN: 40, ERROR: 30 }
            },
            {
                name: "🔥 Complete Auth Failure",
                duration: 6000,
                logsPerSecond: 25,
                levelDistribution: { INFO: 5, WARN: 15, ERROR: 80 }
            },
            {
                name: "Recovery",
                duration: 6000,
                logsPerSecond: 8,
                levelDistribution: { INFO: 70, WARN: 25, ERROR: 5 }
            }
        ],
        messages: {
            INFO: [
                "User authenticated successfully",
                "JWT token validated",
                "Login successful from IP 192.168.1.100",
                "Session created for user",
                "OAuth callback processed"
            ],
            WARN: [
                "Authentication service response time: 2500ms",
                "Token refresh took longer than expected",
                "Auth service health check degraded",
                "Redis cache unavailable, using database",
                "JWT signature verification slow"
            ],
            ERROR: [
                "Authentication service timeout",
                "Failed to validate JWT token",
                "Auth service unreachable",
                "User database connection lost",
                "Token validation failed: signature invalid",
                "Session store unavailable",
                "Login attempt failed: service unavailable",
                "OAuth provider timeout",
                "Cannot connect to auth-service"
            ]
        },
        sources: ["auth-service", "api-gateway", "user-service", "web-server-1"],
        applications: ["oauth2", "jwt-validator", "redis", "fastapi"]
    },
    
    rateLimitSpike: {
        name: "⚡ API Rate Limit Exceeded",
        description: "Sudden traffic spike → Rate limits triggered → Throttling enabled",
        duration: 18,
        phases: [
            {
                name: "Normal Traffic",
                duration: 4000,
                logsPerSecond: 6,
                levelDistribution: { INFO: 90, WARN: 10, ERROR: 0 }
            },
            {
                name: "🔥 Traffic Surge",
                duration: 6000,
                logsPerSecond: 35,
                levelDistribution: { INFO: 20, WARN: 30, ERROR: 50 }
            },
            {
                name: "⚠️ Throttling Active",
                duration: 5000,
                logsPerSecond: 15,
                levelDistribution: { INFO: 40, WARN: 50, ERROR: 10 }
            },
            {
                name: "Recovery",
                duration: 3000,
                logsPerSecond: 6,
                levelDistribution: { INFO: 85, WARN: 15, ERROR: 0 }
            }
        ],
        messages: {
            INFO: [
                "Request processed successfully",
                "API endpoint /api/v1/users accessed",
                "Response time: 35ms",
                "Cache hit for API response",
                "Request authenticated"
            ],
            WARN: [
                "Rate limit approaching (900/1000 req/min)",
                "Client approaching rate limit",
                "Throttling warning issued to client",
                "Unusual traffic pattern detected",
                "Request queued due to high load"
            ],
            ERROR: [
                "Rate limit exceeded: 429 Too Many Requests",
                "Client blocked for 60 seconds",
                "Request rejected: rate limit",
                "Too many requests from IP 203.0.113.45",
                "API quota exceeded",
                "Burst limit hit: 100 req/sec",
                "Request dropped: rate limiting",
                "Client blacklisted temporarily"
            ]
        },
        sources: ["api-gateway", "rate-limiter", "web-server-1", "web-server-2"],
        applications: ["nginx", "fastapi", "redis", "kong"]
    },
    
    cascadeFailure: {
        name: "🔗 Microservices Cascade Failure",
        description: "Payment service fails → Ripples through order, inventory, notification services",
        duration: 30,
        phases: [
            {
                name: "All Services Healthy",
                duration: 5000,
                logsPerSecond: 7,
                levelDistribution: { INFO: 85, WARN: 15, ERROR: 0 }
            },
            {
                name: "⚠️ Payment Service Issues",
                duration: 5000,
                logsPerSecond: 12,
                levelDistribution: { INFO: 50, WARN: 30, ERROR: 20 }
            },
            {
                name: "🔥 Order Service Affected",
                duration: 6000,
                logsPerSecond: 20,
                levelDistribution: { INFO: 25, WARN: 30, ERROR: 45 }
            },
            {
                name: "🔥 Full Cascade",
                duration: 8000,
                logsPerSecond: 30,
                levelDistribution: { INFO: 10, WARN: 20, ERROR: 70 }
            },
            {
                name: "Gradual Recovery",
                duration: 6000,
                logsPerSecond: 10,
                levelDistribution: { INFO: 60, WARN: 30, ERROR: 10 }
            }
        ],
        messages: {
            INFO: [
                "Order processed successfully",
                "Payment confirmed",
                "Inventory updated",
                "Notification sent to user",
                "Service mesh health check passed",
                "Circuit breaker closed"
            ],
            WARN: [
                "Payment service response time degraded",
                "Retry attempt 1/3",
                "Circuit breaker half-open",
                "Service dependency latency high",
                "Fallback mechanism activated",
                "Queue backing up"
            ],
            ERROR: [
                "Payment service timeout",
                "Failed to process payment",
                "Order service cannot reach payment-service",
                "Inventory service timeout",
                "Notification service failed",
                "Circuit breaker open",
                "Downstream service unavailable",
                "Service mesh route failed",
                "Timeout calling payment-service",
                "All retry attempts exhausted",
                "Unable to complete order: payment failed",
                "Service dependency failure cascade"
            ]
        },
        sources: ["payment-service", "order-service", "inventory-service", "notification-service", "api-gateway"],
        applications: ["fastapi", "rabbitmq", "postgresql", "redis", "service-mesh"]
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getLogLevel(distribution) {
    const rand = Math.random() * 100;
    let cumulative = 0;
    
    for (const [level, percentage] of Object.entries(distribution)) {
        cumulative += percentage;
        if (rand <= cumulative) {
            return level;
        }
    }
    
    return 'INFO'; // fallback
}

function formatTimestamp(date) {
    // Format: YYYY-MM-DD HH:MM:SS (matching existing UI)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// ============================================================================
// LOG GENERATION
// ============================================================================

function generateLog(scenario, level) {
    const messages = scenario.messages[level];
    const message = getRandomElement(messages);
    const source = getRandomElement(scenario.sources);
    const application = getRandomElement(scenario.applications);
    
    return {
        id: Date.now() + Math.random(), // Unique ID
        timestamp: new Date(),
        level: level,
        source: source,
        application: application,
        message: message
    };
}

function addLogToTable(log) {
    // Store log in memory for filtering
    allLogs.unshift(log); // Add to beginning
    if (allLogs.length > MAX_STORED_LOGS) {
        allLogs.pop(); // Remove oldest
    }
    
    // Update statistics
    totalLogs++;
    if (logCounts[log.level] !== undefined) {
        logCounts[log.level]++;
    }
    logsInLastSecond++;
    updateStatistics();
    
    // Check if log passes current filters
    if (!passesFilters(log)) {
        return; // Don't display if filtered out
    }
    
    // Display the log
    displayLogRow(log);
    
    // Update filter dropdowns
    updateFilterDropdowns();
}

function displayLogRow(log) {
    const tbody = document.getElementById('logsTableBody');
    
    // Remove placeholder if exists
    const placeholder = tbody.querySelector('td[colspan="5"]');
    if (placeholder) {
        tbody.innerHTML = '';
    }
    
    // Format timestamp to match existing UI
    const timestamp = formatTimestamp(log.timestamp);
    
    // Create new row (matching existing UI structure)
    const row = document.createElement('tr');
    row.className = 'log-row log-row-new';
    row.innerHTML = `
        <td class="timestamp">${timestamp}</td>
        <td><span class="log-level log-level-${log.level}">${log.level}</span></td>
        <td><code>${escapeHtml(log.source)}</code></td>
        <td><small>${escapeHtml(log.application)}</small></td>
        <td class="log-message">${escapeHtml(log.message)}</td>
    `;
    
    // Add to top of table
    tbody.insertBefore(row, tbody.firstChild);
    
    // Remove highlight animation after delay (matching existing UI)
    setTimeout(() => row.classList.remove('log-row-new'), 100);
    
    // Limit number of displayed logs
    while (tbody.children.length > MAX_DISPLAYED_LOGS) {
        tbody.removeChild(tbody.lastChild);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// FILTERING & SEARCH
// ============================================================================

function passesFilters(log) {
    // Check level filter
    if (activeFilters.level && log.level !== activeFilters.level) {
        return false;
    }
    
    // Check source filter
    if (activeFilters.source && log.source !== activeFilters.source) {
        return false;
    }
    
    // Check application filter
    if (activeFilters.application && log.application !== activeFilters.application) {
        return false;
    }
    
    // Check search filter (case-insensitive)
    if (activeFilters.search) {
        const searchLower = activeFilters.search.toLowerCase();
        const messageLower = log.message.toLowerCase();
        if (!messageLower.includes(searchLower)) {
            return false;
        }
    }
    
    return true;
}

function applyFilters() {
    // Get filter values
    activeFilters.level = document.getElementById('filterLevel').value;
    activeFilters.source = document.getElementById('filterSource').value;
    activeFilters.application = document.getElementById('filterApplication').value;
    activeFilters.search = document.getElementById('filterSearch').value.trim();
    
    // Clear current display
    const tbody = document.getElementById('logsTableBody');
    tbody.innerHTML = '';
    
    // Filter and display logs
    const filteredLogs = allLogs.filter(passesFilters);
    
    if (filteredLogs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-5">
                    <h5>No logs match the current filters</h5>
                    <p>Try adjusting your filter criteria</p>
                </td>
            </tr>
        `;
    } else {
        // Display up to MAX_DISPLAYED_LOGS
        const logsToDisplay = filteredLogs.slice(0, MAX_DISPLAYED_LOGS);
        logsToDisplay.forEach(log => displayLogRow(log));
    }
    
    // Update filter status
    updateFilterStatus(filteredLogs.length);
}

function clearFilters() {
    // Reset filter values
    document.getElementById('filterLevel').value = '';
    document.getElementById('filterSource').value = '';
    document.getElementById('filterApplication').value = '';
    document.getElementById('filterSearch').value = '';
    
    // Reset active filters
    activeFilters = { level: '', source: '', application: '', search: '' };
    
    // Reapply (will show all)
    applyFilters();
}

function updateFilterDropdowns() {
    // Get unique sources and applications from all logs
    const sources = new Set();
    const applications = new Set();
    
    allLogs.forEach(log => {
        sources.add(log.source);
        applications.add(log.application);
    });
    
    // Update source dropdown
    const sourceSelect = document.getElementById('filterSource');
    const currentSource = sourceSelect.value;
    sourceSelect.innerHTML = '<option value="">All Sources</option>';
    Array.from(sources).sort().forEach(source => {
        const option = document.createElement('option');
        option.value = source;
        option.textContent = source;
        if (source === currentSource) option.selected = true;
        sourceSelect.appendChild(option);
    });
    
    // Update application dropdown
    const appSelect = document.getElementById('filterApplication');
    const currentApp = appSelect.value;
    appSelect.innerHTML = '<option value="">All Applications</option>';
    Array.from(applications).sort().forEach(app => {
        const option = document.createElement('option');
        option.value = app;
        option.textContent = app;
        if (app === currentApp) option.selected = true;
        appSelect.appendChild(option);
    });
}

function updateFilterStatus(filteredCount) {
    const statusBadge = document.getElementById('filterStatus');
    const hasFilters = activeFilters.level || activeFilters.source || 
                       activeFilters.application || activeFilters.search;
    
    if (hasFilters) {
        statusBadge.textContent = `Showing ${filteredCount} of ${allLogs.length} logs`;
        statusBadge.className = 'badge bg-warning text-dark ms-3';
    } else {
        statusBadge.textContent = `Showing all logs (${allLogs.length} total)`;
        statusBadge.className = 'badge bg-info text-dark ms-3';
    }
}

// ============================================================================
// STATISTICS
// ============================================================================

function updateStatistics() {
    // Update individual stat cards
    document.getElementById('statErrors').textContent = logCounts.ERROR;
    document.getElementById('statWarnings').textContent = logCounts.WARN;
    document.getElementById('statInfo').textContent = logCounts.INFO;
    document.getElementById('statDebug').textContent = logCounts.DEBUG;
    
    // Calculate logs per second (for future use if needed)
    const now = Date.now();
    if (now - lastSecondTimestamp >= 1000) {
        logsPerSecond = logsInLastSecond;
        logsInLastSecond = 0;
        lastSecondTimestamp = now;
    }
}

// ============================================================================
// SIMULATION ENGINE
// ============================================================================

function startSimulation() {
    if (!currentScenario || isRunning) return;
    
    isRunning = true;
    currentPhaseIndex = 0;
    phaseStartTime = Date.now();
    
    // Reset statistics
    totalLogs = 0;
    logCounts = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0 };
    logsPerSecond = 0;
    logsInLastSecond = 0;
    lastSecondTimestamp = Date.now();
    
    // Clear all logs
    allLogs = [];
    
    // Clear logs table
    document.getElementById('logsTableBody').innerHTML = '';
    
    // Reset filter status
    updateFilterStatus(0);
    
    // Update UI
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('progressContainer').style.display = 'block';
    updateStatus('spike', 'Simulation Running');
    
    // Start simulation loop
    runSimulationLoop();
}

function stopSimulation() {
    isRunning = false;
    
    if (simulationInterval) {
        clearTimeout(simulationInterval);
        simulationInterval = null;
    }
    
    // Update UI
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('progressBar').style.width = '0%';
    updateStatus('normal', 'Stopped');
}

function runSimulationLoop() {
    if (!isRunning) return;
    
    const scenario = scenarios[currentScenario];
    const phase = scenario.phases[currentPhaseIndex];
    const elapsed = Date.now() - phaseStartTime;
    
    // Check if current phase is complete
    if (elapsed >= phase.duration) {
        currentPhaseIndex++;
        
        // Check if all phases are complete
        if (currentPhaseIndex >= scenario.phases.length) {
            completeSimulation();
            return;
        }
        
        // Start next phase
        phaseStartTime = Date.now();
        const nextPhase = scenario.phases[currentPhaseIndex];
        updateProgress(currentPhaseIndex, scenario.phases.length, nextPhase.name);
    } else {
        // Update progress within current phase
        const progress = (elapsed / phase.duration) * 100;
        updateProgress(currentPhaseIndex, scenario.phases.length, phase.name, progress);
    }
    
    // Generate logs for current phase
    const level = getLogLevel(phase.levelDistribution);
    const log = generateLog(scenario, level);
    addLogToTable(log);
    
    // Schedule next log
    const delay = 1000 / phase.logsPerSecond;
    simulationInterval = setTimeout(runSimulationLoop, delay);
}

function completeSimulation() {
    isRunning = false;
    
    if (simulationInterval) {
        clearTimeout(simulationInterval);
        simulationInterval = null;
    }
    
    // Update UI
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    updateStatus('normal', 'Simulation Complete');
    updateProgress(100, 100, 'Complete', 100);
    
    // Auto-hide progress after 3 seconds
    setTimeout(() => {
        document.getElementById('progressContainer').style.display = 'none';
    }, 3000);
}

function updateProgress(current, total, phaseName, phaseProgress = 0) {
    const overallProgress = ((current / total) * 100) + ((phaseProgress / total));
    document.getElementById('progressBar').style.width = overallProgress + '%';
    document.getElementById('progressText').textContent = `Phase ${current + 1}/${total}: ${phaseName}`;
}

function updateStatus(status, text) {
    const dot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    dot.className = 'status-indicator status-' + status;
    statusText.textContent = text;
}

// ============================================================================
// UI INITIALIZATION
// ============================================================================

function initializeUI() {
    // Populate scenario dropdown
    const scenarioSelect = document.getElementById('scenarioSelect');
    
    for (const [key, scenario] of Object.entries(scenarios)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${scenario.name} - ${scenario.description} (${scenario.duration}s)`;
        scenarioSelect.appendChild(option);
    }
    
    // Select first scenario by default
    scenarioSelect.value = 'basic';
    selectScenario('basic');
    
    // Add change listener for scenario selection
    scenarioSelect.addEventListener('change', (e) => {
        selectScenario(e.target.value);
    });
    
    // Bind event listeners
    document.getElementById('startBtn').addEventListener('click', startSimulation);
    document.getElementById('stopBtn').addEventListener('click', stopSimulation);
    
    // Bind filter event listeners
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Allow Enter key in search box
    document.getElementById('filterSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
}

function selectScenario(scenarioKey) {
    currentScenario = scenarioKey;
}

// ============================================================================
// STARTUP
// ============================================================================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeUI);

