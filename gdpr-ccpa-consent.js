// 🔒 GDPR/CCPA COMPLIANT CONSENT MANAGEMENT SYSTEM
// RED ZEN COMPLIANCE: Fully compliant privacy consent with granular controls
// Handles EU GDPR, California CCPA, and other privacy regulations

window.PrivacyConsentManager = {
    // Configuration
    config: {
        // Detection settings
        gdprCountries: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'IS', 'LI', 'NO'],
        ccpaStates: ['CA'], // California
        
        // Consent storage
        cookieName: 'macagent_consent_v2',
        cookieExpiry: 365, // days
        
        // API endpoints
        consentEndpoint: '/api/privacy/consent',
        deleteDataEndpoint: '/api/privacy/delete-data',
        downloadDataEndpoint: '/api/privacy/download-data',
        
        // UI settings
        bannerDelay: 1000, // Show after 1 second
        blockingMode: true, // Block tracking until consent
        
        debug: false
    },
    
    // Current privacy settings
    privacy: {
        region: 'unknown',
        requiresConsent: false,
        showCCPALink: false,
        consentGiven: false,
        consentTimestamp: null,
        consentVersion: '2.0',
        preferences: {
            necessary: true,     // Always required
            analytics: false,    // Google Analytics, Mixpanel
            marketing: false,    // Ad tracking, remarketing
            personalization: false, // Customization cookies
            functional: false    // Non-essential features
        }
    },
    
    // Initialize the system
    init: function() {
        this.detectRegion();
        this.loadSavedConsent();
        this.determineRequirements();
        
        if (this.privacy.requiresConsent && !this.privacy.consentGiven) {
            setTimeout(() => this.showConsentBanner(), this.config.bannerDelay);
        } else {
            this.initializeAllowedServices();
        }
        
        this.setupCCPALink();
        this.setupPrivacyControls();
        
        if (this.config.debug) {
            console.log('🔒 Privacy Consent Manager initialized', this.privacy);
        }
    },
    
    // Detect user's region for compliance requirements
    detectRegion: function() {
        // Try multiple detection methods
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const language = navigator.language || navigator.userLanguage;
        
        // Basic timezone-based detection
        if (timezone.includes('Europe/')) {
            this.privacy.region = 'EU';
        } else if (timezone.includes('America/Los_Angeles')) {
            this.privacy.region = 'CA';
        } else {
            this.privacy.region = 'other';
        }
        
        // Enhanced detection via external service (non-blocking)
        fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
                if (data.country_code) {
                    if (this.config.gdprCountries.includes(data.country_code)) {
                        this.privacy.region = 'EU';
                    } else if (data.region === 'California' || data.region_code === 'CA') {
                        this.privacy.region = 'CA';
                    }
                    this.determineRequirements();
                }
            })
            .catch(() => {
                // Fallback: assume consent required to be safe
                this.privacy.requiresConsent = true;
            });
        
        if (this.config.debug) {
            console.log('🌍 Region detected:', this.privacy.region);
        }
    },
    
    // Determine what privacy controls are needed
    determineRequirements: function() {
        this.privacy.requiresConsent = (this.privacy.region === 'EU');
        this.privacy.showCCPALink = (this.privacy.region === 'CA');
        
        // Be conservative - show consent if uncertain
        if (this.privacy.region === 'unknown') {
            this.privacy.requiresConsent = true;
            this.privacy.showCCPALink = true;
        }
    },
    
    // Load previously saved consent
    loadSavedConsent: function() {
        const saved = this.getCookie(this.config.cookieName);
        if (saved) {
            try {
                const consent = JSON.parse(decodeURIComponent(saved));
                
                // Check if consent is still valid (version and expiry)
                if (consent.version === this.privacy.consentVersion && 
                    new Date(consent.timestamp).getTime() + (this.config.cookieExpiry * 24 * 60 * 60 * 1000) > Date.now()) {
                    
                    this.privacy.consentGiven = true;
                    this.privacy.consentTimestamp = consent.timestamp;
                    this.privacy.preferences = { ...this.privacy.preferences, ...consent.preferences };
                    
                    if (this.config.debug) {
                        console.log('✅ Valid consent loaded:', consent);
                    }
                }
            } catch (e) {
                if (this.config.debug) {
                    console.warn('Invalid consent cookie:', e);
                }
                this.clearConsent();
            }
        }
    },
    
    // Show the consent banner
    showConsentBanner: function() {
        if (document.getElementById('consent-banner')) return;
        
        const banner = document.createElement('div');
        banner.id = 'consent-banner';
        banner.innerHTML = `
            <div class="consent-banner-overlay">
                <div class="consent-banner-content">
                    <div class="consent-header">
                        <h3>🍪 Your Privacy Matters</h3>
                        <p>We use cookies and similar technologies to provide our services, analyze usage, and improve your experience.</p>
                    </div>
                    
                    <div class="consent-categories">
                        <div class="consent-category">
                            <div class="category-header">
                                <input type="checkbox" id="necessary-consent" checked disabled>
                                <label for="necessary-consent"><strong>Necessary</strong></label>
                            </div>
                            <p>Essential for the website to function properly. Cannot be disabled.</p>
                        </div>
                        
                        <div class="consent-category">
                            <div class="category-header">
                                <input type="checkbox" id="analytics-consent">
                                <label for="analytics-consent"><strong>Analytics</strong></label>
                            </div>
                            <p>Help us understand how you use our site (Google Analytics, usage metrics).</p>
                        </div>
                        
                        <div class="consent-category">
                            <div class="category-header">
                                <input type="checkbox" id="marketing-consent">
                                <label for="marketing-consent"><strong>Marketing</strong></label>
                            </div>
                            <p>Used to deliver relevant advertisements and measure their effectiveness.</p>
                        </div>
                        
                        <div class="consent-category">
                            <div class="category-header">
                                <input type="checkbox" id="functional-consent">
                                <label for="functional-consent"><strong>Functional</strong></label>
                            </div>
                            <p>Enable enhanced functionality and personalization.</p>
                        </div>
                    </div>
                    
                    <div class="consent-buttons">
                        <button id="accept-all-btn" class="btn-primary">Accept All</button>
                        <button id="accept-selected-btn" class="btn-secondary">Accept Selected</button>
                        <button id="reject-all-btn" class="btn-minimal">Reject Non-Essential</button>
                    </div>
                    
                    <div class="consent-links">
                        <a href="/privacy-policy" target="_blank">Privacy Policy</a>
                        <a href="/cookie-policy" target="_blank">Cookie Policy</a>
                        <a href="#" id="manage-consent-link">Manage Preferences</a>
                    </div>
                </div>
            </div>
        `;
        
        // Inject styles
        const styles = document.createElement('style');
        styles.textContent = `
            .consent-banner-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .consent-banner-content {
                background: white;
                border-radius: 12px;
                padding: 32px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }
            .consent-header h3 {
                margin: 0 0 12px 0;
                font-size: 24px;
                color: #333;
            }
            .consent-header p {
                margin: 0 0 24px 0;
                color: #666;
                line-height: 1.5;
            }
            .consent-categories {
                margin-bottom: 24px;
            }
            .consent-category {
                margin-bottom: 16px;
                padding: 12px;
                border: 1px solid #e1e1e1;
                border-radius: 8px;
            }
            .category-header {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
            }
            .category-header input {
                margin-right: 12px;
            }
            .category-header label {
                font-weight: 500;
                color: #333;
            }
            .consent-category p {
                margin: 0;
                font-size: 14px;
                color: #666;
                line-height: 1.4;
            }
            .consent-buttons {
                display: flex;
                gap: 12px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            .consent-buttons button {
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            .btn-primary {
                background: #007AFF;
                color: white;
            }
            .btn-primary:hover {
                background: #0056CC;
            }
            .btn-secondary {
                background: #f0f0f0;
                color: #333;
            }
            .btn-secondary:hover {
                background: #e0e0e0;
            }
            .btn-minimal {
                background: transparent;
                color: #666;
                text-decoration: underline;
            }
            .consent-links {
                display: flex;
                gap: 16px;
                justify-content: center;
                font-size: 14px;
            }
            .consent-links a {
                color: #007AFF;
                text-decoration: none;
            }
            .consent-links a:hover {
                text-decoration: underline;
            }
            @media (max-width: 600px) {
                .consent-banner-content {
                    margin: 20px;
                    padding: 24px;
                }
                .consent-buttons {
                    flex-direction: column;
                }
                .consent-links {
                    flex-direction: column;
                    gap: 8px;
                }
            }
        `;
        document.head.appendChild(styles);
        
        document.body.appendChild(banner);
        
        // Attach event listeners
        this.attachConsentListeners();
    },
    
    // Attach event listeners to consent controls
    attachConsentListeners: function() {
        const acceptAllBtn = document.getElementById('accept-all-btn');
        const acceptSelectedBtn = document.getElementById('accept-selected-btn');
        const rejectAllBtn = document.getElementById('reject-all-btn');
        
        acceptAllBtn?.addEventListener('click', () => {
            this.giveConsent({
                necessary: true,
                analytics: true,
                marketing: true,
                functional: true,
                personalization: true
            });
        });
        
        acceptSelectedBtn?.addEventListener('click', () => {
            const preferences = {
                necessary: true,
                analytics: document.getElementById('analytics-consent').checked,
                marketing: document.getElementById('marketing-consent').checked,
                functional: document.getElementById('functional-consent').checked,
                personalization: false
            };
            this.giveConsent(preferences);
        });
        
        rejectAllBtn?.addEventListener('click', () => {
            this.giveConsent({
                necessary: true,
                analytics: false,
                marketing: false,
                functional: false,
                personalization: false
            });
        });
    },
    
    // Record user's consent
    giveConsent: function(preferences) {
        this.privacy.consentGiven = true;
        this.privacy.consentTimestamp = new Date().toISOString();
        this.privacy.preferences = { ...this.privacy.preferences, ...preferences };
        
        // Save to cookie
        const consentData = {
            version: this.privacy.consentVersion,
            timestamp: this.privacy.consentTimestamp,
            preferences: this.privacy.preferences,
            region: this.privacy.region
        };
        
        this.setCookie(
            this.config.cookieName,
            encodeURIComponent(JSON.stringify(consentData)),
            this.config.cookieExpiry
        );
        
        // Send to server
        if (this.config.consentEndpoint) {
            fetch(this.config.consentEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(consentData)
            }).catch(() => {}); // Non-blocking
        }
        
        // Remove banner
        const banner = document.getElementById('consent-banner');
        if (banner) {
            banner.remove();
        }
        
        // Initialize allowed services
        this.initializeAllowedServices();
        
        if (this.config.debug) {
            console.log('✅ Consent recorded:', this.privacy.preferences);
        }
    },
    
    // Initialize services based on consent
    initializeAllowedServices: function() {
        // Analytics (Google Analytics, Mixpanel)
        if (this.privacy.preferences.analytics) {
            if (typeof window.MacAgentAnalytics !== 'undefined') {
                window.MacAgentAnalytics.init();
            }
        }
        
        // Marketing (Ad tracking, remarketing)
        if (this.privacy.preferences.marketing) {
            // Enable marketing pixels, remarketing tags
            this.loadMarketingScripts();
        }
        
        // Functional (Chat widgets, preferences)
        if (this.privacy.preferences.functional) {
            this.enableFunctionalFeatures();
        }
        
        // Fire consent event
        window.dispatchEvent(new CustomEvent('privacy:consent-updated', {
            detail: this.privacy.preferences
        }));
    },
    
    // Load marketing scripts only if consented
    loadMarketingScripts: function() {
        // Facebook Pixel (example)
        if (!document.getElementById('facebook-pixel')) {
            const script = document.createElement('script');
            script.id = 'facebook-pixel';
            script.innerHTML = `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window,document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                
                fbq('init', 'YOUR_PIXEL_ID');
                fbq('track', 'PageView');
            `;
            document.head.appendChild(script);
        }
    },
    
    // Enable functional features
    enableFunctionalFeatures: function() {
        // Enable chat widget, preference saving, etc.
        if (this.config.debug) {
            console.log('🔧 Functional features enabled');
        }
    },
    
    // Setup CCPA "Do Not Sell My Data" link
    setupCCPALink: function() {
        if (!this.privacy.showCCPALink) return;
        
        // Add CCPA link to footer or designated area
        const ccpaLink = document.createElement('a');
        ccpaLink.href = '#';
        ccpaLink.textContent = 'Do Not Sell My Personal Information';
        ccpaLink.className = 'ccpa-link';
        ccpaLink.style.cssText = `
            display: block;
            margin: 10px 0;
            color: #007AFF;
            text-decoration: none;
            font-size: 14px;
        `;
        
        ccpaLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showCCPAModal();
        });
        
        // Add to footer
        const footer = document.querySelector('footer') || document.body;
        footer.appendChild(ccpaLink);
    },
    
    // Show CCPA data rights modal
    showCCPAModal: function() {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div class="ccpa-modal-overlay">
                <div class="ccpa-modal-content">
                    <h3>California Privacy Rights</h3>
                    <p>Under the California Consumer Privacy Act (CCPA), you have the right to:</p>
                    <ul>
                        <li>Know what personal information we collect</li>
                        <li>Delete your personal information</li>
                        <li>Opt-out of the sale of personal information</li>
                        <li>Non-discrimination for exercising your rights</li>
                    </ul>
                    <div class="ccpa-actions">
                        <button id="ccpa-opt-out">Opt-Out of Sale</button>
                        <button id="ccpa-delete-data">Delete My Data</button>
                        <button id="ccpa-download-data">Download My Data</button>
                        <button id="ccpa-close">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('#ccpa-opt-out').addEventListener('click', () => this.optOutOfSale());
        modal.querySelector('#ccpa-delete-data').addEventListener('click', () => this.requestDataDeletion());
        modal.querySelector('#ccpa-download-data').addEventListener('click', () => this.requestDataDownload());
        modal.querySelector('#ccpa-close').addEventListener('click', () => modal.remove());
    },
    
    // CCPA opt-out of sale
    optOutOfSale: function() {
        this.privacy.preferences.marketing = false;
        this.giveConsent(this.privacy.preferences);
        alert('You have opted out of data sale. Marketing cookies have been disabled.');
    },
    
    // Request data deletion
    requestDataDeletion: function() {
        const email = prompt('Please enter your email address to confirm data deletion:');
        if (email) {
            fetch(this.config.deleteDataEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, action: 'delete' })
            }).then(() => {
                alert('Data deletion request submitted. You will receive confirmation within 5 business days.');
            });
        }
    },
    
    // Request data download
    requestDataDownload: function() {
        const email = prompt('Please enter your email address to request your data:');
        if (email) {
            fetch(this.config.downloadDataEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, action: 'download' })
            }).then(() => {
                alert('Data download request submitted. You will receive your data within 30 days.');
            });
        }
    },
    
    // Setup privacy preference controls for existing users
    setupPrivacyControls: function() {
        // Look for privacy settings page/modal triggers
        const privacyLinks = document.querySelectorAll('[data-privacy-settings]');
        privacyLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPrivacySettings();
            });
        });
    },
    
    // Show privacy settings for users to change preferences
    showPrivacySettings: function() {
        // Remove existing banner
        const existingBanner = document.getElementById('consent-banner');
        if (existingBanner) existingBanner.remove();
        
        // Show consent banner in settings mode
        this.showConsentBanner();
        
        // Pre-fill current preferences
        if (document.getElementById('analytics-consent')) {
            document.getElementById('analytics-consent').checked = this.privacy.preferences.analytics;
        }
        if (document.getElementById('marketing-consent')) {
            document.getElementById('marketing-consent').checked = this.privacy.preferences.marketing;
        }
        if (document.getElementById('functional-consent')) {
            document.getElementById('functional-consent').checked = this.privacy.preferences.functional;
        }
    },
    
    // Clear all consent data
    clearConsent: function() {
        this.setCookie(this.config.cookieName, '', -1);
        this.privacy.consentGiven = false;
        this.privacy.consentTimestamp = null;
        this.privacy.preferences = {
            necessary: true,
            analytics: false,
            marketing: false,
            personalization: false,
            functional: false
        };
    },
    
    // Utility: Set cookie
    setCookie: function(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    },
    
    // Utility: Get cookie
    getCookie: function(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    
    // API: Check if specific consent is given
    hasConsent: function(category) {
        return this.privacy.consentGiven && this.privacy.preferences[category];
    },
    
    // API: Get current privacy settings
    getPrivacySettings: function() {
        return {
            region: this.privacy.region,
            consentRequired: this.privacy.requiresConsent,
            consentGiven: this.privacy.consentGiven,
            preferences: this.privacy.preferences,
            timestamp: this.privacy.consentTimestamp
        };
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.PrivacyConsentManager.init();
});

// Export global functions
window.hasPrivacyConsent = function(category) {
    return window.PrivacyConsentManager.hasConsent(category);
};

window.showPrivacySettings = function() {
    window.PrivacyConsentManager.showPrivacySettings();
};

// Integration with analytics
window.addEventListener('privacy:consent-updated', function(e) {
    const preferences = e.detail;
    
    // Update Google Analytics consent
    if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
            'analytics_storage': preferences.analytics ? 'granted' : 'denied',
            'ad_storage': preferences.marketing ? 'granted' : 'denied',
            'functionality_storage': preferences.functional ? 'granted' : 'denied',
            'personalization_storage': preferences.personalization ? 'granted' : 'denied'
        });
    }
    
    console.log('🔒 Privacy consent updated:', preferences);
});

console.log('🔒 GDPR/CCPA CONSENT MANAGER READY:');
console.log('✅ Auto-detects EU/California users');  
console.log('✅ Granular consent categories');
console.log('✅ CCPA "Do Not Sell" compliance');
console.log('✅ Data deletion & download requests');
console.log('✅ Consent versioning & expiry');
console.log('✅ Blocks tracking until consent given');