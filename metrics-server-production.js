#!/usr/bin/env node

/**
 * MacAgent Pro - Production Metrics Server
 * Serves real-time metrics via WebSocket and REST API
 */

const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 8080;
const server = require('http').createServer(app);

// Configure CORS for MacAgent domains
app.use(cors({
  origin: [
    'https://macagent.pro',
    'https://legend.macagent.pro', 
    'https://metrics.macagent.pro',
    'http://localhost:3000',
    'http://localhost:8081',
    'http://localhost:8082'
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 20, // 20 requests per second per IP
  message: { error: 'Rate limit exceeded' }
});
app.use('/api/', limiter);

// Middleware
app.use(express.json());

// WebSocket Server
const wss = new WebSocket.Server({ server });

// Simulated metrics state
let metrics = {
  totalInstalls: 1247,
  activeInstances: 1156,
  p95Latency: 187,
  p99Latency: 245,
  reliability: 99.94,
  countries: 34,
  installsPerHour: 47,
  hwEvents: 12400,
  avgTemp: 42,
  lastUpdate: Date.now()
};

// Update metrics periodically (simulate real data)
setInterval(() => {
  metrics.totalInstalls += Math.floor(Math.random() * 3);
  metrics.activeInstances = Math.max(0, metrics.totalInstalls - Math.floor(Math.random() * 100));
  metrics.p95Latency = 180 + Math.random() * 20;
  metrics.p99Latency = metrics.p95Latency + 40 + Math.random() * 30;
  metrics.reliability = 99.90 + Math.random() * 0.08;
  metrics.installsPerHour = 40 + Math.floor(Math.random() * 20);
  metrics.hwEvents += Math.floor(Math.random() * 100) + 50;
  metrics.avgTemp = 38 + Math.random() * 8;
  metrics.lastUpdate = Date.now();
  
  // Check for milestones
  checkMilestones();
}, 5000);

// Milestone tracking
const milestones = [
  { id: '2500_installs', threshold: 2500, message: 'Movement reaches critical mass', triggered: false },
  { id: '5000_installs', threshold: 5000, message: 'Global recognition achieved', triggered: false },
  { id: '10000_installs', threshold: 10000, message: 'Industry disruption confirmed', triggered: false },
  { id: '25000_installs', threshold: 25000, message: 'New standard established', triggered: false }
];

function checkMilestones() {
  milestones.forEach(milestone => {
    if (!milestone.triggered && metrics.totalInstalls >= milestone.threshold) {
      milestone.triggered = true;
      
      // Broadcast milestone to all WebSocket clients
      const milestoneEvent = {
        type: 'milestone',
        data: {
          id: milestone.id,
          message: milestone.message,
          installs: metrics.totalInstalls,
          p95: metrics.p95Latency,
          reliability: metrics.reliability,
          timestamp: Date.now()
        }
      };
      
      broadcast(milestoneEvent);
      console.log(`🏆 Milestone achieved: ${milestone.message} (${metrics.totalInstalls} installs)`);
    }
  });
}

// Broadcast to all WebSocket clients
function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log(`[WebSocket] New connection from ${req.socket.remoteAddress}`);
  
  // Send initial state
  ws.send(JSON.stringify({
    type: 'full_update',
    data: metrics
  }));
  
  // Handle client disconnect
  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('[WebSocket] Client error:', error.message);
  });
});

// Broadcast heartbeat to all clients
setInterval(() => {
  broadcast({
    type: 'heartbeat',
    data: {
      activeInstances: metrics.activeInstances,
      p95Latency: metrics.p95Latency,
      installsPerHour: metrics.installsPerHour,
      timestamp: Date.now()
    }
  });
}, 3000);

// REST API Endpoints

// Health check
app.get('/healthz', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: wss.clients.size
  });
});

// Liveness probe
app.get('/livez', (req, res) => {
  const isHealthy = (Date.now() - metrics.lastUpdate) < 30000;
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'live' : 'degraded',
    lastUpdate: metrics.lastUpdate,
    wsConnections: wss.clients.size
  });
});

// Main metrics summary endpoint
app.get('/api/v1/summary', (req, res) => {
  res.json({
    globalInstalls: {
      allTime: metrics.totalInstalls
    },
    activeInstances: metrics.activeInstances,
    latencyP95: metrics.p95Latency,
    latencyP99: metrics.p99Latency,
    reliability: metrics.reliability,
    countries: metrics.countries,
    momentum: {
      installsPerHour: metrics.installsPerHour
    },
    hardwareConsciousness: {
      events: metrics.hwEvents,
      avgTemp: metrics.avgTemp
    },
    timestamp: metrics.lastUpdate
  });
});

// Historical metrics (mock endpoint)
app.get('/api/v1/history', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const points = Math.min(hours, 168); // Max 1 week
  
  const history = [];
  const now = Date.now();
  
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = now - (i * 3600000); // 1 hour intervals
    history.push({
      timestamp,
      installs: Math.max(0, metrics.totalInstalls - (i * 10) + Math.floor(Math.random() * 20)),
      p95Latency: 180 + Math.random() * 30,
      reliability: 99.80 + Math.random() * 0.20
    });
  }
  
  res.json({ data: history });
});

// Individual install event (for testing)
app.post('/api/v1/install', (req, res) => {
  const { country, version, platform } = req.body;
  
  metrics.totalInstalls++;
  metrics.lastUpdate = Date.now();
  
  // Broadcast new install event
  broadcast({
    type: 'new_install',
    data: {
      globalInstalls: metrics.totalInstalls,
      country: country || 'Unknown',
      version: version || '1.0.2',
      platform: platform || 'macOS',
      timestamp: Date.now()
    }
  });
  
  console.log(`📦 New install reported: ${country || 'Unknown'} (Total: ${metrics.totalInstalls})`);
  res.json({ success: true, totalInstalls: metrics.totalInstalls });
});

// War Room dashboard endpoints
const revenueCounters = {
  early_access: { count: 0, amount_cents: 0 },
  vetsorcery: { count: 0, amount_cents: 0 },
  gallery: { count: 0, amount_cents: 0 }
};

const webhookCounters = {
  checkout_completed: 0,
  invoice_paid: 0,
  subscription_created: 0
};

// Simulate revenue for demo
setInterval(() => {
  if (Math.random() > 0.85) {
    revenueCounters.early_access.count++;
    revenueCounters.early_access.amount_cents += 29700;
    webhookCounters.checkout_completed++;
  }
  if (Math.random() > 0.90) {
    revenueCounters.vetsorcery.count++;
    revenueCounters.vetsorcery.amount_cents += 49700;
    webhookCounters.subscription_created++;
  }
  if (Math.random() > 0.75) {
    revenueCounters.gallery.count++;
    revenueCounters.gallery.amount_cents += 999;
  }
}, 10000);

app.get('/war-room', (req, res) => {
  res.sendFile(__dirname + '/launch-war-room.html');
});

app.get('/api/v1/public-totals', (req, res) => {
  res.json({
    generated_at: new Date().toISOString(),
    ...revenueCounters
  });
});

app.get('/api/v1/webhook-counters', (req, res) => {
  res.json(webhookCounters);
});

// Error handling
app.use((error, req, res, next) => {
  console.error('[API Error]:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// War Room dashboard endpoint
app.get('/war-room', (req, res) => {
  res.sendFile(__dirname + '/launch-war-room.html');
});

app.get('/api/v1/webhook-counters', (req, res) => {
  res.json(webhookCounters);
});

// Start server
server.listen(PORT, () => {
  console.log(`🏛️ MacAgent Pro Metrics Server`);
  console.log(`📊 REST API: http://localhost:${PORT}/api/v1/summary`);
  console.log(`🔗 WebSocket: ws://localhost:${PORT}/`);
  console.log(`💚 Health check: http://localhost:${PORT}/healthz`);
  console.log(`🚀 War Room: http://localhost:${PORT}/war-room`);
  console.log(`⚡ Ready for legendary metrics!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Shutting down metrics server...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

module.exports = { app, server, wss };