# DNS Configuration Guide - MacAgent Pro Monetization

## 🌐 Required Domain Setup

Your monetization system needs these domains to be accessible:

### Primary Domains Needed:
- `macagent.pro` - Main landing page
- `vetsorcery.com` - VetSorcery emergency coverage
- `legend.macagent.pro` - Live metrics dashboard
- `metrics.macagent.pro` - API endpoints

## 🚀 Quick Setup Options

### Option 1: Use Existing Domains (Recommended)
If you already own these domains, just add DNS records:

```bash
# AWS Route 53 or your DNS provider
A     macagent.pro              → YOUR_SERVER_IP
A     vetsorcery.com           → YOUR_SERVER_IP  
CNAME legend.macagent.pro      → macagent.pro
CNAME metrics.macagent.pro     → macagent.pro
```

### Option 2: Use Free Alternatives (For Testing)
Replace domains in the code with free alternatives:

```bash
# Use these free services:
macagent.pro → your-username.github.io
vetsorcery.com → your-app.netlify.app
legend.macagent.pro → your-app.vercel.app
```

### Option 3: Run Everything Locally (Start Here)
Test the complete system locally first:

```bash
# Start the metrics server
node metrics-server-production.js

# Open these URLs in browser:
http://localhost:8080/war-room           # Revenue dashboard
http://localhost:8080/                   # Main landing page
file:///path/to/emergency-phone-coverage.html  # VetSorcery page
file:///path/to/macagent-early-access.html     # Early access page
```

## 🔧 Local Testing Commands

```bash
# 1. Start the backend server
cd /Users/studio/macagent-pro-landing-live
node metrics-server-production.js &

# 2. Test VetSorcery campaign 
./execute-vetsorcery-campaign.sh

# 3. Test MacAgent Pro campaign
python3 macagent-developer-campaign.py

# 4. View dashboards
open http://localhost:8080/war-room
open vetsorcery-outreach-dashboard.html
open legend.html
```

## 💳 Payment Links Status

Your Stripe payment links work immediately:
- `https://buy.stripe.com/emergency-phone-coverage` (VetSorcery - $497/month)
- `https://buy.stripe.com/macagent-early-access` (Early access - $297)

These don't require DNS - they're hosted by Stripe.

## ⚡ Immediate Launch Strategy

**You can start generating revenue TODAY without DNS setup:**

1. **Email campaigns** work immediately (they link to Stripe)
2. **Social media posts** can use direct Stripe links  
3. **Direct outreach** can reference the local files
4. **Payment processing** is already live

## 🎯 Recommended Next Steps

1. **Test locally** - Run all systems on localhost first
2. **Launch campaigns** - Use direct Stripe links for payments
3. **Get domain later** - Purchase domains when revenue validates demand
4. **Migrate to production** - Move to proper domains once profitable

Want me to help you test the local setup first?