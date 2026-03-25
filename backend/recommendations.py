"""Recommendation engine module."""

ALL_RECOMMENDATIONS = [
    {
        'id': 1,
        'priority': 'critical',
        'icon': '🚚',
        'title': 'Overhaul Delivery & Logistics',
        'trigger': '35% of negative reviews mention slow delivery',
        'impact': 88,
        'metric': '+22% positive sentiment',
        'timeframe': 'Q1',
        'desc': 'Customers repeatedly mention slow delivery. This is costing you ratings.',
        'steps': [
            'Partner with regional couriers for faster dispatch',
            'Set SLA targets ≤3 days delivery',
            'Implement real-time tracking system',
            'Resolve bottlenecks in warehouse operations',
            'Offer 1-day shipping option in metros'
        ]
    },
    {
        'id': 2,
        'priority': 'critical',
        'icon': '📱',
        'title': 'Enhance Software & Bug Fixes',
        'trigger': '18% of reviews report bugs and crashes',
        'impact': 82,
        'metric': '+18% positive sentiment',
        'timeframe': 'Q1',
        'desc': 'Software stability is directly impacting user satisfaction and reviews.',
        'steps': [
            'Establish dedicated QA testing team',
            'Release bi-weekly bug fix patches',
            'Improve error reporting in app',
            'Add in-app crash recovery',
            'Create beta testing program with users'
        ]
    },
    {
        'id': 3,
        'priority': 'critical',
        'icon': '🎥',
        'title': 'Improve Camera Performance',
        'trigger': '22% of product reviews criticize camera quality',
        'impact': 79,
        'metric': '+19% positive sentiment',
        'timeframe': 'Q2',
        'desc': 'Camera is a major purchase decision factor for your product category.',
        'steps': [
            'Upgrade camera sensor in next hardware revision',
            'Improve low-light performance via firmware update',
            'Partner with photography influencers for demos',
            'Implement AI-powered image stabilization',
            'Add Pro mode for photography enthusiasts'
        ]
    },
    {
        'id': 4,
        'priority': 'medium',
        'icon': '💳',
        'title': 'Introduce Premium Tier & Value Bundles',
        'trigger': '16% perceive poor value for money',
        'impact': 71,
        'metric': '+12% positive sentiment',
        'timeframe': 'Q2',
        'desc': 'Price-sensitive customers perceive poor value. Bundle add-ons to justify costs.',
        'steps': [
            'Create value bundles (product + accessories)',
            'Offer subscription plans for premium features',
            'Implement loyalty rewards program',
            'Run seasonal discounts on complementary products',
            'Create financing options for premium tier'
        ]
    },
    {
        'id': 5,
        'priority': 'medium',
        'icon': '🎧',
        'title': 'Enhance Audio & Headphone Support',
        'trigger': '12% report audio quality issues',
        'impact': 68,
        'metric': '+10% positive sentiment',
        'timeframe': 'Q2',
        'desc': 'Audio quality affects user daily experience. Prioritize speaker improvements.',
        'steps': [
            'Upgrade speaker drivers for better bass',
            'Implement spatial audio support',
            'Add noise cancellation in microphone',
            'Improve audio jack quality if applicable',
            'Partner with audio brands for bundled software'
        ]
    },
    {
        'id': 6,
        'priority': 'medium',
        'icon': '🔋',
        'title': 'Extend Battery Life',
        'trigger': '14% mention battery drain as concern',
        'impact': 75,
        'metric': '+14% positive sentiment',
        'timeframe': 'Q1',
        'desc': 'Battery life is a key feature. Customers want 12+ hour usage.',
        'steps': [
            'Optimize background processes and services',
            'Upgrade battery capacity in next revision',
            'Improve power management firmware',
            'Implement adaptive refresh rate',
            'Add ultra-battery saver mode'
        ]
    },
    {
        'id': 7,
        'priority': 'medium',
        'icon': '📦',
        'title': 'Improve Packaging & Unboxing',
        'trigger': '8% mention packaging quality',
        'impact': 62,
        'metric': '+8% positive sentiment',
        'timeframe': 'Q1',
        'desc': 'First impression matters. Premium unboxing creates viral moments.',
        'steps': [
            'Redesign packaging with premium materials',
            'Add welcome booklet with tips & tricks',
            'Include premium accessories in box',
            'Create unboxing video content templates',
            'Implement eco-friendly packaging option'
        ]
    },
    {
        'id': 8,
        'priority': 'low',
        'icon': '🎨',
        'title': 'Expand Color & Design Options',
        'trigger': '6% request more color variants',
        'impact': 55,
        'metric': '+6% positive sentiment',
        'timeframe': 'Q3',
        'desc': 'Color options drive repeat purchases and satisfy diverse preferences.',
        'steps': [
            'Launch 3+ new color variants quarterly',
            'Conduct user surveys on preferred colors',
            'Partner with designers on limited editions',
            'Create custom color builder tool online',
            'Sell color-specific accessories bundles'
        ]
    },
    {
        'id': 9,
        'priority': 'low',
        'icon': '♿',
        'title': 'Add Accessibility Features',
        'trigger': '3% mention accessibility needs',
        'impact': 48,
        'metric': '+5% positive sentiment',
        'timeframe': 'Q3',
        'desc': 'Inclusive design expands addressable market and improves brand perception.',
        'steps': [
            'Implement screen reader compatibility',
            'Add voice control features',
            'Support high contrast modes',
            'Improve haptic feedback accessibility',
            'Create accessibility guide documentation'
        ]
    },
    {
        'id': 10,
        'priority': 'low',
        'icon': '🌍',
        'title': 'Expand Global Availability',
        'trigger': '5% report product unavailable in region',
        'impact': 52,
        'metric': '+7% positive sentiment',
        'timeframe': 'Q4',
        'desc': 'Availability in more regions unlocks new customer segments.',
        'steps': [
            'Establish partnerships with regional resellers',
            'Launch localized marketing in 5 new countries',
            'Set up regional warranty centers',
            'Localize support in 3+ languages',
            'Create region-specific pricing tiers'
        ]
    }
]

def get_all_recommendations():
    """Get all 10 recommendations.
    
    Returns:
        list: All recommendation objects
    """
    return ALL_RECOMMENDATIONS

def filter_recommendations(priority=None):
    """Filter recommendations by priority level.
    
    Args:
        priority (str): 'critical', 'medium', 'low', or None for all
        
    Returns:
        list: Filtered recommendations
    """
    if priority is None:
        return ALL_RECOMMENDATIONS
    return [r for r in ALL_RECOMMENDATIONS if r['priority'] == priority]

def get_recommendations_summary():
    """Get summary statistics about recommendations.
    
    Returns:
        dict: Summary with counts by priority and average impact
    """
    critical = [r for r in ALL_RECOMMENDATIONS if r['priority'] == 'critical']
    medium = [r for r in ALL_RECOMMENDATIONS if r['priority'] == 'medium']
    low = [r for r in ALL_RECOMMENDATIONS if r['priority'] == 'low']
    
    return {
        'total': len(ALL_RECOMMENDATIONS),
        'critical': len(critical),
        'medium': len(medium),
        'low': len(low),
        'avg_impact': round(sum(r['impact'] for r in ALL_RECOMMENDATIONS) / len(ALL_RECOMMENDATIONS), 1)
    }

def generate_review_recommendations(text, sentiment, aspects):
    """Generate recommendations specific to a single review.
    
    Args:
        text (str): Review text
        sentiment (str): Overall sentiment
        aspects (list): Aspect analysis results
        
    Returns:
        list: Relevant recommendations for this review
    """
    lower = text.lower()
    recommendations = []
    
    # Map common keywords to recommendation IDs
    keyword_mapping = {
        'delivery': 1,
        'software': 2,
        'camera': 3,
        'price': 4,
        'audio': 5,
        'battery': 6,
        'packaging': 7,
        'color': 8,
        'accessibility': 9,
        'availability': 10
    }
    
    for keyword, rec_id in keyword_mapping.items():
        if keyword in lower:
            rec = next((r for r in ALL_RECOMMENDATIONS if r['id'] == rec_id), None)
            if rec:
                recommendations.append({
                    'icon': rec['icon'],
                    'title': rec['title'],
                    'desc': rec['desc'],
                    'priority': 'high' if sentiment == 'Negative' else 'medium'
                })
    
    return recommendations[:3]  # Return top 3 recommendations

def get_recommendations_roadmap():
    """Generate implementation roadmap grouped by timeframe.
    
    Returns:
        dict: Recommendations grouped by Q1, Q2, Q3, Q4
    """
    roadmap = {'Q1': [], 'Q2': [], 'Q3': [], 'Q4': []}
    
    for rec in ALL_RECOMMENDATIONS:
        timeframe = rec['timeframe']
        if timeframe in roadmap:
            roadmap[timeframe].append(rec)
    
    return roadmap
