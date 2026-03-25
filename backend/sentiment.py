"""Sentiment analysis module for ReviewSense backend."""

SENTIMENT_KEYWORDS = {
    'positive': ['excellent', 'great', 'amazing', 'fantastic', 'wonderful', 'love', 'best',
                 'perfect', 'awesome', 'outstanding', 'superb', 'brilliant', 'satisfied',
                 'happy', 'pleased', 'quality', 'good', 'fast', 'smooth', 'reliable',
                 'helpful', 'comfortable', 'durable', 'beautiful', 'recommend'],
    'negative': ['terrible', 'awful', 'horrible', 'worst', 'bad', 'poor', 'slow', 'damaged',
                 'broken', 'rude', 'unhelpful', 'disappointed', 'frustrated', 'delayed',
                 'defective', 'cheap', 'fragile', 'useless', 'waste', 'ugly', 'never',
                 'faulty', 'problem', 'issue'],
    'neutral': ['okay', 'average', 'decent', 'fine', 'standard', 'expected', 'normal',
                'acceptable', 'mediocre', 'fair']
}

def score_text(text):
    """Score text for sentiment keywords.
    
    Args:
        text (str): The review text to analyze
        
    Returns:
        dict: Normalized sentiment scores (pos, neg, neu) and raw counts
    """
    lower = text.lower()
    pos = sum(1.2 for word in SENTIMENT_KEYWORDS['positive'] if word in lower)
    neg = sum(1.2 for word in SENTIMENT_KEYWORDS['negative'] if word in lower)
    neu = sum(0.8 for word in SENTIMENT_KEYWORDS['neutral'] if word in lower)
    
    total = pos + neg + neu or 1
    return {
        'pos': pos / total,
        'neg': neg / total,
        'neu': neu / total,
        'raw': {'pos': pos, 'neg': neg, 'neu': neu}
    }

def get_sentiment(scores):
    """Classify sentiment based on scores.
    
    Args:
        scores (dict): Sentiment scores from score_text()
        
    Returns:
        str: 'Positive', 'Negative', or 'Neutral'
    """
    if scores['pos'] > scores['neg'] and scores['pos'] > scores['neu']:
        return 'Positive'
    if scores['neg'] > scores['pos'] and scores['neg'] > scores['neu']:
        return 'Negative'
    return 'Neutral'

def get_confidence(scores):
    """Calculate confidence percentage for sentiment classification.
    
    Args:
        scores (dict): Sentiment scores from score_text()
        
    Returns:
        int: Confidence percentage (55-100)
    """
    import random
    vals = [scores['pos'], scores['neg'], scores['neu']]
    max_val = max(vals)
    sum_val = sum(vals) or 1
    return int(55 + (max_val / sum_val) * 40 + random.random() * 5)

def extract_keywords(text):
    """Extract sentiment keywords and relevant words from text.
    
    Args:
        text (str): The review text
        
    Returns:
        list: List of up to 10 relevant keywords
    """
    import re
    lower = text.lower()
    all_keywords = (SENTIMENT_KEYWORDS['positive'] + 
                   SENTIMENT_KEYWORDS['negative'] + 
                   SENTIMENT_KEYWORDS['neutral'])
    
    found = [w for w in all_keywords if w in lower]
    
    # Extract words with 4+ characters
    words = re.findall(r'\b[A-Za-z]{4,}\b', text) or []
    stopwords = {'this', 'that', 'with', 'have', 'from', 'they', 'will', 'your',
                 'what', 'when', 'where', 'there', 'which', 'about', 'were', 'their',
                 'been', 'also', 'than', 'more', 'some', 'just'}
    
    extra = [w for w in words if w.lower() not in stopwords and w.lower() not in found][:6]
    
    keywords = list(set(found + extra))[:10]
    return keywords

def analyze_review(text):
    """Complete sentiment analysis of a review.
    
    Args:
        text (str): The review text
        
    Returns:
        dict: Complete sentiment analysis with scores, sentiment, confidence, keywords
    """
    scores = score_text(text)
    sentiment = get_sentiment(scores)
    confidence = get_confidence(scores)
    keywords = extract_keywords(text)
    
    return {
        'scores': scores,
        'sentiment': sentiment,
        'confidence': confidence,
        'keywords': keywords
    }
