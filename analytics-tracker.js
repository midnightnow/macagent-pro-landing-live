#!/usr/bin/env node

/**
 * MacAgent Pro v1.0.2 - Advanced Analytics Tracker
 * Comprehensive tracking for legend tracker, press coverage, and user engagement
 */

class AdvancedAnalytics {
    constructor() {
        this.config = {
            trackingId: process.env.GA_TRACKING_ID || 'G-MACAGENT-PRO',
            mixpanelToken: process.env.MIXPANEL_TOKEN,
            amplitudeKey: process.env.AMPLITUDE_KEY,
            segmentWriteKey: process.env.SEGMENT_WRITE_KEY,
            hotjarId: process.env.HOTJAR_ID,
            enabledPlatforms: {
                googleAnalytics: true,
                mixpanel: true,
                amplitude: true,
                segment: true,
                hotjar: true,
                custom: true
            }
        };

        this.events = {
            // Page Events
            LANDING_VIEW: 'landing_page_viewed',
            LEGEND_TRACKER_VIEW: 'legend_tracker_viewed',
            PRESS_MONITOR_VIEW: 'press_monitor_viewed',
            
            // Engagement Events
            INSTALL_COMMAND_COPIED: 'install_command_copied',
            GITHUB_LINK_CLICKED: 'github_link_clicked',
            LIVE_METRICS_VIEWED: 'live_metrics_viewed',
            ARCHITECTURE_DIAGRAM_VIEWED: 'architecture_diagram_viewed',
            
            // Conversion Events
            HOMEBREW_INSTALL_STARTED: 'homebrew_install_started',
            DIRECT_DOWNLOAD_CLICKED: 'direct_download_clicked',
            DOCUMENTATION_ACCESSED: 'documentation_accessed',
            
            // Social Events
            PRESS_ARTICLE_SHARED: 'press_article_shared',
            MILESTONE_SHARED: 'milestone_shared',
            TWITTER_SHARED: 'twitter_shared',
            
            // Technical Events
            LEGEND_TRACKER_MILESTONE: 'legend_tracker_milestone',
            PERFORMANCE_METRIC_UPDATE: 'performance_metric_update',
            WEBHOOK_TRIGGERED: 'webhook_triggered'
        };

        this.userProperties = {
            platform: null,
            source: null,
            medium: null,
            campaign: null,
            first_visit: null,
            returning_user: false,
            tech_background: null,
            interest_level: null
        };

        this.initializeTracking();
    }

    initializeTracking() {
        // Google Analytics 4
        if (this.config.enabledPlatforms.googleAnalytics) {
            this.initGoogleAnalytics();
        }

        // Mixpanel
        if (this.config.enabledPlatforms.mixpanel) {
            this.initMixpanel();
        }

        // Amplitude
        if (this.config.enabledPlatforms.amplitude) {
            this.initAmplitude();
        }

        // Segment
        if (this.config.enabledPlatforms.segment) {
            this.initSegment();
        }

        // Hotjar
        if (this.config.enabledPlatforms.hotjar) {
            this.initHotjar();
        }

        // Custom analytics
        if (this.config.enabledPlatforms.custom) {
            this.initCustomTracking();
        }
    }

    initGoogleAnalytics() {
        // GA4 initialization
        const gaScript = `
            <!-- Google tag (gtag.js) -->
            <script async src="https://www.googletagmanager.com/gtag/js?id=${this.config.trackingId}"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                
                gtag('config', '${this.config.trackingId}', {
                    page_title: 'MacAgent Pro - Revolutionary AI Assistant',
                    custom_map: {
                        'custom_parameter_1': 'install_method',
                        'custom_parameter_2': 'tech_background',
                        'custom_parameter_3': 'source_campaign'
                    }
                });

                // Enhanced ecommerce for conversion tracking
                gtag('config', '${this.config.trackingId}', {
                    custom_map: {
                        'custom_parameter_install_method': 'install_method',
                        'custom_parameter_user_type': 'user_type'
                    }
                });
            </script>
        `;

        console.log('📊 Google Analytics 4 initialized');
    }

    initMixpanel() {
        if (!this.config.mixpanelToken) return;

        const mixpanelScript = `
            <script type="text/javascript">
                (function(c,a){if(!a.__SV){var b=window;try{var d,m,j,k=b.location,f=k.hash;d=function(a,b){return(m=a.match(RegExp(b+"=([^&]*)")))?m[1]:null};f&&d(f,"state")&&(j=JSON.parse(decodeURIComponent(d(f,"state"))),"mpeditor"===j.action&&(b.sessionStorage.setItem("_mpcehash",f),history.replaceState(j.desiredHash||"",c.title,k.pathname+k.search)))}catch(n){}var l,h;window.mixpanel=a;a._i=[];a.init=function(b,d,g){function c(b,i){var a=i.split(".");2==a.length&&(b=b[a[0]],i=a[1]);b[i]=function(){b.push([i].concat(Array.prototype.slice.call(arguments,0)))}}var e=a;"undefined"!==typeof g?e=a[g]=[]:g="mixpanel";e.people=e.people||[];e.toString=function(b){var a="mixpanel";"mixpanel"!==g&&(a+="."+g);b||(a+=" (stub)");return a};e.people.toString=function(){return e.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");for(h=0;h<l.length;h++)c(e,l[h]);a._i.push([b,d,g])};a.__SV=1.2;b=c.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===c.location.protocol&&"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js";d=c.getElementsByTagName("script")[0];d.parentNode.insertBefore(b,d)}})(document,window.mixpanel||[]);
                mixpanel.init("${this.config.mixpanelToken}");
            </script>
        `;

        console.log('📊 Mixpanel initialized');
    }

    initAmplitude() {
        if (!this.config.amplitudeKey) return;

        const amplitudeScript = `
            <script type="text/javascript">
                (function(e,t){var n=e.amplitude||{_q:[],_iq:{}};var r=t.createElement("script");r.type="text/javascript";r.integrity="sha384-NPwNmSxjDFWKfJoMxDa3SL6QYOh3kGjQUG5sTjJR1t7kN3vCgTBKIbgJqXFb1yP3";r.crossOrigin="anonymous";r.async=true;r.src="https://cdn.amplitude.com/libs/amplitude-8.21.9-min.gz.js";r.onload=function(){if(!e.amplitude.runQueuedFunctions){console.log("[Amplitude] Error: could not load SDK")}};var s=t.getElementsByTagName("script")[0];s.parentNode.insertBefore(r,s);function i(e,t){e.prototype[t]=function(){this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));return this}}var o=function(){this._q=[];return this};var a=["add","append","clearAll","prepend","set","setOnce","unset","preInsert","postInsert","remove"];for(var c=0;c<a.length;c++){i(o,a[c])}n.Identify=o;var l=function(){this._q=[];return this};var u=["setProductId","setQuantity","setPrice","setRevenueType","setEventProperties"];for(var p=0;p<u.length;p++){i(l,u[p])}n.Revenue=l;var d=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","enableTracking","setGlobalUserProperties","identify","clearUserProperties","setGroup","logRevenueV2","regenerateDeviceId","groupIdentify","onInit","onNewSessionStart","logEventWithTimestamp","logEventWithGroups","setSessionId","resetSessionId"];function v(e){function t(t){e[t]=function(){e._q.push([t].concat(Array.prototype.slice.call(arguments,0)))}}for(var n=0;n<d.length;n++){t(d[n])}}v(n);n.getInstance=function(e){e=(!e||e.length===0?"default_instance":e).toLowerCase();if(!Object.prototype.hasOwnProperty.call(n._iq,e)){n._iq[e]={_q:[]};v(n._iq[e])}return n._iq[e]};e.amplitude=n})(window,document);
                amplitude.getInstance().init("${this.config.amplitudeKey}");
            </script>
        `;

        console.log('📊 Amplitude initialized');
    }

    initSegment() {
        if (!this.config.segmentWriteKey) return;

        const segmentScript = `
            <script>
                !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics.SNIPPET_VERSION="4.13.2";analytics.load("${this.config.segmentWriteKey}");analytics.page();}}();
            </script>
        `;

        console.log('📊 Segment initialized');
    }

    initHotjar() {
        if (!this.config.hotjarId) return;

        const hotjarScript = `
            <script>
                (function(h,o,t,j,a,r){
                    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                    h._hjSettings={hjid:${this.config.hotjarId},hjsv:6};
                    a=o.getElementsByTagName('head')[0];
                    r=o.createElement('script');r.async=1;
                    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                    a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            </script>
        `;

        console.log('📊 Hotjar initialized');
    }

    initCustomTracking() {
        // Custom analytics for MacAgent Pro specific metrics
        this.customAnalytics = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            pageViews: [],
            events: [],
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
            referrer: typeof document !== 'undefined' ? document.referrer : 'direct'
        };

        console.log('📊 Custom analytics initialized');
    }

    // Event tracking methods
    track(eventName, properties = {}, options = {}) {
        const enrichedProperties = {
            ...properties,
            timestamp: Date.now(),
            session_id: this.customAnalytics?.sessionId,
            page_url: typeof window !== 'undefined' ? window.location.href : 'server',
            referrer: typeof document !== 'undefined' ? document.referrer : 'direct',
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
        };

        // Send to all enabled platforms
        if (this.config.enabledPlatforms.googleAnalytics) {
            this.trackGA4(eventName, enrichedProperties);
        }

        if (this.config.enabledPlatforms.mixpanel) {
            this.trackMixpanel(eventName, enrichedProperties);
        }

        if (this.config.enabledPlatforms.amplitude) {
            this.trackAmplitude(eventName, enrichedProperties);
        }

        if (this.config.enabledPlatforms.segment) {
            this.trackSegment(eventName, enrichedProperties);
        }

        if (this.config.enabledPlatforms.custom) {
            this.trackCustom(eventName, enrichedProperties);
        }

        // Console logging for development
        console.log(`📊 Event tracked: ${eventName}`, enrichedProperties);
    }

    trackGA4(eventName, properties) {
        if (typeof gtag === 'undefined') return;

        gtag('event', eventName, {
            custom_parameter_1: properties.install_method || 'unknown',
            custom_parameter_2: properties.tech_background || 'unknown',
            custom_parameter_3: properties.source_campaign || 'organic',
            value: properties.value || 1,
            ...properties
        });
    }

    trackMixpanel(eventName, properties) {
        if (typeof mixpanel === 'undefined') return;

        mixpanel.track(eventName, {
            distinct_id: this.getUserId(),
            ...properties
        });
    }

    trackAmplitude(eventName, properties) {
        if (typeof amplitude === 'undefined') return;

        amplitude.getInstance().logEvent(eventName, properties);
    }

    trackSegment(eventName, properties) {
        if (typeof analytics === 'undefined') return;

        analytics.track(eventName, properties);
    }

    trackCustom(eventName, properties) {
        if (!this.customAnalytics) return;

        const event = {
            name: eventName,
            properties: properties,
            timestamp: Date.now()
        };

        this.customAnalytics.events.push(event);

        // Send to custom analytics endpoint
        this.sendToCustomEndpoint(event);
    }

    // Specialized tracking methods
    trackLegendTrackerView(metrics) {
        this.track(this.events.LEGEND_TRACKER_VIEW, {
            installs: metrics.installs,
            countries: metrics.countries,
            avg_latency: metrics.avgLatency,
            uptime: metrics.uptime
        });
    }

    trackInstallCommandCopy(method) {
        this.track(this.events.INSTALL_COMMAND_COPIED, {
            install_method: method, // 'homebrew' or 'curl'
            page_section: 'hero_cta'
        });
    }

    trackMilestoneAchieved(milestone, metrics) {
        this.track(this.events.LEGEND_TRACKER_MILESTONE, {
            milestone_threshold: milestone.threshold,
            milestone_message: milestone.message,
            current_installs: metrics.installs,
            avg_latency: metrics.avgLatency,
            countries: metrics.countries,
            conversion_type: 'milestone'
        });
    }

    trackPressArticleEngagement(article, actionType) {
        this.track(this.events.PRESS_ARTICLE_SHARED, {
            outlet: article.outlet,
            article_title: article.title,
            article_url: article.url,
            sentiment: article.sentiment,
            estimated_reach: article.reach,
            action_type: actionType // 'clicked', 'shared', 'commented'
        });
    }

    trackPerformanceMetricUpdate(metricName, value, context) {
        this.track(this.events.PERFORMANCE_METRIC_UPDATE, {
            metric_name: metricName,
            metric_value: value,
            context: context,
            page_type: 'legend_tracker'
        });
    }

    // Conversion funnel tracking
    trackConversionFunnel(stage, data = {}) {
        const funnelStages = {
            LANDING_VIEW: 'top_of_funnel',
            METRICS_ENGAGED: 'interest_shown',
            INSTALL_INTENT: 'consideration',
            COMMAND_COPIED: 'intent',
            DOWNLOAD_STARTED: 'conversion'
        };

        this.track(`conversion_funnel_${funnelStages[stage]}`, {
            funnel_stage: funnelStages[stage],
            ...data
        });
    }

    // User identification and segmentation
    identifyUser(userId, traits = {}) {
        const userTraits = {
            ...traits,
            first_seen: Date.now(),
            platform: 'macOS',
            source: 'macagent.pro'
        };

        if (typeof gtag !== 'undefined') {
            gtag('config', this.config.trackingId, {
                user_id: userId,
                custom_map: userTraits
            });
        }

        if (typeof mixpanel !== 'undefined') {
            mixpanel.identify(userId);
            mixpanel.people.set(userTraits);
        }

        if (typeof amplitude !== 'undefined') {
            amplitude.getInstance().setUserId(userId);
            amplitude.getInstance().setUserProperties(userTraits);
        }

        if (typeof analytics !== 'undefined') {
            analytics.identify(userId, userTraits);
        }
    }

    // UTM parameter tracking
    captureUTMParameters() {
        if (typeof window === 'undefined') return {};

        const urlParams = new URLSearchParams(window.location.search);
        return {
            utm_source: urlParams.get('utm_source'),
            utm_medium: urlParams.get('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign'),
            utm_term: urlParams.get('utm_term'),
            utm_content: urlParams.get('utm_content')
        };
    }

    // Real-time analytics dashboard data
    getAnalyticsDashboardData() {
        return {
            session_id: this.customAnalytics?.sessionId,
            events_tracked: this.customAnalytics?.events.length || 0,
            page_views: this.customAnalytics?.pageViews.length || 0,
            session_duration: Date.now() - (this.customAnalytics?.startTime || Date.now()),
            last_event: this.customAnalytics?.events[this.customAnalytics.events.length - 1]
        };
    }

    // Helper methods
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getUserId() {
        return this.customAnalytics?.sessionId || 'anonymous';
    }

    async sendToCustomEndpoint(event) {
        try {
            const response = await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });

            if (!response.ok) {
                console.warn('Custom analytics endpoint failed:', response.status);
            }
        } catch (error) {
            console.warn('Custom analytics error:', error.message);
        }
    }

    // Export analytics data
    exportAnalyticsData() {
        return {
            config: this.config,
            session: this.customAnalytics,
            dashboard_data: this.getAnalyticsDashboardData(),
            utm_parameters: this.captureUTMParameters()
        };
    }
}

// Client-side tracking initialization
if (typeof window !== 'undefined') {
    window.MacAgentAnalytics = new AdvancedAnalytics();
    
    // Auto-track page view
    window.MacAgentAnalytics.track('page_view', {
        page_title: document.title,
        page_url: window.location.href,
        referrer: document.referrer
    });
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedAnalytics;
}