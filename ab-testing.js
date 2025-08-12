// A/B Testing Framework for MacAgent Pro Landing Page
// Integrated with analytics and URL-driven variant assignment

window.MacAgentAB = {
    // Test configurations
    tests: {
        headline: {
            enabled: true,
            variants: [
                "World's First Mac-Dedicated AI Agent", // Control (current)
                "The AI Assistant Siri Should Have Been", // H1A (competitive)  
                "🎤 Voice-Activated Mac AI Now Live!" // H1B (voice-focused)
            ],
            metric: 'rpv', // Revenue Per Visitor (RED ZEN FIX)
            required_sample_size: 329, // Per variant for 40% lift
            test_duration_days: 14
        },
        lead_magnet: {
            enabled: true,
            variants: [
                { type: "email_gate", message: "Enter email for instant Mac health report" }, // Control
                { type: "scan_first", message: "Get your Mac health score now (save report after)" } // Test
            ],
            metric: 'trial_start_rate', // Focus on activation, not just emails
            required_sample_size: 163, // Per variant
            test_duration_days: 14
        },
        exit_intent: {
            enabled: true,
            variants: [
                { type: "timer", hours: 24, message: "Limited Time Beta Access" }, // Control
                { type: "bonus", title: "Bonus: Crash-Fix Checklist", subtitle: "Get our 1-page Mac troubleshooting guide (free PDF)" } // EXIT_B
            ],
            metric: 'exit_intent_conversion'
        }
    },
    
    // User assignment and tracking
    user: {
        id: null,
        segment: null,
        assignments: {},
        urlOverrides: {},
        events: []
    },
    
    // Initialize A/B testing
    init: function() {
        this.user.id = this.getUserId();
        this.user.segment = this.determineSegment();
        this.parseURLOverrides();
        this.assignVariants();
        this.trackExposure();
        this.applyVariants();
        
        console.log('MacAgent A/B Testing initialized:', this.user);
    },
    
    // Parse URL parameters for variant overrides
    parseURLOverrides: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const expParam = urlParams.get('exp');
        
        if (expParam) {
            const variants = expParam.split(',');
            variants.forEach(variant => {
                const v = variant.trim().toUpperCase();
                if (v === 'H1A') this.user.urlOverrides.headline = 1;
                else if (v === 'H1B') this.user.urlOverrides.headline = 2;
                else if (v === 'CTA1') this.user.urlOverrides.cta = 1;
                else if (v === 'CTA2') this.user.urlOverrides.cta = 2;
                else if (v === 'EXIT_A') this.user.urlOverrides.exit_intent = 0;
                else if (v === 'EXIT_B') this.user.urlOverrides.exit_intent = 1;
            });
        }
    },
    
    // Get or create user ID
    getUserId: function() {
        let userId = localStorage.getItem('macagent_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('macagent_user_id', userId);
        }
        return userId;
    },
    
    // Determine user segment
    determineSegment: function() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Intel')) return 'intel_mac';
        if (userAgent.includes('Apple')) return 'apple_silicon';
        return 'unknown_mac';
    },
    
    // Assign user to test variants
    assignVariants: function() {
        for (const [testName, testConfig] of Object.entries(this.tests)) {
            if (testConfig.enabled) {
                let variantIndex;
                
                // Check for URL override first
                if (this.user.urlOverrides[testName] !== undefined) {
                    variantIndex = this.user.urlOverrides[testName];
                } else {
                    // Use consistent hash-based assignment
                    variantIndex = this.hashUserId(testName) % testConfig.variants.length;
                }
                
                this.user.assignments[testName] = {
                    variant: variantIndex,
                    value: testConfig.variants[variantIndex],
                    source: this.user.urlOverrides[testName] !== undefined ? 'url_override' : 'hash_assignment'
                };
            }
        }
        
        // Save assignments to localStorage for persistence
        localStorage.setItem('macagent_ab_assignments', JSON.stringify(this.user.assignments));
    },
    
    // Hash user ID for consistent variant assignment
    hashUserId: function(testName) {
        const str = this.user.id + testName;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    },
    
    // Get variant for a specific test
    getVariant: function(testName) {
        const assignment = this.user.assignments[testName];
        return assignment ? assignment.value : null;
    },
    
    // Track test exposure
    trackExposure: function() {
        for (const [testName, assignment] of Object.entries(this.user.assignments)) {
            if (window.MacAgentAnalytics) {
                window.MacAgentAnalytics.track('ab_exposure', {
                    test_name: testName,
                    variant_index: assignment.variant,
                    variant_value: typeof assignment.value === 'string' ? assignment.value : JSON.stringify(assignment.value),
                    assignment_source: assignment.source
                });
            }
        }
    },
    
    // Apply variants to page elements
    applyVariants: function() {
        // Apply headline variant
        const headlineVariant = this.getVariant('headline');
        if (headlineVariant) {
            const headlineElements = document.querySelectorAll('[data-test="hero-headline"], .hero-headline, h1.text-6xl');
            headlineElements.forEach(el => {
                if (el) el.textContent = headlineVariant;
            });
        }
        
        // Apply CTA variant
        const ctaVariant = this.getVariant('cta');
        if (ctaVariant) {
            const ctaButtons = document.querySelectorAll('[data-test="primary-cta"], .cta-button, .primary-cta');
            ctaButtons.forEach(btn => {
                if (btn && !btn.dataset.originalText) {
                    btn.dataset.originalText = btn.textContent;
                    btn.textContent = ctaVariant;
                }
            });
        }
        
        // Apply exit-intent variant
        const exitVariant = this.getVariant('exit_intent');
        if (exitVariant) {
            this.setupExitIntent(exitVariant);
        }
    },
    
    // Setup exit-intent popup based on variant
    setupExitIntent: function(variant) {
        let mouseY = 0;
        let shown = false;
        
        const showExitIntent = () => {
            if (shown) return;
            shown = true;
            
            if (variant.type === 'timer') {
                this.showTimerExitIntent(variant);
            } else if (variant.type === 'bonus') {
                this.showBonusExitIntent(variant);
            }
            
            if (window.MacAgentAnalytics) {
                window.MacAgentAnalytics.track('exit_intent_shown', {
                    variant_type: variant.type,
                    variant_details: JSON.stringify(variant)
                });
            }
        };
        
        // Track mouse movement to detect exit intent
        document.addEventListener('mousemove', (e) => {
            mouseY = e.clientY;
        });
        
        document.addEventListener('mouseleave', (e) => {
            if (mouseY < 100) { // Mouse moved to top of page
                showExitIntent();
            }
        });
        
        // Also show after 30 seconds on page
        setTimeout(() => {
            if (!shown && Math.random() < 0.3) { // 30% chance after 30s
                showExitIntent();
            }
        }, 30000);
    },
    
    // Show timer-based exit intent
    showTimerExitIntent: function(variant) {
        const modal = this.createExitIntentModal();
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-md mx-auto relative">
                <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl" onclick="this.closest('.exit-intent-modal').remove()">×</button>
                <h3 class="text-2xl font-bold mb-4 text-gray-900">${variant.message}</h3>
                <div id="exit-timer" class="bg-red-100 rounded-lg p-4 text-center mb-6">
                    <div class="text-3xl font-mono font-bold text-red-600" id="timer-display">${variant.hours}:00:00</div>
                    <div class="text-sm text-red-700 mt-1">Time remaining for beta access</div>
                </div>
                <input type="email" placeholder="Enter your email for immediate access" class="w-full p-3 border rounded-lg mb-4" id="exit-email">
                <button class="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700" onclick="window.MacAgentAB.handleExitIntentCapture('timer')">
                    Get Beta Access Now
                </button>
            </div>
        `;
        
        this.startExitIntentTimer(variant.hours);
    },
    
    // Show bonus-based exit intent
    showBonusExitIntent: function(variant) {
        const modal = this.createExitIntentModal();
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-md mx-auto relative">
                <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl" onclick="this.closest('.exit-intent-modal').remove()">×</button>
                <h3 class="text-2xl font-bold mb-2 text-gray-900">${variant.title}</h3>
                <p class="text-gray-600 mb-6">${variant.subtitle}</p>
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div class="flex items-center">
                        <span class="text-2xl mr-3">📄</span>
                        <div>
                            <div class="font-semibold text-green-800">Instant Download</div>
                            <div class="text-sm text-green-600">Mac Crash-Fix Checklist PDF</div>
                        </div>
                    </div>
                </div>
                <input type="email" placeholder="Enter email for instant download" class="w-full p-3 border rounded-lg mb-4" id="exit-email">
                <button class="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700" onclick="window.MacAgentAB.handleExitIntentCapture('bonus')">
                    Download Free Guide
                </button>
            </div>
        `;
    },
    
    // Create exit intent modal container
    createExitIntentModal: function() {
        const modal = document.createElement('div');
        modal.className = 'exit-intent-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4';
        document.body.appendChild(modal);
        return modal;
    },
    
    // Start countdown timer for exit intent
    startExitIntentTimer: function(hours) {
        const endTime = Date.now() + (hours * 60 * 60 * 1000);
        
        const updateTimer = () => {
            const remaining = endTime - Date.now();
            if (remaining <= 0) {
                const display = document.getElementById('timer-display');
                if (display) display.textContent = "00:00:00";
                return;
            }
            
            const h = Math.floor(remaining / (1000 * 60 * 60));
            const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((remaining % (1000 * 60)) / 1000);
            
            const display = document.getElementById('timer-display');
            if (display) {
                display.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        
        // Stop timer when modal is closed
        setTimeout(() => clearInterval(interval), hours * 60 * 60 * 1000);
    },
    
    // Handle exit intent email capture
    handleExitIntentCapture: function(variant) {
        const emailInput = document.getElementById('exit-email');
        const email = emailInput.value.trim();
        
        if (!email || !this.isValidEmail(email)) {
            emailInput.classList.add('border-red-500');
            return;
        }
        
        if (window.MacAgentAnalytics) {
            window.MacAgentAnalytics.track('exit_intent_converted', {
                email: email,
                variant: variant
            });
            window.MacAgentAnalytics.track('email_capture', {
                email: email,
                source: 'exit_intent',
                variant: variant
            });
        }
        
        // Close modal
        document.querySelector('.exit-intent-modal').remove();
        
        // Show success message
        this.showSuccessMessage(variant === 'bonus' ? 'Check your email for the download link!' : 'Welcome to the MacAgent Pro beta!');
    },
    
    // Show success message
    showSuccessMessage: function(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    },
    
    // Email validation
    isValidEmail: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    // Add experiment parameters to outbound links
    addExpToLinks: function() {
        const currentExp = this.getCurrentExpString();
        if (!currentExp) return;
        
        const links = document.querySelectorAll('a[href*="macagent"], a[href*="hardcard"]');
        links.forEach(link => {
            const url = new URL(link.href);
            url.searchParams.set('exp', currentExp);
            link.href = url.toString();
        });
    },
    
    // Get current experiment string for URL parameters
    getCurrentExpString: function() {
        const params = [];
        
        for (const [testName, assignment] of Object.entries(this.user.assignments)) {
            const variant = assignment.variant;
            
            if (testName === 'headline' && variant === 1) params.push('H1A');
            else if (testName === 'headline' && variant === 2) params.push('H1B');
            else if (testName === 'cta' && variant === 1) params.push('CTA1');
            else if (testName === 'cta' && variant === 2) params.push('CTA2');
            else if (testName === 'exit_intent' && variant === 0) params.push('EXIT_A');
            else if (testName === 'exit_intent' && variant === 1) params.push('EXIT_B');
        }
        
        return params.length > 0 ? params.join(',') : null;
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for analytics to load first
    setTimeout(() => {
        window.MacAgentAB.init();
        window.MacAgentAB.addExpToLinks();
    }, 100);
});

// Track A/B test events via global functions
window.trackABConversion = function(testName, value = 1) {
    if (window.MacAgentAnalytics) {
        window.MacAgentAnalytics.track('ab_conversion', {
            test_name: testName,
            conversion_value: value,
            user_assignments: window.MacAgentAB.user.assignments
        });
    }
};

window.trackABClick = function(element, testName) {
    const assignment = window.MacAgentAB.user.assignments[testName];
    if (window.MacAgentAnalytics && assignment) {
        window.MacAgentAnalytics.track('ab_click', {
            test_name: testName,
            variant_index: assignment.variant,
            element_text: element.textContent.trim(),
            element_location: window.MacAgentAnalytics.getElementLocation(element)
        });
    }
};