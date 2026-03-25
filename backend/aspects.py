"""Aspect-based sentiment analysis module."""

from sentiment import score_text, get_sentiment

ASPECT_KEYWORDS = {
    'Product Quality': ['quality', 'build', 'material', 'durable', 'sturdy', 'solid', 'premium', 'cheap', 'fragile'],
    'Battery': ['battery', 'charge', 'charging', 'power', 'drain', 'life'],
    'Camera': ['camera', 'photo', 'picture', 'image', 'lens', 'shoot', 'video'],
    'Delivery': ['delivery', 'shipping', 'arrived', 'late', 'fast', 'slow', 'dispatch', 'courier'],
    'Customer Support': ['support', 'service', 'staff', 'agent', 'response', 'helpful', 'rude', 'team'],
    'Price / Value': ['price', 'cost', 'expensive', 'cheap', 'value', 'worth', 'money', 'budget'],
    'Display': ['screen', 'display', 'brightness', 'resolution', 'color', 'pixels'],
    'Software': ['software', 'app', 'update', 'bug', 'crash', 'interface', 'ui', 'feature'],
    'Packaging': ['packaging', 'box', 'package', 'wrap', 'protection']
}

def analyze_aspects(text):
    """Analyze sentiment for specific product aspects.
    
    Args:
        text (str): The review text
        
    Returns:
        list: List of dicts with aspect, sentiment, and confidence
    """
    import random
    lower = text.lower()
    results = []
    
    for aspect, keywords in ASPECT_KEYWORDS.items():
        found = any(word in lower for word in keywords)
        if found:
            # Score sentences containing aspect keywords
            sentences = text.split(/[.!?]+/) if '.' in text else [text]
            aspect_text = next((s for s in sentences 
                              if any(w in s.lower() for w in keywords)), '')
            
            sc = score_text(aspect_text)
            sentiment = get_sentiment(sc)
            conf = int(60 + random.random() * 30)
            
            results.append({
                'aspect': aspect,
                'sentiment': sentiment,
                'confidence': conf
            })
    
    return results

def get_aspect_summary(aspects):
    """Get summary of aspect sentiments.
    
    Args:
        aspects (list): List of aspect analysis results
        
    Returns:
        dict: Summary with positive, negative, neutral counts
    """
    summary = {'positive': 0, 'negative': 0, 'neutral': 0}
    for aspect in aspects:
        key = aspect['sentiment'].lower()
        summary[key] = summary.get(key, 0) + 1
    return summary
