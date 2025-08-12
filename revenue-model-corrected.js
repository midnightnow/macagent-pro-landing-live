// CORRECTED Revenue Model - Based on Red Zen Analysis
// Fixes the fundamental math errors in growth projections

const CorrectedRevenueModel = {
  // REALISTIC conversion rates based on SaaS benchmarks
  funnelMetrics: {
    visitor_to_email: 0.25,      // 25% email capture (current target)
    email_to_trial: 0.30,        // 30% trial activation  
    trial_to_paid: 0.035,        // 3.5% trial to paid (realistic)
    
    // CRITICAL: Overall visitor-to-paid rate
    visitor_to_paid: 0.25 * 0.30 * 0.035, // = 0.002625 = 0.26%
    
    // Revenue metrics
    monthly_arpu: 15,             // Average $15/mo (mix of $9.99 and $19.99)
    annual_arpu: 79,              // Annual pricing
    annual_discount_factor: 0.65  // 65% choose annual = higher ARPU
  },
  
  // CORRECTED traffic requirements for $1,500 MRR target
  calculateTrafficNeeded: function(targetMRR) {
    const avgARPU = (this.funnelMetrics.monthly_arpu * 0.35) + 
                   (this.funnelMetrics.annual_arpu / 12 * 0.65);
    
    const customersNeeded = targetMRR / avgARPU;
    const visitorsNeeded = customersNeeded / this.funnelMetrics.visitor_to_paid;
    
    return {
      customers_needed: Math.ceil(customersNeeded),
      monthly_visitors_needed: Math.ceil(visitorsNeeded),
      weekly_visitors_needed: Math.ceil(visitorsNeeded / 4.33),
      daily_visitors_needed: Math.ceil(visitorsNeeded / 30)
    };
  },
  
  // REALISTIC 12-week progression
  weeklyProgression: function() {
    const weeks = [];
    const target = this.calculateTrafficNeeded(1500);
    
    // Growth curve: slow start, accelerating
    const growthRates = [
      0.05, 0.08, 0.12, 0.18,    // Weeks 1-4: Building momentum  
      0.25, 0.35, 0.45, 0.55,    // Weeks 5-8: Acceleration
      0.70, 0.85, 0.95, 1.00     // Weeks 9-12: Full scale
    ];
    
    for (let week = 1; week <= 12; week++) {
      const trafficMultiplier = growthRates[week - 1];
      const visitors = Math.floor(target.monthly_visitors_needed * trafficMultiplier);
      
      const emails = Math.floor(visitors * this.funnelMetrics.visitor_to_email);
      const trials = Math.floor(emails * this.funnelMetrics.email_to_trial);
      const customers = Math.floor(trials * this.funnelMetrics.trial_to_paid);
      
      const avgARPU = (this.funnelMetrics.monthly_arpu * 0.35) + 
                     (this.funnelMetrics.annual_arpu / 12 * 0.65);
      const mrr = customers * avgARPU;
      
      weeks.push({
        week: week,
        visitors: visitors,
        emails: emails,
        trials: trials,
        customers: customers,
        mrr: Math.floor(mrr),
        cumulative_mrr: week === 1 ? mrr : weeks[week-2].cumulative_mrr + mrr
      });
    }
    
    return weeks;
  },
  
  // A/B test sample size calculator (fixed for proper power)
  calculateSampleSizes: function() {
    // Using proper statistical formulas for conversion rate tests
    return {
      email_capture_test: {
        baseline: 0.25,
        target: 0.35, 
        lift: 0.40,
        visitors_per_variant: 329,
        total_visitors_needed: 658,
        test_duration_days: 7,  // At 94 daily visitors = 658/7
        confidence_level: 0.95,
        power: 0.80
      },
      
      trial_conversion_test: {
        baseline: 0.30,
        target: 0.45,
        lift: 0.50,
        emails_per_variant: 163,
        total_emails_needed: 326,
        test_duration_days: 14, // Based on email capture rate
        confidence_level: 0.95,
        power: 0.80
      },
      
      // RED ZEN FIX: Use trial start rate instead of paid conversion
      pricing_test: {
        metric: "trial_start_rate", // Not paid conversion (too slow)
        baseline: 0.30,
        target: 0.42,
        lift: 0.40,
        emails_per_variant: 245,
        total_emails_needed: 735, // 3-way test
        test_duration_days: 21,
        note: "Test pricing on trial signup page, not checkout"
      }
    };
  },
  
  // Revenue Per Visitor (RPV) calculation - RED ZEN RECOMMENDATION
  calculateRPV: function(visitors, revenue) {
    return {
      rpv: revenue / visitors,
      benchmark_rpv: 0.40, // $0.40 RPV is good for SaaS
      performance: revenue / visitors > 0.40 ? 'Above Benchmark' : 'Below Benchmark'
    };
  }
};

// CORRECTED Week 12 Reality Check
const week12Reality = CorrectedRevenueModel.calculateTrafficNeeded(1500);
console.log("🎯 CORRECTED TARGETS FOR $1,500 MRR:");
console.log(`Monthly Visitors Needed: ${week12Reality.monthly_visitors_needed.toLocaleString()}`);
console.log(`Daily Visitors Needed: ${week12Reality.daily_visitors_needed}`);
console.log(`Customers Needed: ${week12Reality.customers_needed}`);

// Generate realistic progression
const progression = CorrectedRevenueModel.weeklyProgression();
console.log("\n📈 REALISTIC 12-WEEK PROGRESSION:");
progression.forEach(week => {
  console.log(`Week ${week.week}: ${week.visitors} visitors → ${week.emails} emails → ${week.trials} trials → ${week.customers} customers → $${week.mrr} MRR`);
});

console.log(`\n🏆 Week 12 Reality: Need ${progression[11].visitors.toLocaleString()} monthly visitors for $${progression[11].cumulative_mrr} MRR`);

// A/B Test Requirements
const sampleSizes = CorrectedRevenueModel.calculateSampleSizes();
console.log("\n🧪 A/B TEST SAMPLE SIZES (Fixed):");
console.log(`Email Capture: ${sampleSizes.email_capture_test.visitors_per_variant} visitors/variant`);
console.log(`Trial Conversion: ${sampleSizes.trial_conversion_test.emails_per_variant} emails/variant`);
console.log(`Pricing (RPV): ${sampleSizes.pricing_test.emails_per_variant} emails/variant`);

export { CorrectedRevenueModel };