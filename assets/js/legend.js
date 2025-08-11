/**
 * MacAgent Pro - Living Legend Tracker v1.1.0 (Immortal Edition)
 * Revolutionary AI Launch - Live Metrics Engine
 * 
 * This is the immortal engine. WebSocket-first with graceful fallbacks,
 * performance monitoring, and designed to never fail.
 */

const LegendTrackerModule = (() => {
    
    // Configuration
    const CONFIG = {
        wsEndpoint: 'wss://metrics.macagent.pro/live',
        apiEndpoint: 'https://metrics.macagent.pro/api/v1/summary',
        pollingInterval: 15000,
        animationDuration: 1500,
        staleDataTimeout: 45000,
        mapLibraryUrl: 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js'
    };

    // State Management
    const state = {
        connectionStatus: 'CONNECTING',
        totalInstalls: 1247,
        activeInstances: 1156,
        p95Latency: 187,
        crashFreeRate: 99.97,
        installsPerHour: 47,
        countries: new Set(['US', 'GB', 'DE', 'JP', 'CA', 'FR', 'AU']),
        historicalLatency: [],
        lastUpdate: Date.now()
    };

    // DOM Elements Cache
    const DOM = {};
    
    // Rendering optimization
    let renderPending = false;
    
    // WebSocket reference
    let ws = null;
    let fallbackPollingTimer = null;

    /**
     * Safe number parsing with clamping
     */
    const clamp0 = (n) => Math.max(0, Number.isFinite(n) ? n : 0);

    /**
     * Coalesced rendering - one RAF per tick
     */
    const scheduleRender = () => {
        if (renderPending) return;
        renderPending = true;
        requestAnimationFrame(() => {
            renderPending = false;
            renderUI();
        });
    };

    /**
     * Update connection status display
     */
    const updateConnectionStatus = (status) => {
        state.connectionStatus = status;
        if (DOM.statusIndicator) {
            DOM.statusIndicator.textContent = status;
            DOM.statusIndicator.className = `status-${status.toLowerCase()}`;
        }
        
        // Update status color indicator
        if (DOM.statusDot) {
            const colorMap = {
                'LIVE': 'bg-green-500',
                'CONNECTING': 'bg-yellow-500',
                'DEGRADED': 'bg-orange-500',
                'OFFLINE': 'bg-red-500'
            };
            DOM.statusDot.className = `w-2 h-2 rounded-full animate-pulse ${colorMap[status] || 'bg-gray-500'}`;
        }
        
        console.log(`[Legend Tracker] Status: ${status}`);
    };

    /**
     * Enhanced WebSocket with jittered reconnect
     */
    const connectWebSocket = (() => {
        let attempt = 0;
        
        return function open() {
            if (ws && ws.readyState === WebSocket.OPEN) return;
            
            ws = new WebSocket(CONFIG.wsEndpoint);
            const jitter = () => Math.min(30000, (2 ** attempt) * 500) + Math.random() * 500;
            let staleTimer;

            ws.onopen = () => {
                attempt = 0;
                updateConnectionStatus('LIVE');
                clearTimeout(staleTimer);
                
                // Set stale data timeout
                staleTimer = setTimeout(() => {
                    updateConnectionStatus('DEGRADED');
                }, CONFIG.staleDataTimeout);
                
                if (fallbackPollingTimer) {
                    clearInterval(fallbackPollingTimer);
                    fallbackPollingTimer = null;
                }
            };

            ws.onmessage = (event) => {
                // Reset stale timer
                clearTimeout(staleTimer);
                staleTimer = setTimeout(() => {
                    updateConnectionStatus('DEGRADED');
                }, CONFIG.staleDataTimeout);

                let update;
                try {
                    update = JSON.parse(event.data);
                } catch {
                    console.warn('[Legend Tracker] Invalid JSON received');
                    return;
                }

                // Process different message types
                switch (update.type) {
                    case 'heartbeat':
                        if (typeof update.data?.activeInstances === 'number') {
                            state.activeInstances = clamp0(update.data.activeInstances);
                        }
                        if (typeof update.data?.p95Latency === 'number') {
                            state.p95Latency = clamp0(update.data.p95Latency);
                            state.historicalLatency.push({
                                timestamp: Date.now(),
                                value: state.p95Latency
                            });
                            // Keep last 50 points
                            if (state.historicalLatency.length > 50) {
                                state.historicalLatency.shift();
                            }
                        }
                        if (typeof update.data?.installsPerHour === 'number') {
                            state.installsPerHour = clamp0(update.data.installsPerHour);
                        }
                        break;
                        
                    case 'new_install':
                        state.totalInstalls = Math.max(
                            state.totalInstalls + 1, 
                            clamp0(update.data?.globalInstalls) || state.totalInstalls
                        );
                        if (update.data?.country) {
                            state.countries.add(update.data.country);
                        }
                        
                        // Trigger install animation
                        triggerInstallAnimation(update.data);
                        break;
                        
                    case 'milestone':
                        const message = update.data?.message || 'Milestone achieved!';
                        console.log(`[Legend Tracker] MILESTONE: ${message}`);
                        triggerMilestoneAnimation(update.data);
                        
                        // Track milestone event
                        if (window.trackEvent) {
                            window.trackEvent('MilestoneAchieved', {
                                threshold: update.data?.threshold,
                                message: message
                            });
                        }
                        break;
                        
                    case 'full_update':
                        // Complete state update
                        if (update.data) {
                            state.totalInstalls = clamp0(update.data.totalInstalls);
                            state.activeInstances = clamp0(update.data.activeInstances);
                            state.p95Latency = clamp0(update.data.p95Latency);
                            state.crashFreeRate = clamp0(update.data.crashFreeRate);
                            state.installsPerHour = clamp0(update.data.installsPerHour);
                        }
                        break;
                }
                
                state.lastUpdate = Date.now();
                scheduleRender();
            };

            ws.onclose = () => {
                attempt++;
                updateConnectionStatus('CONNECTING');
                clearTimeout(staleTimer);
                
                // Start fallback polling immediately
                if (!fallbackPollingTimer) {
                    startFallbackPolling();
                }
                
                // Reconnect with jitter
                setTimeout(open, jitter());
            };

            ws.onerror = (error) => {
                console.error('[Legend Tracker] WebSocket error:', error);
                ws.close();
            };
        };
    })();

    /**
     * Fallback REST API polling
     */
    const startFallbackPolling = () => {
        if (fallbackPollingTimer) return;
        
        updateConnectionStatus('DEGRADED');
        
        const poll = async () => {
            try {
                const response = await fetch(CONFIG.apiEndpoint, {
                    headers: { 'Accept': 'application/json' }
                });
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const data = await response.json();
                
                // Update state from REST data
                state.totalInstalls = clamp0(data.totalInstalls);
                state.activeInstances = clamp0(data.activeInstances);
                state.p95Latency = clamp0(data.p95Latency);
                state.crashFreeRate = clamp0(data.crashFreeRate);
                state.installsPerHour = clamp0(data.installsPerHour);
                
                if (data.countries && Array.isArray(data.countries)) {
                    data.countries.forEach(country => state.countries.add(country));
                }
                
                state.lastUpdate = Date.now();
                scheduleRender();
                
            } catch (error) {
                console.error('[Legend Tracker] Fallback poll failed:', error);
                updateConnectionStatus('OFFLINE');
                
                // Clear polling on repeated failures
                if (fallbackPollingTimer) {
                    clearInterval(fallbackPollingTimer);
                    fallbackPollingTimer = null;
                }
                
                // Try WebSocket again after brief delay
                setTimeout(connectWebSocket, 5000);
            }
        };
        
        // Poll immediately, then on interval
        poll();
        fallbackPollingTimer = setInterval(poll, CONFIG.pollingInterval);
    };

    /**
     * Render UI updates with animations
     */
    const renderUI = () => {
        // Animate counter updates
        animateCounter(DOM.mainCounter, state.totalInstalls);
        animateCounter(DOM.activeInstances, state.activeInstances);
        animateCounter(DOM.installsPerHour, state.installsPerHour);
        
        // Update latency with color coding
        if (DOM.p95Latency) {
            DOM.p95Latency.textContent = `${Math.round(state.p95Latency)}ms`;
            
            // Color code based on performance
            DOM.p95Latency.className = state.p95Latency < 200 ? 'text-green-500' : 
                                      state.p95Latency < 300 ? 'text-yellow-500' : 'text-red-500';
        }
        
        // Update reliability
        if (DOM.crashFreeRate) {
            DOM.crashFreeRate.textContent = `${state.crashFreeRate.toFixed(2)}%`;
        }
        
        // Update countries count
        if (DOM.countriesCount) {
            DOM.countriesCount.textContent = `${state.countries.size} countries`;
        }
        
        // Update last sync time
        if (DOM.lastSync) {
            const secondsAgo = Math.floor((Date.now() - state.lastUpdate) / 1000);
            DOM.lastSync.textContent = secondsAgo < 10 ? 'Just now' : `${secondsAgo}s ago`;
        }
        
        // Update historical chart if visible
        if (DOM.latencyChart && state.historicalLatency.length > 1) {
            renderLatencyChart();
        }
    };

    /**
     * Animate counter with smooth transitions
     */
    const animateCounter = (element, targetValue) => {
        if (!element || !targetValue) return;
        
        const currentValue = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
        const difference = targetValue - currentValue;
        
        if (Math.abs(difference) < 1) return;
        
        const duration = document.hidden ? 0 : CONFIG.animationDuration;
        const startTime = performance.now();
        const startValue = currentValue;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = Math.round(startValue + (difference * easeProgress));
            
            element.textContent = currentCount.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        if (duration > 0) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = targetValue.toLocaleString();
        }
    };

    /**
     * Trigger install animation
     */
    const triggerInstallAnimation = (installData) => {
        if (DOM.installPulse) {
            DOM.installPulse.classList.add('animate-ping');
            setTimeout(() => {
                DOM.installPulse.classList.remove('animate-ping');
            }, 1000);
        }
        
        // Add install notification
        if (DOM.installFeed && installData?.location) {
            addInstallNotification(installData);
        }
    };

    /**
     * Add install notification to feed
     */
    const addInstallNotification = (data) => {
        const notification = document.createElement('div');
        notification.className = 'flex items-center space-x-3 p-2 rounded-lg bg-green-900 bg-opacity-20 border-l-2 border-green-500 animate-slide-in';
        notification.innerHTML = `
            <div class="text-green-400 text-sm">🎉</div>
            <div class="flex-1 text-sm">
                <span class="text-green-400">Install #${state.totalInstalls}</span>
                from <span class="font-semibold">${data.location || 'Unknown'}</span>
                achieved <span class="font-semibold">${Math.round(state.p95Latency)}ms</span> latency
            </div>
            <div class="text-xs text-gray-400">Just now</div>
        `;
        
        DOM.installFeed.insertBefore(notification, DOM.installFeed.firstChild);
        
        // Remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
        
        // Keep only last 5 notifications
        while (DOM.installFeed.children.length > 5) {
            DOM.installFeed.removeChild(DOM.installFeed.lastChild);
        }
    };

    /**
     * Trigger milestone animation with confetti effect
     */
    const triggerMilestoneAnimation = (milestoneData) => {
        console.log('[Legend Tracker] 🎉 MILESTONE ACHIEVED!', milestoneData);
        
        // Add milestone notification
        if (DOM.milestoneFeed) {
            const milestone = document.createElement('div');
            milestone.className = 'milestone-card rounded-lg p-4 animate-milestone-pop bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold';
            milestone.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="text-2xl">🏆</div>
                    <div>
                        <div class="font-bold">MILESTONE ACHIEVED!</div>
                        <div>${milestoneData?.message || 'New milestone reached!'}</div>
                    </div>
                </div>
            `;
            
            DOM.milestoneFeed.insertBefore(milestone, DOM.milestoneFeed.firstChild);
            
            // Trigger confetti if library is available
            if (window.confetti) {
                window.confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }
    };

    /**
     * Render latency chart (placeholder for Chart.js integration)
     */
    const renderLatencyChart = () => {
        if (!window.Chart || !DOM.latencyChart) return;
        
        const ctx = DOM.latencyChart.getContext('2d');
        const labels = state.historicalLatency.map(point => 
            new Date(point.timestamp).toLocaleTimeString()
        );
        const data = state.historicalLatency.map(point => point.value);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'P95 Latency (ms)',
                    data: data,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: { 
                        display: false,
                        min: Math.min(...data) - 10,
                        max: Math.max(...data) + 10
                    }
                },
                elements: {
                    point: { radius: 0 }
                }
            }
        });
    };

    /**
     * Lazy-load world map library
     */
    const loadMapLibrary = async () => {
        if (window.d3) return;
        
        try {
            await import(CONFIG.mapLibraryUrl);
            console.log('[Legend Tracker] Map library loaded');
            // Initialize map here if needed
        } catch (error) {
            console.warn('[Legend Tracker] Failed to load map library:', error);
        }
    };

    /**
     * Performance monitoring with cross-browser safety
     */
    const observePaintTimings = () => {
        if (!('PerformanceObserver' in window)) return;

        let sent = false;

        const send = (ms) => {
            if (sent) return;
            sent = true;
            const val = Math.max(0, Math.round(ms));
            if (DOM.fcp) DOM.fcp.textContent = `${val}ms`;
            try { 
                if (window.trackEvent) {
                    window.trackEvent('PerformanceFCP', { fcp_ms: val });
                }
            } catch {}
        };

        try {
            // Prefer buffered PO so SPA navigations still report
            const po = new PerformanceObserver((list) => {
                const entry = list.getEntries().find(e => e.name === 'first-contentful-paint');
                if (entry) {
                    send(entry.startTime);
                    po.disconnect();
                }
            });
            po.observe({ type: 'paint', buffered: true });

            // Fallback in case the observer missed buffered entries (older Safari etc.)
            if (!sent) {
                const paints = performance.getEntriesByType?.('paint') || [];
                const fcp = paints.find(e => e.name === 'first-contentful-paint');
                if (fcp) send(fcp.startTime);
            }
        } catch {
            // Very old browsers: no-op
        }
    };

    /**
     * Page visibility optimization with reduced motion support
     */
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const applyAnimSpeed = () => {
        CONFIG.animationDuration = (document.hidden || prefersReduced?.matches) ? 0 : 1500;
        if (!document.hidden && CONFIG.animationDuration > 0) {
            scheduleRender(); // Trigger update when animations resume
        }
    };
    
    const handleVisibilityChange = () => {
        applyAnimSpeed();
        console.log(`[Legend Tracker] Visibility changed - animations: ${CONFIG.animationDuration > 0 ? 'enabled' : 'disabled'}`);
    };

    /**
     * Cache DOM elements
     */
    const cacheDOMElements = () => {
        DOM.statusIndicator = document.getElementById('status-indicator');
        DOM.statusDot = document.querySelector('.status-dot');
        DOM.mainCounter = document.getElementById('main-counter');
        DOM.activeInstances = document.getElementById('active-instances');
        DOM.p95Latency = document.getElementById('p95-latency');
        DOM.crashFreeRate = document.getElementById('crash-free-rate');
        DOM.installsPerHour = document.getElementById('installs-per-hour');
        DOM.countriesCount = document.getElementById('countries-count');
        DOM.lastSync = document.getElementById('last-sync');
        DOM.latencyChart = document.getElementById('latency-chart');
        DOM.installFeed = document.getElementById('install-feed');
        DOM.milestoneFeed = document.getElementById('milestone-feed');
        DOM.installPulse = document.getElementById('install-pulse');
        DOM.fcp = document.getElementById('fcp-metric');
        
        console.log('[Legend Tracker] DOM elements cached');
    };

    /**
     * Set up intersection observer for map loading with cleanup
     */
    const setupMapObserver = () => {
        const mapContainer = document.getElementById('world-map-container');
        if (!mapContainer || !('IntersectionObserver' in window)) return;

        const io = new IntersectionObserver(async (entries) => {
            if (!entries[0]?.isIntersecting) return;
            io.unobserve(mapContainer);
            io.disconnect();
            try {
                await loadMapLibrary();
                window.dispatchEvent(new Event('legend:map-ready'));
            } catch (e) {
                console.warn('[Legend Tracker] Map lib load failed:', e);
            }
        }, { threshold: 0.05, rootMargin: '200px 0px' });

        io.observe(mapContainer);
        // Optional: detach on unload to avoid leaks on SPA transitions
        window.addEventListener('beforeunload', () => io.disconnect(), { once: true });
    };

    /**
     * Initialize Legend Tracker (idempotent)
     */
    let _inited = false;
    const init = () => {
        if (_inited) return;
        _inited = true;
        
        console.log('[Legend Tracker] Initializing MacAgent Pro Living Legend Tracker v1.1.0');
        
        // Cache DOM elements
        cacheDOMElements();
        
        // Set up performance monitoring
        observePaintTimings();
        
        // Set up visibility and motion preferences
        document.addEventListener('visibilitychange', handleVisibilityChange);
        prefersReduced?.addEventListener?.('change', applyAnimSpeed);
        applyAnimSpeed(); // Initial setup
        
        // Set up map lazy loading
        setupMapObserver();
        
        // Initial render with simulated data
        scheduleRender();
        
        // Connect to real-time data
        connectWebSocket();
        
        console.log('[Legend Tracker] Initialization complete - The legend is live! 🚀');
    };

    // Expose public interface
    return {
        init,
        getState: () => ({ ...state }),
        getConnectionStatus: () => state.connectionStatus,
        triggerMilestone: triggerMilestoneAnimation,
        updateMetrics: (newMetrics) => {
            Object.assign(state, newMetrics);
            scheduleRender();
        }
    };

})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', LegendTrackerModule.init);
} else {
    LegendTrackerModule.init();
}