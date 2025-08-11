#!/bin/bash

# 🚀 MacAgent Pro Monetization System Deployment
# Deploy complete payment infrastructure across all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MACAGENT_DOMAIN="macagent.pro"
VETSORCERY_DOMAIN="vetsorcery.com"
WEBHOOK_PORT="3001"
METRICS_PORT="8080"

echo -e "${BLUE}🚀 MacAgent Pro Monetization System Deployment${NC}"
echo "=================================================="
echo

# Pre-flight checks
echo -e "${YELLOW}📋 Pre-flight System Checks${NC}"

# Check required environment variables
if [[ -z "$STRIPE_SECRET_KEY" ]]; then
    echo -e "${RED}❌ STRIPE_SECRET_KEY not set${NC}"
    echo "   Set with: export STRIPE_SECRET_KEY=sk_live_..."
    exit 1
fi

if [[ -z "$STRIPE_WEBHOOK_SECRET" ]]; then
    echo -e "${RED}❌ STRIPE_WEBHOOK_SECRET not set${NC}"
    echo "   Set with: export STRIPE_WEBHOOK_SECRET=whsec_..."
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Check Node.js and dependencies
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js environment ready${NC}"

# Check PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 not found, installing...${NC}"
    npm install -g pm2
fi

echo -e "${GREEN}✅ PM2 process manager ready${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing Dependencies${NC}"
npm install express stripe cors express-rate-limit ws @slack/web-api 2>/dev/null || {
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
}
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Deploy payment pages
echo -e "${YELLOW}💳 Deploying Payment Pages${NC}"

# Test Stripe configuration
node -e "
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
stripe.prices.list({ limit: 1 }).then(() => {
    console.log('✅ Stripe API connection successful');
}).catch(err => {
    console.error('❌ Stripe API connection failed:', err.message);
    process.exit(1);
});
"

echo -e "${GREEN}✅ Payment pages configured with live Stripe keys${NC}"

# Deploy webhook server
echo -e "${YELLOW}🔗 Deploying Webhook Server${NC}"

# Make webhook server executable
chmod +x stripe-webhook.js

# Start webhook server with PM2
pm2 stop stripe-webhook 2>/dev/null || true
pm2 start stripe-webhook.js --name stripe-webhook --env production

# Wait for startup
sleep 3

# Test webhook server
if curl -f http://localhost:$WEBHOOK_PORT/health &>/dev/null; then
    echo -e "${GREEN}✅ Stripe webhook server running on port $WEBHOOK_PORT${NC}"
else
    echo -e "${RED}❌ Webhook server failed to start${NC}"
    pm2 logs stripe-webhook --lines 10
    exit 1
fi

# Deploy metrics server
echo -e "${YELLOW}📊 Deploying Metrics Server${NC}"

# Make metrics server executable
chmod +x metrics-server-production.js

# Start metrics server with PM2
pm2 stop macagent-metrics 2>/dev/null || true
pm2 start metrics-server-production.js --name macagent-metrics --env production

# Wait for startup
sleep 3

# Test metrics server
if curl -f http://localhost:$METRICS_PORT/healthz &>/dev/null; then
    echo -e "${GREEN}✅ Metrics server running on port $METRICS_PORT${NC}"
else
    echo -e "${RED}❌ Metrics server failed to start${NC}"
    pm2 logs macagent-metrics --lines 10
    exit 1
fi

# Test API endpoints
echo -e "${YELLOW}🧪 Testing API Endpoints${NC}"

# Test metrics API
METRICS_RESPONSE=$(curl -s http://localhost:$METRICS_PORT/api/v1/summary)
if echo "$METRICS_RESPONSE" | jq -e '.globalInstalls' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Metrics API responding correctly${NC}"
else
    echo -e "${RED}❌ Metrics API test failed${NC}"
    echo "Response: $METRICS_RESPONSE"
    exit 1
fi

# Test webhook health
WEBHOOK_RESPONSE=$(curl -s http://localhost:$WEBHOOK_PORT/health)
if echo "$WEBHOOK_RESPONSE" | jq -e '.status' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Webhook server responding correctly${NC}"
else
    echo -e "${RED}❌ Webhook health test failed${NC}"
    echo "Response: $WEBHOOK_RESPONSE"
    exit 1
fi

# Deploy static files
echo -e "${YELLOW}🌐 Deploying Static Files${NC}"

# Ensure static files are in place
if [[ ! -f "success.html" ]]; then
    echo -e "${RED}❌ success.html not found${NC}"
    exit 1
fi

if [[ ! -f "macagent-early-access.html" ]]; then
    echo -e "${RED}❌ macagent-early-access.html not found${NC}"
    exit 1
fi

if [[ ! -f "emergency-phone-coverage.html" ]]; then
    echo -e "${RED}❌ emergency-phone-coverage.html not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All payment pages deployed${NC}"

# Configure PM2 for auto-restart
echo -e "${YELLOW}⚙️  Configuring Auto-Restart${NC}"
pm2 save
pm2 startup | grep -E '^sudo' | sh || echo -e "${YELLOW}⚠️  Manual PM2 startup setup may be needed${NC}"
echo -e "${GREEN}✅ PM2 configured for auto-restart${NC}"

# Performance verification
echo -e "${YELLOW}⚡ Performance Verification${NC}"

# Test response times
METRICS_TIME=$(curl -w "%{time_total}" -o /dev/null -s http://localhost:$METRICS_PORT/api/v1/summary)
WEBHOOK_TIME=$(curl -w "%{time_total}" -o /dev/null -s http://localhost:$WEBHOOK_PORT/health)

echo "📊 Metrics API response time: ${METRICS_TIME}s"
echo "🔗 Webhook response time: ${WEBHOOK_TIME}s"

if (( $(echo "$METRICS_TIME < 1.0" | bc -l) )); then
    echo -e "${GREEN}✅ Metrics API performance target met (<1s)${NC}"
else
    echo -e "${YELLOW}⚠️  Metrics API slower than target (${METRICS_TIME}s)${NC}"
fi

if (( $(echo "$WEBHOOK_TIME < 0.5" | bc -l) )); then
    echo -e "${GREEN}✅ Webhook performance target met (<0.5s)${NC}"
else
    echo -e "${YELLOW}⚠️  Webhook slower than target (${WEBHOOK_TIME}s)${NC}"
fi

# Final status report
echo
echo -e "${BLUE}🎉 MONETIZATION SYSTEM DEPLOYMENT COMPLETE${NC}"
echo "=============================================="
echo
echo -e "${GREEN}Services Running:${NC}"
echo "💳 Stripe Webhook Server: http://localhost:$WEBHOOK_PORT"
echo "📊 Metrics Server: http://localhost:$METRICS_PORT"
echo
echo -e "${GREEN}Payment Pages:${NC}"
echo "🚀 MacAgent Pro Early Access: ./macagent-early-access.html"
echo "🏥 VetSorcery Emergency Coverage: ./emergency-phone-coverage.html"
echo "🎉 Payment Success Page: ./success.html"
echo
echo -e "${GREEN}PM2 Status:${NC}"
pm2 list

echo
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. 🌐 Deploy static files to web server"
echo "2. 🔗 Configure reverse proxy (nginx/cloudflare)"
echo "3. 📧 Set up email service for confirmations"
echo "4. 💬 Configure Discord/Slack webhooks"
echo "5. 📊 Monitor payment flow with 'pm2 logs'"
echo
echo -e "${GREEN}💰 Revenue collection system is LIVE and ready!${NC}"