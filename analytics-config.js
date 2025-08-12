// MacAgent Pro Analytics & Conversion Tracking Configuration
// Comprehensive tracking setup for Google Analytics 4, Mixpanel, and custom analytics

window.MacAgentAnalytics = {
    // Configuration
    config: {
        googleAnalytics: {
            measurementId: 'G-2V8YPJ9HGK', // MacAgent Pro GA4 Measurement ID
            enabled: true // Analytics now enabled for production tracking
        },
        mixpanel: {
            token: 'YOUR_MIXPANEL_TOKEN', // Placeholder - replace with actual token
            projectId: 'YOUR_PROJECT_ID', // Placeholder - replace with project ID
            enabled: false // Set to true when token is configured
        },
        customAPI: {
            endpoint: '/api/analytics/track',
            enabled: false // Set to true when API is available
        },
        debug: true // Enable debug mode for launch monitoring
    },
    
    // Initialize all analytics services
    init: function() {
        this.initGoogleAnalytics();
        this.initMixpanel();
        this.setupConversionTracking();
        this.trackPageLoad();
        
        if (this.config.debug) {
            console.log('MacAgent Analytics initialized');
        }
    },
    
    // Initialize Google Analytics 4
    initGoogleAnalytics: function() {
        if (!this.config.googleAnalytics.enabled) return;
        
        // Load gtag script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalytics.measurementId}`;
        document.head.appendChild(script);
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', this.config.googleAnalytics.measurementId, {
            // Enhanced ecommerce and conversion tracking
            enhanced_ecommerce: true,
            custom_map: {
                'custom_parameter_1': 'mac_model',
                'custom_parameter_2': 'user_segment',
                'custom_parameter_3': 'ab_test_variant'
            }
        });
        
        // Enhanced conversion tracking
        gtag('config', this.config.googleAnalytics.measurementId, {
            custom_parameters: {
                mac_model: this.detectMacModel(),
                user_segment: this.getUserSegment(),
                landing_page_version: '1.0.2'
            }
        });
        
        if (this.config.debug) {
            console.log('Google Analytics 4 initialized');
        }
    },
    
    // Initialize Mixpanel
    initMixpanel: function() {
        if (!this.config.mixpanel.enabled) return;
        
        // Load Mixpanel
        (function(c,a){if(!a.__SV){var b=window;try{var d,m,j,k=b.location,f=k.hash;d=function(a,b){return(m=a.match(RegExp(b+"=([^&]*)")))?m[1]:null};f&&d(f,"state")&&(j=JSON.parse(decodeURIComponent(d(f,"state"))),"mpeditor"===j.action&&(b.sessionStorage.setItem("_mpcehash",f),history.replaceState(j.desiredHash||"",c.title,k.pathname+k.search)))}catch(n){}var l,h;window.mixpanel=a;a._i=[];a.init=function(b,d,g){function c(b,i){var a=i.split(".");2==a.length&&(b=b[a[0]],i=a[1]);b[i]=function(){b.push([i].concat(Array.prototype.slice.call(arguments,0)))}}var e=a;"undefined"!==typeof g?e=a[g]=[]:g="mixpanel";e.people=e.people||[];e.toString=function(b){var a="mixpanel";"mixpanel"!==g&&(a+="."+g);b||(a+=" (stub)");return a};e.people.toString=function(){return e.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<l.length;h++)c(e,l[h]);var f="set set_once union unset remove delete".split(" ");e.get_group=function(){function a(c){b[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));e.push([d,call2])}}for(var b={},d=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<f.length;c++)a(f[c]);return b};a._i.push([b,d,g])};a.__SV=1.2;b=c.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===c.location.protocol&&"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js";d=c.getElementsByTagName("script")[0];d.parentNode.insertBefore(b,d)}})(document,window.mixpanel||[]);
        
        // Initialize with token
        mixpanel.init(this.config.mixpanel.token, {
            track_pageview: true,
            persistence: 'localStorage'
        });
        
        // Set user properties
        mixpanel.register({
            'Mac Model': this.detectMacModel(),
            'User Segment': this.getUserSegment(),
            'Landing Page Version': '1.0.2',
            'Referrer': document.referrer || 'Direct'
        });
        
        if (this.config.debug) {
            console.log('Mixpanel initialized');
        }
    },
    
    // Setup conversion tracking
    setupConversionTracking: function() {
        // Email capture form tracking
        this.trackEmailForms();
        
        // CTA button tracking
        this.trackCTAButtons();
        
        // Premium conversion tracking
        this.trackPremiumActions();
        
        // Scroll depth tracking
        this.trackScrollDepth();
        
        // Time on page tracking
        this.trackTimeOnPage();
        
        if (this.config.debug) {
            console.log('Conversion tracking setup complete');
        }
    },
    
    // Track email capture forms
    trackEmailForms: function() {
        // Monitor all email input fields
        const emailInputs = document.querySelectorAll('input[type="email"], input[name*="email"]');
        
        emailInputs.forEach(input => {
            // Track when user starts typing
            input.addEventListener('focus', () => {
                this.track('email_field_focus', {
                    form_location: this.getFormLocation(input)
                });
            });
            
            // Track form submissions
            const form = input.closest('form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    const email = input.value;
                    if (email && this.isValidEmail(email)) {
                        this.track('email_capture', {
                            email: email,
                            form_location: this.getFormLocation(input),
                            source: 'form_submit'
                        });
                        
                        // Google Analytics conversion
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'conversion', {
                                send_to: this.config.googleAnalytics.measurementId + '/email_capture',
                                value: 1.0,
                                currency: 'USD'
                            });
                        }
                    }
                });
            }
        });
    },
    
    // Track CTA button clicks
    trackCTAButtons: function() {
        const ctaButtons = document.querySelectorAll('.cta-button, .primary-cta, [data-track="cta"]');
        
        ctaButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.track('cta_click', {
                    button_text: button.textContent.trim(),
                    button_location: this.getElementLocation(button),
                    href: button.href || null
                });
            });
        });
    },
    
    // Track premium conversions
    trackPremiumActions: function() {
        // Track pricing plan views
        const pricingCards = document.querySelectorAll('.pricing-card, [data-plan]');
        
        pricingCards.forEach(card => {
            // Track when pricing comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.track('pricing_view', {
                            plan: card.dataset.plan || 'unknown',
                            price: card.dataset.price || null
                        });
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(card);
            
            // Track pricing plan clicks
            card.addEventListener('click', () => {
                this.track('pricing_plan_click', {
                    plan: card.dataset.plan || 'unknown',
                    price: card.dataset.price || null
                });
            });
        });
    },
    
    // Track scroll depth
    trackScrollDepth: function() {
        const milestones = [25, 50, 75, 90, 100];
        const tracked = new Set();
        
        const trackScrollMilestone = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            milestones.forEach(milestone => {
                if (scrollPercent >= milestone && !tracked.has(milestone)) {
                    tracked.add(milestone);
                    this.track('scroll_depth', {
                        percentage: milestone
                    });
                }
            });
        };
        
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    trackScrollMilestone();
                    ticking = false;
                });
                ticking = true;
            }
        });
    },
    
    // Track time on page
    trackTimeOnPage: function() {
        const startTime = Date.now();
        const intervals = [30, 60, 120, 300]; // seconds
        const tracked = new Set();
        
        setInterval(() => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            
            intervals.forEach(interval => {
                if (timeOnPage >= interval && !tracked.has(interval)) {
                    tracked.add(interval);
                    this.track('time_on_page', {
                        seconds: interval
                    });
                }
            });
        }, 10000); // Check every 10 seconds
    },
    
    // Main tracking function
    track: function(event, properties = {}) {
        const eventData = {
            ...properties,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            page_title: document.title,
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight
        };
        
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', event, eventData);
        }
        
        // Mixpanel
        if (typeof mixpanel !== 'undefined' && this.config.mixpanel.enabled) {
            mixpanel.track(event, eventData);
        }
        
        // Custom API
        if (this.config.customAPI.enabled) {
            fetch(this.config.customAPI.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event: event,
                    properties: eventData
                })
            }).catch(err => {
                if (this.config.debug) {
                    console.warn('Custom analytics API error:', err);
                }
            });
        }
        
        if (this.config.debug) {
            console.log(`📊 Event tracked: ${event}`, eventData);
        }
    },
    
    // Track page load
    trackPageLoad: function() {
        this.track('page_view', {
            mac_model: this.detectMacModel(),
            user_segment: this.getUserSegment(),
            loading_time: Math.round(performance.timing.loadEventEnd - performance.timing.navigationStart)
        });
    },
    
    // Utility functions
    detectMacModel: function() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Intel Mac')) return 'Intel Mac';
        if (userAgent.includes('Macintosh')) return 'Apple Silicon';
        return 'Unknown Mac';
    },
    
    getUserSegment: function() {
        // Determine user segment based on various factors
        const hour = new Date().getHours();
        const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
        
        if (hour >= 9 && hour <= 17 && !isWeekend) {
            return 'business_hours';
        } else if (hour >= 18 && hour <= 23) {
            return 'evening_user';
        } else {
            return 'off_hours';
        }
    },
    
    getFormLocation: function(element) {
        // Determine form location on page
        if (element.closest('.hero')) return 'hero';
        if (element.closest('.modal')) return 'modal';
        if (element.closest('.footer')) return 'footer';
        if (element.closest('.sidebar')) return 'sidebar';
        return 'main_content';
    },
    
    getElementLocation: function(element) {
        // Determine element location on page
        if (element.closest('.hero')) return 'hero';
        if (element.closest('.pricing')) return 'pricing';
        if (element.closest('.features')) return 'features';
        if (element.closest('.footer')) return 'footer';
        return 'main_content';
    },
    
    isValidEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.MacAgentAnalytics.init();
});

// Track page unload
window.addEventListener('beforeunload', function() {
    const timeOnPage = Math.round((Date.now() - performance.timing.navigationStart) / 1000);
    
    if (navigator.sendBeacon && typeof gtag !== 'undefined') {
        gtag('event', 'page_exit', {
            time_on_page: timeOnPage,
            custom_parameters: {
                exit_method: 'beforeunload'
            }
        });
    }
});

// Export for global access
window.trackEvent = function(event, properties) {
    window.MacAgentAnalytics.track(event, properties);
};

window.trackConversion = function(type, value = 1) {
    window.MacAgentAnalytics.track('conversion', {
        conversion_type: type,
        conversion_value: value
    });
    
    // Send to Google Analytics as conversion
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
            send_to: window.MacAgentAnalytics.config.googleAnalytics.measurementId + '/' + type,
            value: value,
            currency: 'USD'
        });
    }
};