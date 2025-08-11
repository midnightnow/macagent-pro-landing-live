#!/usr/bin/env python3
"""
MacAgent Pro - Realistic Revenue Projections
Based on SaaS pricing model: $10/$20/$30 monthly subscriptions
"""

import json
from datetime import datetime, timedelta

class RealisticRevenueModel:
    def __init__(self):
        self.pricing = {
            'starter': {'monthly': 10, 'annual': 100},
            'pro': {'monthly': 20, 'annual': 200},
            'enterprise': {'monthly': 30, 'annual': 300}
        }
        
        # Realistic conversion funnel
        self.funnel = {
            'landing_page_visitors': 10000,  # Monthly traffic target
            'trial_conversion_rate': 0.08,   # 8% start trial
            'trial_completion_rate': 0.45,   # 45% complete 14-day trial
            'trial_to_paid_rate': 0.25,      # 25% convert to paid
            'churn_rate_monthly': 0.05       # 5% monthly churn
        }
        
        # Customer mix (realistic for developer tools)
        self.customer_mix = {
            'starter': 0.60,    # 60% choose $10 plan
            'pro': 0.35,        # 35% choose $20 plan  
            'enterprise': 0.05  # 5% choose $30 plan
        }
        
    def calculate_monthly_metrics(self, month=1):
        """Calculate metrics for a specific month"""
        visitors = self.funnel['landing_page_visitors']
        trial_signups = int(visitors * self.funnel['trial_conversion_rate'])
        trial_completions = int(trial_signups * self.funnel['trial_completion_rate'])
        new_paid_customers = int(trial_completions * self.funnel['trial_to_paid_rate'])
        
        # Customer breakdown
        starter_customers = int(new_paid_customers * self.customer_mix['starter'])
        pro_customers = int(new_paid_customers * self.customer_mix['pro'])
        enterprise_customers = int(new_paid_customers * self.customer_mix['enterprise'])
        
        # Monthly revenue from new customers
        monthly_revenue = (
            starter_customers * self.pricing['starter']['monthly'] +
            pro_customers * self.pricing['pro']['monthly'] +
            enterprise_customers * self.pricing['enterprise']['monthly']
        )
        
        return {
            'month': month,
            'visitors': visitors,
            'trial_signups': trial_signups,
            'trial_completions': trial_completions,
            'new_paid_customers': new_paid_customers,
            'customer_breakdown': {
                'starter': starter_customers,
                'pro': pro_customers,
                'enterprise': enterprise_customers
            },
            'new_monthly_revenue': monthly_revenue
        }
    
    def project_12_months(self):
        """Project revenue growth over 12 months"""
        results = []
        total_customers = {'starter': 0, 'pro': 0, 'enterprise': 0}
        cumulative_revenue = 0
        
        for month in range(1, 13):
            monthly_data = self.calculate_monthly_metrics(month)
            
            # Add new customers to totals
            total_customers['starter'] += monthly_data['customer_breakdown']['starter']
            total_customers['pro'] += monthly_data['customer_breakdown']['pro'] 
            total_customers['enterprise'] += monthly_data['customer_breakdown']['enterprise']
            
            # Account for churn
            churn_starter = int(total_customers['starter'] * self.funnel['churn_rate_monthly'])
            churn_pro = int(total_customers['pro'] * self.funnel['churn_rate_monthly'])
            churn_enterprise = int(total_customers['enterprise'] * self.funnel['churn_rate_monthly'])
            
            total_customers['starter'] = max(0, total_customers['starter'] - churn_starter)
            total_customers['pro'] = max(0, total_customers['pro'] - churn_pro)
            total_customers['enterprise'] = max(0, total_customers['enterprise'] - churn_enterprise)
            
            # Calculate total monthly recurring revenue
            mrr = (
                total_customers['starter'] * self.pricing['starter']['monthly'] +
                total_customers['pro'] * self.pricing['pro']['monthly'] +
                total_customers['enterprise'] * self.pricing['enterprise']['monthly']
            )
            
            cumulative_revenue += mrr
            
            results.append({
                'month': month,
                'new_customers': monthly_data['new_paid_customers'],
                'total_customers': sum(total_customers.values()),
                'customer_breakdown': total_customers.copy(),
                'mrr': mrr,
                'cumulative_revenue': cumulative_revenue,
                'trial_metrics': {
                    'signups': monthly_data['trial_signups'],
                    'completions': monthly_data['trial_completions']
                }
            })
        
        return results
    
    def calculate_improvement_scenarios(self):
        """Show impact of installation/conversion improvements"""
        scenarios = {
            'baseline': {'trial_rate': 0.08, 'completion_rate': 0.45, 'paid_rate': 0.25},
            'improved_install': {'trial_rate': 0.15, 'completion_rate': 0.45, 'paid_rate': 0.25},
            'improved_onboarding': {'trial_rate': 0.08, 'completion_rate': 0.70, 'paid_rate': 0.25},
            'optimized_conversion': {'trial_rate': 0.08, 'completion_rate': 0.45, 'paid_rate': 0.40},
            'all_improved': {'trial_rate': 0.15, 'completion_rate': 0.70, 'paid_rate': 0.40}
        }
        
        results = {}
        
        for scenario_name, rates in scenarios.items():
            # Override rates for this scenario
            original_rates = self.funnel.copy()
            self.funnel['trial_conversion_rate'] = rates['trial_rate']
            self.funnel['trial_completion_rate'] = rates['completion_rate'] 
            self.funnel['trial_to_paid_rate'] = rates['paid_rate']
            
            # Calculate 6-month projection
            six_month_projection = self.project_12_months()[:6]
            total_revenue = sum(month['mrr'] for month in six_month_projection)
            total_customers = six_month_projection[-1]['total_customers']
            
            results[scenario_name] = {
                'six_month_revenue': total_revenue,
                'total_customers': total_customers,
                'improvement_factor': total_revenue / 8955 if scenario_name != 'baseline' else 1.0  # vs baseline
            }
            
            # Restore original rates
            self.funnel = original_rates
            
        return results
    
    def generate_report(self):
        """Generate complete revenue analysis report"""
        projections = self.project_12_months()
        scenarios = self.calculate_improvement_scenarios()
        
        # Summary statistics
        year_end_revenue = projections[-1]['mrr']
        total_customers = projections[-1]['total_customers']
        total_annual_revenue = sum(month['mrr'] for month in projections)
        
        report = {
            'executive_summary': {
                'pricing_model': 'Freemium SaaS: $10/$20/$30 monthly',
                'year_1_mrr': year_end_revenue,
                'year_1_customers': total_customers,
                'total_annual_revenue': total_annual_revenue,
                'average_revenue_per_user': total_annual_revenue / total_customers if total_customers > 0 else 0
            },
            'monthly_projections': projections,
            'improvement_scenarios': scenarios,
            'key_insights': [
                f"With current funnel: ${year_end_revenue}/month MRR in 12 months",
                f"Installation improvements could increase revenue by {scenarios['improved_install']['improvement_factor']:.1f}x",
                f"Better onboarding could increase revenue by {scenarios['improved_onboarding']['improvement_factor']:.1f}x", 
                f"All improvements combined: {scenarios['all_improved']['improvement_factor']:.1f}x revenue potential",
                "Focus areas: 1) Smooth installation, 2) Trial onboarding, 3) Value demonstration"
            ],
            'recommendations': [
                "Build signed macOS app with one-click install",
                "Create interactive onboarding that shows hardware consciousness immediately",
                "Implement trial analytics to optimize conversion points",
                "Add usage-based upgrade prompts in app",
                "Focus on retention over acquisition initially"
            ],
            'generated_at': datetime.now().isoformat()
        }
        
        return report

def main():
    """Generate and display realistic revenue projections"""
    print("💰 MacAgent Pro - Realistic Revenue Model")
    print("=" * 50)
    
    model = RealisticRevenueModel()
    report = model.generate_report()
    
    # Display executive summary
    summary = report['executive_summary']
    print(f"\n📊 Executive Summary:")
    print(f"   Pricing: {summary['pricing_model']}")
    print(f"   Year 1 MRR: ${summary['year_1_mrr']:,}")
    print(f"   Year 1 Customers: {summary['year_1_customers']:,}")
    print(f"   Annual Revenue: ${summary['total_annual_revenue']:,}")
    print(f"   ARPU: ${summary['average_revenue_per_user']:.0f}")
    
    # Display improvement scenarios
    print(f"\n🚀 Improvement Impact:")
    scenarios = report['improvement_scenarios']
    for scenario, data in scenarios.items():
        print(f"   {scenario.replace('_', ' ').title()}: ${data['six_month_revenue']:,} (6mo) | {data['improvement_factor']:.1f}x")
    
    # Display key insights
    print(f"\n💡 Key Insights:")
    for insight in report['key_insights']:
        print(f"   • {insight}")
    
    # Display recommendations  
    print(f"\n🎯 Recommendations:")
    for rec in report['recommendations']:
        print(f"   • {rec}")
    
    # Save detailed report
    filename = f"realistic_revenue_report_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
    with open(filename, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n📋 Detailed report saved: {filename}")
    print(f"\n✅ Much more realistic than $297 one-time pricing!")
    print(f"🎯 Focus on installation experience to unlock growth potential")

if __name__ == "__main__":
    main()