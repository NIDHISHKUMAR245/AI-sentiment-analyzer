"""Emotion detection module."""

EMOTION_KEYWORDS = {
    'Happy': ['love', 'amazing', 'fantastic', 'great', 'excellent', 'best', 'wonderful'],
    'Angry': ['hate', 'worst', 'terrible', 'horrible', 'awful', 'never'],
    'Frustrated': ['slow', 'delay', 'wait', 'issue', 'problem', 'bug', 'broken'],
    'Satisfied': ['good', 'okay', 'fine', 'decent', 'satisfied', 'happy', 'pleased'],
    'Neutral': [],
    'Delighted': ['amazing', 'fantastic', 'excellent', 'wonderful', 'perfect'],
    'Disappointed': ['worst', 'terrible', 'disappointed', 'let down', 'regret']
}

def detect_emotions(text, overall_sentiment):
    """Detect emotions expressed in the review.
    
    Args:
        text (str): The review text
        overall_sentiment (str): Overall sentiment classification
        
    Returns:
        dict: Emotion scores (0-100 for each emotion)
    """
    import random
    lower = text.lower()
    scores = {
        'Happy': 0,
        'Angry': 0,
        'Frustrated': 0,
        'Satisfied': 0,
        'Neutral': 0,
        'Delighted': 0,
        'Disappointed': 0
    }
    
    # Keyword matching
    if any(w in lower for w in EMOTION_KEYWORDS['Happy']):
        scores['Happy'] += 2
        scores['Delighted'] += 1.5
    
    if any(w in lower for w in EMOTION_KEYWORDS['Angry']):
        scores['Angry'] += 2
        scores['Disappointed'] += 1.5
    
    if any(w in lower for w in EMOTION_KEYWORDS['Frustrated']):
        scores['Frustrated'] += 2
    
    if any(w in lower for w in EMOTION_KEYWORDS['Satisfied']):
        scores['Satisfied'] += 2
    
    if overall_sentiment == 'Neutral':
        scores['Neutral'] += 2
    
    # Normalize scores to 0-100 range
    max_score = max(scores.values()) or 1
    for emotion in scores:
        scores[emotion] = int((scores[emotion] / max_score) * 85 + random.random() * 10)
    
    return scores

def get_top_emotions(emotions, top_n=4):
    """Get top N emotions by score.
    
    Args:
        emotions (dict): Emotion scores
        top_n (int): Number of top emotions to return
        
    Returns:
        list: List of tuples (emotion, score) sorted by score descending
    """
    return sorted(emotions.items(), key=lambda x: x[1], reverse=True)[:top_n]
