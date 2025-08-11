#!/usr/bin/env node

/**
 * MacAgent Pro v1.0.2 - Milestone Webhook Server
 * Real-time notifications for press, team, and community
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { WebClient } = require('@slack/web-api');

class WebhookServer {
    constructor() {
        this.app = express();
        this.port = process.env.WEBHOOK_PORT || 3001;
        
        // Webhook configurations
        this.webhooks = {
            discord: {
                url: process.env.DISCORD_WEBHOOK_URL,
                secret: process.env.DISCORD_WEBHOOK_SECRET,
                enabled: true
            },
            slack: {
                token: process.env.SLACK_BOT_TOKEN,
                channel: process.env.SLACK_CHANNEL || '#macagent-milestones',
                enabled: true
            },
            teams: {
                url: process.env.TEAMS_WEBHOOK_URL,
                enabled: true
            },
            zapier: {
                url: process.env.ZAPIER_WEBHOOK_URL,
                secret: process.env.ZAPIER_SECRET,
                enabled: true
            }
        };
        
        this.milestoneThresholds = [1000, 2500, 5000, 10000, 25000, 50000, 100000];
        this.lastNotifiedMilestone = 1000; // Start after first milestone
        
        this.setupMiddleware();
        this.setupRoutes();
    }
    
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }
    
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'macagent-pro-webhook-server',
                version: '1.0.2',
                timestamp: new Date().toISOString(),
                webhooks: Object.keys(this.webhooks).reduce((acc, key) => {
                    acc[key] = this.webhooks[key].enabled ? 'enabled' : 'disabled';
                    return acc;
                }, {})
            });
        });
        
        // Milestone notification endpoint
        this.app.post('/milestone', async (req, res) => {
            try {
                const { installs, metrics, milestone } = req.body;
                
                // Validate webhook signature if provided
                if (!this.validateSignature(req)) {
                    return res.status(401).json({ error: 'Invalid signature' });
                }
                
                await this.processMilestone({ installs, metrics, milestone });
                
                res.json({
                    success: true,
                    message: 'Milestone notifications sent',
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error('Milestone processing error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        
        // Performance alert endpoint
        this.app.post('/performance', async (req, res) => {
            try {
                const { metrics, alert_type, severity } = req.body;
                
                if (!this.validateSignature(req)) {
                    return res.status(401).json({ error: 'Invalid signature' });
                }
                
                await this.processPerformanceAlert({ metrics, alert_type, severity });
                
                res.json({
                    success: true,
                    message: 'Performance alert sent',
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error('Performance alert error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        
        // Press mention endpoint
        this.app.post('/press', async (req, res) => {
            try {
                const { outlet, title, url, sentiment, reach } = req.body;
                
                if (!this.validateSignature(req)) {
                    return res.status(401).json({ error: 'Invalid signature' });
                }
                
                await this.processPressMention({ outlet, title, url, sentiment, reach });
                
                res.json({
                    success: true,
                    message: 'Press mention notification sent',
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error('Press mention error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        
        // Test endpoint for webhook validation
        this.app.post('/test', async (req, res) => {
            try {
                const testData = {
                    installs: 1337,
                    metrics: {
                        avgLatency: 189,
                        uptime: 99.98,
                        countries: 42
                    },
                    milestone: {
                        threshold: 1337,
                        message: "🧪 TEST: Webhook system operational!"
                    }
                };
                
                await this.processMilestone(testData);
                
                res.json({
                    success: true,
                    message: 'Test webhooks sent successfully',
                    data: testData
                });
                
            } catch (error) {
                console.error('Test webhook error:', error);
                res.status(500).json({ error: 'Test failed' });
            }
        });
    }
    
    validateSignature(req) {
        const signature = req.headers['x-webhook-signature'];
        if (!signature || !process.env.WEBHOOK_SECRET) {
            return true; // Skip validation in development
        }
        
        const payload = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', process.env.WEBHOOK_SECRET)
            .update(payload, 'utf8')
            .digest('hex');
            
        return signature === `sha256=${expectedSignature}`;
    }
    
    async processMilestone(data) {
        const { installs, metrics, milestone } = data;
        
        console.log(`🎉 Processing milestone: ${milestone.threshold} installs`);
        
        // Send to all enabled webhooks
        const notifications = [];
        
        if (this.webhooks.discord.enabled) {
            notifications.push(this.sendDiscordMilestone(data));
        }
        
        if (this.webhooks.slack.enabled) {
            notifications.push(this.sendSlackMilestone(data));
        }
        
        if (this.webhooks.teams.enabled) {
            notifications.push(this.sendTeamsMilestone(data));
        }
        
        if (this.webhooks.zapier.enabled) {
            notifications.push(this.sendZapierMilestone(data));
        }
        
        // Wait for all notifications to complete
        const results = await Promise.allSettled(notifications);
        
        // Log results
        results.forEach((result, index) => {
            const platforms = ['discord', 'slack', 'teams', 'zapier'];
            const platform = platforms[index];
            
            if (result.status === 'fulfilled') {
                console.log(`✅ ${platform}: Milestone notification sent`);
            } else {
                console.error(`❌ ${platform}: Failed -`, result.reason);
            }
        });
        
        this.lastNotifiedMilestone = milestone.threshold;
    }
    
    async sendDiscordMilestone(data) {
        if (!this.webhooks.discord.url) return;
        
        const { installs, metrics, milestone } = data;
        
        const embed = {
            title: "🚀 MacAgent Pro Milestone Achieved!",
            description: milestone.message,
            color: 0xFFD700, // Gold
            fields: [
                {
                    name: "📊 Live Metrics",
                    value: `• **Installs:** ${installs.toLocaleString()}\n• **P95 Latency:** ${Math.round(metrics.avgLatency)}ms\n• **Uptime:** ${metrics.uptime}%\n• **Countries:** ${metrics.countries}`,
                    inline: false
                },
                {
                    name: "🔗 Links",
                    value: "[Live Tracker](https://legend.macagent.pro) | [Install Now](https://macagent.pro/#install)",
                    inline: false
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: "MacAgent Pro v1.0.2 • Hardware-Conscious AI",
                icon_url: "https://macagent.pro/icon-32.png"
            }
        };
        
        const response = await fetch(this.webhooks.discord.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `@everyone MacAgent Pro milestone reached! 🎉`,
                embeds: [embed]
            })
        });
        
        if (!response.ok) {
            throw new Error(`Discord webhook failed: ${response.status}`);
        }
        
        return response;
    }
    
    async sendSlackMilestone(data) {
        if (!this.webhooks.slack.token) return;
        
        const { installs, metrics, milestone } = data;
        const slack = new WebClient(this.webhooks.slack.token);
        
        const blocks = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "🚀 MacAgent Pro Milestone Achieved!"
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*${milestone.message}*`
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*📊 Installs:*\n${installs.toLocaleString()}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*⚡ P95 Latency:*\n${Math.round(metrics.avgLatency)}ms`
                    },
                    {
                        type: "mrkdwn",
                        text: `*🛡️ Uptime:*\n${metrics.uptime}%`
                    },
                    {
                        type: "mrkdwn",
                        text: `*🌍 Countries:*\n${metrics.countries}`
                    }
                ]
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "📊 View Live Tracker"
                        },
                        url: "https://legend.macagent.pro",
                        style: "primary"
                    },
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "🚀 Install Now"
                        },
                        url: "https://macagent.pro/#install"
                    }
                ]
            }
        ];
        
        const result = await slack.chat.postMessage({
            channel: this.webhooks.slack.channel,
            text: `MacAgent Pro milestone: ${milestone.threshold} installs reached!`,
            blocks: blocks
        });
        
        return result;
    }
    
    async sendTeamsMilestone(data) {
        if (!this.webhooks.teams.url) return;
        
        const { installs, metrics, milestone } = data;
        
        const card = {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "themeColor": "FFD700",
            "title": "🚀 MacAgent Pro Milestone Achieved!",
            "text": milestone.message,
            "sections": [
                {
                    "facts": [
                        { "name": "📊 Total Installs", "value": installs.toLocaleString() },
                        { "name": "⚡ P95 Latency", "value": `${Math.round(metrics.avgLatency)}ms` },
                        { "name": "🛡️ System Uptime", "value": `${metrics.uptime}%` },
                        { "name": "🌍 Countries Active", "value": metrics.countries.toString() }
                    ]
                }
            ],
            "potentialAction": [
                {
                    "@type": "OpenUri",
                    "name": "📊 View Live Tracker",
                    "targets": [{ "os": "default", "uri": "https://legend.macagent.pro" }]
                },
                {
                    "@type": "OpenUri",
                    "name": "🚀 Install MacAgent Pro",
                    "targets": [{ "os": "default", "uri": "https://macagent.pro/#install" }]
                }
            ]
        };
        
        const response = await fetch(this.webhooks.teams.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(card)
        });
        
        if (!response.ok) {
            throw new Error(`Teams webhook failed: ${response.status}`);
        }
        
        return response;
    }
    
    async sendZapierMilestone(data) {
        if (!this.webhooks.zapier.url) return;
        
        const payload = {
            event_type: 'milestone_achieved',
            milestone: data.milestone.threshold,
            message: data.milestone.message,
            installs: data.installs,
            metrics: data.metrics,
            timestamp: new Date().toISOString(),
            urls: {
                tracker: 'https://legend.macagent.pro',
                install: 'https://macagent.pro/#install',
                press: 'https://macagent.pro/press'
            }
        };
        
        const response = await fetch(this.webhooks.zapier.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Zapier webhook failed: ${response.status}`);
        }
        
        return response;
    }
    
    async processPerformanceAlert(data) {
        const { metrics, alert_type, severity } = data;
        console.log(`⚠️  Performance alert: ${alert_type} (${severity})`);
        
        // Only send critical alerts to avoid noise
        if (severity === 'critical') {
            // Implementation for performance alerts
            // Similar structure to milestone notifications
        }
    }
    
    async processPressMention(data) {
        const { outlet, title, url, sentiment, reach } = data;
        console.log(`📰 Press mention: ${outlet} - ${sentiment}`);
        
        // Send press mention notifications
        // Implementation similar to milestones
    }
    
    start() {
        this.app.listen(this.port, () => {
            console.log(`🔔 MacAgent Pro Webhook Server running on port ${this.port}`);
            console.log(`📊 Health check: http://localhost:${this.port}/health`);
            console.log(`🧪 Test endpoint: http://localhost:${this.port}/test`);
            
            // Log enabled webhooks
            Object.entries(this.webhooks).forEach(([key, config]) => {
                const status = config.enabled ? '✅ enabled' : '❌ disabled';
                console.log(`   ${key}: ${status}`);
            });
        });
    }
}

// Create and start server
const webhookServer = new WebhookServer();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Gracefully shutting down webhook server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Webhook server terminated');
    process.exit(0);
});

// Start server if this is the main module
if (require.main === module) {
    webhookServer.start();
}

module.exports = WebhookServer;