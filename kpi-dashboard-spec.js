// RED ZEN KPI DASHBOARD - Single Screen Truth
// North Star: Revenue Per Visitor (RPV)
// Supporting metrics with proper alert thresholds

const MacAgentKPIDashboard = {
  // PRIMARY METRICS (Top of dashboard)
  northStar: {
    metric: "Revenue Per Visitor (RPV)",
    current: 0.0,
    target: 0.40,
    benchmark: "$0.40 = Good SaaS performance",
    calculation: "total_revenue / total_visitors",
    alert_threshold: 0.20 // Alert if RPV drops below $0.20
  },
  
  // FUNNEL METRICS (Main dashboard body)
  funnelMetrics: [
    {
      name: "Traffic",
      current: 0,
      target: 19000, // Monthly visitors needed for $1,500 MRR (corrected math)
      daily_target: 633,
      sources: ["google_ads", "organic", "product_hunt", "referral"],
      alert_threshold: 400 // Alert if daily traffic < 400
    },
    {
      name: "Email Capture Rate", 
      current: 0.0,
      target: 0.35, // 35% target (aggressive but achievable)
      calculation: "email_signups / total_visitors",
      alert_threshold: 0.20 // Critical metric - alert if < 20%
    },
    {
      name: "Trial Start Rate",
      current: 0.0, 
      target: 0.30, // 30% of emails start trial
      calculation: "trial_starts / email_signups",
      alert_threshold: 0.25 // Alert if < 25%
    },
    {
      name: "First Run Completion",
      current: 0.0,
      target: 0.80, // 80% complete first run
      calculation: "first_run_completed / trial_starts", 
      alert_threshold: 0.60 // Critical for activation
    },
    {
      name: "3 Key Actions",
      current: 0.0,
      target: 0.65, // 65% complete onboarding
      calculation: "completed_onboarding / first_run_completed",
      alert_threshold: 0.50
    },
    {
      name: "Upgrade Starts",
      current: 0.0,
      target: 0.15, // 15% start upgrade process
      calculation: "upgrade_attempts / completed_onboarding",
      alert_threshold: 0.10
    },
    {
      name: "Paid Conversions",
      current: 0.0,
      target: 0.70, // 70% of upgrade attempts complete
      calculation: "paid_customers / upgrade_attempts",
      alert_threshold: 0.50
    },
    {
      name: "7-Day Retention",
      current: 0.0,
      target: 0.85, // 85% return within 7 days
      calculation: "active_day_7 / paid_customers",
      alert_threshold: 0.70
    }
  ],
  
  // GA4 EVENT CONFIGURATION
  ga4Events: {
    core_events: [
      {
        event: "page_view",
        parameters: ["page_location", "ab_test_variant", "traffic_source", "pricing_shown"]
      },
      {
        event: "view_item", // Landing page viewed
        parameters: ["item_id", "item_name", "ab_test_variant"]
      },
      {
        event: "generate_lead", // Email captured
        parameters: ["lead_source", "ab_test_variant", "form_location"],
        value: 5.00
      },
      {
        event: "start_trial", // Trial activated
        parameters: ["trial_type", "acquisition_source"],
        value: 25.00
      },
      {
        event: "first_run", // App first launched
        parameters: ["platform", "install_source"]
      },
      {
        event: "agent_run", // First optimization completed
        parameters: ["agent_count", "optimization_type"]
      },
      {
        event: "optimize_now_click", // Key engagement action
        parameters: ["location", "agent_suggestions"]
      },
      {
        event: "share_score", // Viral action
        parameters: ["score", "share_method", "platform"]
      },
      {
        event: "begin_checkout", // Upgrade started
        parameters: ["pricing_tier", "discount_applied"],
        value: 79.00
      },
      {
        event: "purchase", // Paid conversion
        parameters: ["plan_type", "amount", "currency"],
        value: 79.00
      },
      {
        event: "subscription_renew", // Retention indicator
        parameters: ["plan_type", "renewal_number"]
      },
      {
        event: "churn", // Cancellation
        parameters: ["reason", "tenure_days", "ltv"]
      }
    ],
    
    // CUSTOM DIMENSIONS (for segmentation)
    customDimensions: [
      { name: "ab_test_variant", scope: "session" },
      { name: "traffic_bucket", scope: "user" },
      { name: "pricing_shown", scope: "session" }, 
      { name: "agent_count_bucket", scope: "user" },
      { name: "mac_model", scope: "user" },
      { name: "first_visit_source", scope: "user" },
      { name: "trial_completion_rate", scope: "user" }
    ]
  },
  
  // REAL-TIME ALERTS
  alertConfig: [
    {
      name: "Landing Page Conversion Drop",
      condition: "email_capture_rate < 0.20",
      severity: "CRITICAL",
      action: "Pause ads, check site"
    },
    {
      name: "High Cost Per Acquisition", 
      condition: "cpa > 25",
      severity: "HIGH",
      action: "Review ad targeting"
    },
    {
      name: "Trial Start Rate Drop",
      condition: "trial_start_rate < 0.25", 
      severity: "HIGH",
      action: "Check email sequence"
    },
    {
      name: "First Run Failure",
      condition: "first_run_completion < 0.60",
      severity: "CRITICAL", 
      action: "Check app bugs"
    },
    {
      name: "Churn Spike",
      condition: "churn_rate > 0.10",
      severity: "HIGH",
      action: "Investigate user feedback"
    }
  ],
  
  // A/B TEST TRACKING
  experimentTracking: {
    active_tests: [
      {
        name: "headline_rpv_test",
        variants: ["control", "h1a_toned", "h1b_value"],
        primary_metric: "rpv",
        sample_size_per_variant: 329,
        duration_days: 14,
        statistical_significance: 0.95
      },
      {
        name: "lead_magnet_test", 
        variants: ["email_gate", "scan_first"],
        primary_metric: "trial_start_rate",
        sample_size_per_variant: 163,
        duration_days: 14
      }
    ],
    
    test_assignment_tracking: {
      storage: "server_side", // RED ZEN FIX: Not localStorage
      assignment_endpoint: "/api/experiments/assign",
      exposure_logging: true,
      srm_monitoring: true // Sample Ratio Mismatch detection
    }
  },
  
  // BIGQUERY SCHEMA (for advanced analysis)
  bigQuerySchema: {
    events_table: "macagent_pro.events_*", 
    daily_aggregates: "macagent_pro.daily_metrics",
    funnel_analysis: `
      WITH funnel AS (
        SELECT 
          traffic_source,
          ab_test_variant,
          COUNT(DISTINCT user_id) as visitors,
          COUNT(DISTINCT CASE WHEN event_name = 'generate_lead' THEN user_id END) as emails,
          COUNT(DISTINCT CASE WHEN event_name = 'start_trial' THEN user_id END) as trials,
          COUNT(DISTINCT CASE WHEN event_name = 'first_run' THEN user_id END) as first_runs,
          COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN user_id END) as paid,
          SUM(CASE WHEN event_name = 'purchase' THEN ecommerce.purchase_revenue END) as revenue
        FROM events_*
        WHERE _TABLE_SUFFIX = FORMAT_DATE('%Y%m%d', CURRENT_DATE())
        GROUP BY traffic_source, ab_test_variant
      )
      SELECT *,
        emails / visitors as email_rate,
        trials / emails as trial_rate, 
        first_runs / trials as activation_rate,
        paid / visitors as conversion_rate,
        revenue / visitors as rpv
      FROM funnel
    `
  },
  
  // DASHBOARD LAYOUT SPEC
  dashboardLayout: {
    header: {
      title: "MacAgent Pro - Growth Dashboard",
      refresh_rate: "Real-time",
      last_updated: "timestamp",
      status_indicators: ["🟢 Healthy", "🟡 Warning", "🔴 Critical"]
    },
    
    top_row: {
      primary_kpi: "RPV - $0.00 (Target: $0.40)",
      supporting_kpis: [
        "Daily Visitors: 0 (Target: 633)",
        "Email Rate: 0% (Target: 35%)", 
        "Paid Conv: 0% (Target: 0.26%)",
        "MRR: $0 (Target: $1,500)"
      ]
    },
    
    main_section: {
      funnel_chart: "Visual conversion funnel with drop-off rates",
      traffic_sources: "Pie chart with source breakdown", 
      ab_tests: "Current experiments with statistical significance",
      alerts: "Active alerts and recommendations"
    },
    
    bottom_section: {
      hourly_trends: "Traffic and conversions by hour",
      cohort_analysis: "User behavior by acquisition date",
      revenue_projection: "Path to $1,500 MRR target"
    }
  }
};

// DASHBOARD IMPLEMENTATION FUNCTIONS
function calculateRPV(totalRevenue, totalVisitors) {
  return totalVisitors > 0 ? (totalRevenue / totalVisitors) : 0;
}

function checkAlerts(metrics) {
  const alerts = [];
  
  // Email capture rate alert
  if (metrics.email_capture_rate < 0.20) {
    alerts.push({
      severity: "CRITICAL",
      message: `Email capture rate at ${(metrics.email_capture_rate * 100).toFixed(1)}% (below 20% threshold)`,
      action: "Check landing page, pause ads if needed"
    });
  }
  
  // CPA alert
  if (metrics.cost_per_acquisition > 25) {
    alerts.push({
      severity: "HIGH", 
      message: `CPA at $${metrics.cost_per_acquisition.toFixed(2)} (above $25 threshold)`,
      action: "Review ad targeting and landing page conversion"
    });
  }
  
  return alerts;
}

function generateDashboardURL() {
  // Looker Studio dashboard URL would go here
  return "https://lookerstudio.google.com/reporting/macagent-pro-dashboard";
}

// Export configuration
if (typeof module !== 'undefined') {
  module.exports = MacAgentKPIDashboard;
}

console.log("📊 KPI DASHBOARD SPECIFICATION READY:");
console.log("✅ North Star: Revenue Per Visitor (RPV)");
console.log("✅ GA4 events mapped to funnel stages");
console.log("✅ Alert thresholds set for critical metrics");
console.log("✅ A/B test tracking with proper sample sizes");
console.log("✅ BigQuery schema for advanced analysis");
console.log("\n🎯 Next: Implement in Looker Studio or Mixpanel");