"""ReviewSense Backend API - Flask Application"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from sentiment import analyze_review as analyze_sentiment
from aspects import analyze_aspects, get_aspect_summary
from emotions import detect_emotions, get_top_emotions
from fake_detection import detect_fake_review
from recommendations import (
    get_all_recommendations,
    filter_recommendations,
    generate_review_recommendations,
    get_recommendations_summary,
    get_recommendations_roadmap
)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# ============ HEALTH CHECK ============
@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'ReviewSense API'})

# ============ SENTIMENT ANALYSIS ENDPOINTS ============
@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    Main analysis endpoint.
    
    Expected JSON:
    {
        "text": "Review text here"
    }
    
    Returns complete analysis including sentiment, aspects, emotions, fake detection
    """
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Text field is required'}), 400
        
        # Run all analyses
        sentiment_result = analyze_sentiment(text)
        aspects = analyze_aspects(text)
        emotions = detect_emotions(text, sentiment_result['sentiment'])
        fake_info = detect_fake_review(text)
        review_recs = generate_review_recommendations(text, sentiment_result['sentiment'], aspects)
        
        return jsonify({
            'sentiment': sentiment_result['sentiment'],
            'confidence': sentiment_result['confidence'],
            'scores': sentiment_result['scores'],
            'keywords': sentiment_result['keywords'],
            'aspects': aspects,
            'emotions': emotions,
            'top_emotions': dict(get_top_emotions(emotions, 4)),
            'fake_detection': {
                'is_fake': fake_info['is_fake'],
                'confidence': fake_info['confidence'],
                'reasons': fake_info['reasons']
            },
            'recommendations': review_recs
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sentiment', methods=['POST'])
def sentiment_only():
    """Sentiment analysis only endpoint."""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Text field is required'}), 400
        
        result = analyze_sentiment(text)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ ASPECTS ANALYSIS ENDPOINTS ============
@app.route('/api/aspects', methods=['POST'])
def aspects_analysis():
    """Aspect-based sentiment analysis endpoint."""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Text field is required'}), 400
        
        aspects = analyze_aspects(text)
        summary = get_aspect_summary(aspects)
        
        return jsonify({
            'aspects': aspects,
            'summary': summary
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ EMOTIONS DETECTION ENDPOINTS ============
@app.route('/api/emotions', methods=['POST'])
def emotions_analysis():
    """Emotion detection endpoint."""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        sentiment = data.get('sentiment', 'Neutral')
        
        if not text:
            return jsonify({'error': 'Text field is required'}), 400
        
        emotions = detect_emotions(text, sentiment)
        top_emotions = dict(get_top_emotions(emotions, 7))
        
        return jsonify({
            'all_emotions': emotions,
            'top_emotions': top_emotions
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ FAKE REVIEW DETECTION ENDPOINTS ============
@app.route('/api/fake-detection', methods=['POST'])
def fake_detection():
    """Fake review detection endpoint."""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Text field is required'}), 400
        
        result = detect_fake_review(text)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ RECOMMENDATIONS ENDPOINTS ============
@app.route('/api/recommendations/all', methods=['GET'])
def get_recommendations():
    """Get all recommendations."""
    try:
        recommendations = get_all_recommendations()
        return jsonify({
            'recommendations': recommendations,
            'count': len(recommendations)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations/filter', methods=['GET'])
def filter_recs():
    """Filter recommendations by priority.
    
    Query params:
    - priority: 'critical', 'medium', 'low', or 'all'
    """
    try:
        priority = request.args.get('priority', 'all')
        
        if priority == 'all':
            recs = get_all_recommendations()
        else:
            recs = filter_recommendations(priority)
        
        return jsonify({
            'priority_filter': priority,
            'recommendations': recs,
            'count': len(recs)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations/summary', methods=['GET'])
def recommendations_summary():
    """Get recommendations summary statistics."""
    try:
        summary = get_recommendations_summary()
        return jsonify(summary)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations/roadmap', methods=['GET'])
def recommendations_roadmap():
    """Get implementation roadmap grouped by timeframe."""
    try:
        roadmap = get_recommendations_roadmap()
        return jsonify(roadmap)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations/review', methods=['POST'])
def review_recommendations():
    """Generate recommendations specific to a review.
    
    Expected JSON:
    {
        "text": "Review text",
        "sentiment": "Positive|Negative|Neutral",
        "aspects": [...]
    }
    """
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        sentiment = data.get('sentiment', 'Neutral')
        aspects = data.get('aspects', [])
        
        if not text:
            return jsonify({'error': 'Text field is required'}), 400
        
        recs = generate_review_recommendations(text, sentiment, aspects)
        return jsonify({
            'recommendations': recs,
            'count': len(recs)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ BATCH ANALYSIS ENDPOINTS ============
@app.route('/api/batch-analyze', methods=['POST'])
def batch_analyze():
    """Analyze multiple reviews in batch.
    
    Expected JSON:
    {
        "reviews": ["review1 text", "review2 text", ...]
    }
    """
    try:
        data = request.get_json()
        reviews = data.get('reviews', [])
        
        if not reviews or not isinstance(reviews, list):
            return jsonify({'error': 'Reviews must be a non-empty list'}), 400
        
        results = []
        sentiments_count = {'Positive': 0, 'Negative': 0, 'Neutral': 0}
        
        for review_text in reviews:
            if not review_text.strip():
                continue
            
            analysis = analyze_sentiment(review_text)
            sentiments_count[analysis['sentiment']] += 1
            
            results.append({
                'text': review_text[:100] + '...' if len(review_text) > 100 else review_text,
                'sentiment': analysis['sentiment'],
                'confidence': analysis['confidence']
            })
        
        return jsonify({
            'total_reviewed': len(results),
            'sentiment_distribution': sentiments_count,
            'reviews': results
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ ERROR HANDLERS ============
@app.errorhandler(404)
def not_found(error):
    """404 handler."""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(error):
    """500 handler."""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Run on localhost:5000
    # Set debug=False in production
    app.run(debug=True, host='localhost', port=5000)
