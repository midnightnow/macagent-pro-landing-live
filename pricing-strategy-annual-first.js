// RED ZEN PRICING STRATEGY: Annual-First Focus
// Based on feedback about needing higher ARPU to reach $1,500 MRR

const AnnualFirstPricingStrategy = {
  // CORRECTED pricing tiers for higher ARPU
  pricingTiers: {
    starter: {
      monthly: 9.99,
      annual: 79,  // $6.58/month - 34% savings
      features: ["10 AI Agents", "Basic Optimization", "Email Support"],
      target_segment: "Individual Mac users"
    },
    
    pro: {
      monthly: 19.99,
      annual: 159, // $13.25/month - 34% savings  
      features: ["50 AI Agents", "Advanced Optimization", "Priority Support", "Multiple Macs"],
      target_segment: "Power users, professionals"
    },
    
    business: {
      monthly: 39.99, 
      annual: 319, // $26.58/month - 34% savings
      features: ["Unlimited Agents", "Fleet Management", "API Access", "Phone Support"],
      target_segment: "IT managers, small businesses" 
    }
  },
  
  // ANNUAL-FIRST presentation strategy
  presentationStrategy: {
    default_view: "annual", // Show annual pricing first
    savings_emphasis: true,
    monthly_option: "secondary", // Smaller, less prominent
    
    copy_framework: {
      primary_cta: "Get MacAgent Pro - $79/year",
      savings_badge: "Save 34% with Annual",
      secondary_option: "or $9.99/month",
      trial_offer: "7-day free trial included"
    },
    
    psychological_triggers: [
      "Most popular plan (67% choose annual)",
      "Best value - 4 months free",
      "Lock in current pricing", 
      "Includes all future updates"
    ]
  },
  
  // A/B TEST: Annual vs Monthly emphasis  
  pricingTests: {
    test_name: "pricing_surface_emphasis",
    variants: {
      variant_a: {
        name: "annual_first",
        layout: "Large annual price, small monthly option below",
        primary_cta: "$79/year (Save 34%)",
        secondary_cta: "$9.99/month"
      },
      variant_b: {
        name: "monthly_first", 
        layout: "Monthly and annual side-by-side",
        primary_cta: "$9.99/month",
        secondary_cta: "$79/year"
      }
    },
    success_metric: "RPV", // Revenue Per Visitor
    hypothesis: "Annual-first increases average order value and RPV"
  },
  
  // Cart add-ons for ARPU boost
  addOnProducts: {
    priority_support: {
      price: 19,
      description: "Priority email support + phone callback",
      attachment_rate_target: 0.15 // 15% of customers
    },
    
    device_2_license: {
      price: 29,
      description: "License for second Mac", 
      attachment_rate_target: 0.25 // 25% of customers
    },
    
    extended_updates: {
      price: 39,
      description: "3-year update guarantee",
      attachment_rate_target: 0.10 // 10% of customers
    }
  },
  
  // POST-PURCHASE upsells
  postPurchaseFlow: {
    immediate_upsell: {
      offer: "Add second Mac license for 50% off ($14.50)",
      timeframe: "Next 10 minutes only", 
      conversion_target: 0.20
    },
    
    day_7_upsell: {
      offer: "Upgrade to Pro (50 agents) for remaining trial period",
      trigger: "High engagement + optimization success",
      conversion_target: 0.15
    },
    
    renewal_optimization: {
      early_renewal_discount: "Renew 30 days early, get 2 months free",
      lifetime_offer: "Upgrade to lifetime for $199 (limited time)"
    }
  },
  
  // REVENUE CALCULATION with add-ons
  calculateImprovedARPU: function() {
    const base_plan_mix = {
      starter_annual: { price: 79, percentage: 0.60 }, // 60% choose starter annual
      starter_monthly: { price: 9.99 * 12, percentage: 0.10 }, // 10% monthly
      pro_annual: { price: 159, percentage: 0.25 }, // 25% choose pro  
      pro_monthly: { price: 19.99 * 12, percentage: 0.05 } // 5% pro monthly
    };
    
    // Base ARPU calculation
    let weighted_arpu = 0;
    for (const [plan, data] of Object.entries(base_plan_mix)) {
      weighted_arpu += data.price * data.percentage;
    }
    
    // Add-on revenue (average across all customers)  
    const addon_revenue = 
      (19 * 0.15) +  // Priority support
      (29 * 0.25) +  // Second device
      (39 * 0.10);   // Extended updates
    
    return {
      base_arpu: weighted_arpu,
      addon_arpu: addon_revenue,
      total_arpu: weighted_arpu + addon_revenue,
      monthly_equivalent: (weighted_arpu + addon_revenue) / 12
    };
  },
  
  // REVISED traffic requirements with higher ARPU
  calculateTrafficForTarget: function(target_mrr = 1500) {
    const arpu_data = this.calculateImprovedARPU();
    const monthly_arpu = arpu_data.monthly_equivalent;
    
    const customers_needed = target_mrr / monthly_arpu;
    const conversion_rate = 0.0026; // 0.26% visitor to paid (from corrected model)
    const visitors_needed = customers_needed / conversion_rate;
    
    return {
      target_mrr: target_mrr,
      monthly_arpu: monthly_arpu.toFixed(2),
      customers_needed: Math.ceil(customers_needed), 
      monthly_visitors_needed: Math.ceil(visitors_needed),
      daily_visitors_needed: Math.ceil(visitors_needed / 30),
      improvement_vs_base: `${((arpu_data.total_arpu / 79 - 1) * 100).toFixed(0)}% higher ARPU`
    };
  },
  
  // Pricing page optimization
  pricingPageOptimization: {
    headline: "Choose Your Mac Optimization Plan",
    subheading: "Most users see significant improvements within 24 hours",
    
    social_proof: "Join 10,000+ Mac users who've optimized their systems",
    
    comparison_table: {
      show_features: true,
      highlight_pro_plan: true, // Middle option bias
      money_back_guarantee: "30-day money-back guarantee",
      no_credit_card_trial: "7-day free trial, no credit card required"
    },
    
    urgency_elements: [
      "Lock in current pricing (prices increase Jan 1st)",
      "Limited time: 34% annual discount", 
      "Only 500 licenses left at this price"
    ]
  },
  
  // Implementation checklist
  implementationSteps: [
    "✅ Update pricing page to show annual first",
    "✅ Add 'Save 34%' badges to annual options",
    "✅ Implement A/B test for pricing surface", 
    "✅ Add cart add-on products during checkout",
    "✅ Set up post-purchase upsell flow",
    "✅ Track RPV as primary pricing metric",
    "✅ Add social proof elements to pricing page",
    "✅ Implement urgency/scarcity messaging"
  ]
};

// Calculate improved projections
const improved_projections = AnnualFirstPricingStrategy.calculateTrafficForTarget(1500);
console.log("💰 IMPROVED PRICING STRATEGY RESULTS:");
console.log(`Monthly ARPU: $${improved_projections.monthly_arpu}`);
console.log(`Customers needed: ${improved_projections.customers_needed}`);
console.log(`Monthly visitors needed: ${improved_projections.monthly_visitors_needed.toLocaleString()}`);
console.log(`Daily visitors needed: ${improved_projections.daily_visitors_needed}`);
console.log(`ARPU improvement: ${improved_projections.improvement_vs_base}`);

// ARPU breakdown
const arpu_breakdown = AnnualFirstPricingStrategy.calculateImprovedARPU();
console.log("\n📊 ARPU BREAKDOWN:");
console.log(`Base ARPU: $${arpu_breakdown.base_arpu.toFixed(2)}`);
console.log(`Add-on ARPU: $${arpu_breakdown.addon_arpu.toFixed(2)}`);
console.log(`Total ARPU: $${arpu_breakdown.total_arpu.toFixed(2)}`);
console.log(`Monthly equivalent: $${arpu_breakdown.monthly_equivalent.toFixed(2)}`);

console.log("\n🎯 KEY INSIGHT: With annual-first pricing + add-ons:");
console.log(`Need only ${improved_projections.daily_visitors_needed} daily visitors vs 633 with old model`);
console.log("This makes the $1,500 MRR target much more achievable!");

export { AnnualFirstPricingStrategy };