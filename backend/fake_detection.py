"""Fake review detection module."""

from sentiment import SENTIMENT_KEYWORDS

def detect_fake_review(text):
    """Detect if a review is likely fake or spam.
    
    Args:
        text (str): The review text
        
    Returns:
        dict: Detection result with is_fake flag, confidence, and reasons
    """
    lower = text.lower()
    words = lower.split()
    unique_words = set(words)
    
    # Calculate metrics
    repetition_ratio = 1 - (len(unique_words) / len(words)) if words else 0
    exclamations = text.count('!')
    all_caps_words = len([w for w in words if len(w) >= 3 and w.isupper()])
    positive_count = sum(1 for w in SENTIMENT_KEYWORDS['positive'] if w in lower)
    
    reasons = []
    
    # Flag checks
    if repetition_ratio > 0.2:
        reasons.append('Repetitive phrases detected')
    
    if exclamations > 4:
        reasons.append('Excessive exclamation marks')
    
    if all_caps_words > 2:
        reasons.append('Unnatural capitalization pattern')
    
    if positive_count > 8:
        reasons.append('Excessive positive superlatives')
    
    if len(words) < 8:
        reasons.append('Suspiciously short review')
    
    # Determine if fake based on number of red flags
    is_fake = len(reasons) >= 2
    confidence = min(95, int(len(reasons) * 22 + (__import__('random').random() * 15)))
    
    return {
        'is_fake': is_fake,
        'confidence': confidence,
        'reasons': reasons,
        'metrics': {
            'repetition_ratio': round(repetition_ratio, 2),
            'exclamations': exclamations,
            'all_caps_words': all_caps_words,
            'positive_count': positive_count,
            'word_count': len(words)
        }
    }

def get_fake_detection_summary(reviews):
    """Get summary of fake reviews in a batch.
    
    Args:
        reviews (list): List of review texts
        
    Returns:
        dict: Summary with fake/genuine counts and percentages
    """
    results = [detect_fake_review(r) for r in reviews]
    fake_count = sum(1 for r in results if r['is_fake'])
    genuine_count = len(reviews) - fake_count
    
    return {
        'total': len(reviews),
        'fake': fake_count,
        'genuine': genuine_count,
        'fake_percentage': round((fake_count / len(reviews)) * 100, 1) if reviews else 0,
        'genuine_percentage': round((genuine_count / len(reviews)) * 100, 1) if reviews else 0
    }
