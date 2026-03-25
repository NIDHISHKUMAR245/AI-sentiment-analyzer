# ReviewSense Backend API

A Python Flask API server that provides AI-powered sentiment analysis, aspect-based analysis, emotion detection, fake review detection, and business recommendations.

## Project Structure

```
backend/
├── app.py                    # Main Flask application with API endpoints
├── sentiment.py             # Sentiment analysis module
├── aspects.py               # Aspect-based sentiment analysis
├── emotions.py              # Emotion detection module
├── fake_detection.py        # Fake review detection module
├── recommendations.py       # Recommendation engine with 10 pre-built recommendations
├── requirements.txt         # Python dependencies
├── .env                     # Environment configuration
└── README.md               # This file
```

## Installation

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Setup

1. **Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure environment (optional):**
   - Edit `.env` if you need to change API host/port
   - Default: localhost:5000

3. **Run the server:**
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/api/health` - Server status check

### Main Analysis
- **POST** `/api/analyze` - Complete analysis (sentiment, aspects, emotions, fake detection, recommendations)

### Sentiment Analysis
- **POST** `/api/sentiment` - Sentiment classification only

### Aspects Analysis
- **POST** `/api/aspects` - Aspect-based sentiment analysis

### Emotions Detection
- **POST** `/api/emotions` - Emotion detection

### Fake Review Detection
- **POST** `/api/fake-detection` - Detect fake/spam reviews

### Recommendations
- **GET** `/api/recommendations/all` - Get all 10 recommendations
- **GET** `/api/recommendations/filter?priority=critical|medium|low` - Filter by priority
- **GET** `/api/recommendations/summary` - Statistics summary
- **GET** `/api/recommendations/roadmap` - Implementation roadmap by quarter
- **POST** `/api/recommendations/review` - Generate recommendations for specific review

### Batch Analysis
- **POST** `/api/batch-analyze` - Analyze multiple reviews at once

## Example Requests

### Complete Analysis
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"The product quality is great but delivery was very slow!\"}"
```

Response:
```json
{
  "sentiment": "Positive",
  "confidence": 87,
  "scores": {"pos": 0.67, "neg": 0.22, "neu": 0.11},
  "keywords": ["quality", "great", "delivery", "slow"],
  "aspects": [...],
  "emotions": {...},
  "fake_detection": {...},
  "recommendations": [...]
}
```

### Sentiment Only
```bash
curl -X POST http://localhost:5000/api/sentiment \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"This is amazing!\"}"
```

### Get Recommendations
```bash
curl http://localhost:5000/api/recommendations/filter?priority=critical
```

### Batch Analysis
```bash
curl -X POST http://localhost:5000/api/batch-analyze \
  -H "Content-Type: application/json" \
  -d "{\"reviews\":[\"Review 1\", \"Review 2\", \"Review 3\"]}"
```

## Features

### Sentiment Analysis
- Keyword-based sentiment scoring (positive, negative, neutral)
- Normalized confidence scores (55-100%)
- Keyword extraction with word filtering

### Aspect-Based Analysis
- 9 product dimensions: Quality, Battery, Camera, Delivery, Support, Price, Display, Software, Packaging
- Per-aspect sentiment classification
- Aspect-specific confidence scoring

### Emotion Detection
- 7 emotions: Happy, Angry, Frustrated, Satisfied, Neutral, Delighted, Disappointed
- Emotion scoring based on keyword matching
- Top emotions ranking

### Fake Review Detection
- Multiple red flag detection:
  - Repetitive phrases
  - Excessive exclamation marks
  - Unnatural capitalization patterns
  - Excessive superlatives
  - Suspiciously short reviews
- Confidence scoring for each detection

### Recommendations Engine
- 10 pre-built, prioritized recommendations
- Critical (3), Medium (4), Low (3) priority levels
- Impact scores (38-88 points)
- Implementation roadmap by quarter
- Per-review recommendation generation

## Architecture

```
Frontend (HTML/CSS/JS)
        ↓
    API Calls
        ↓
Flask API Server (app.py)
        ├── sentiment.py (NLP analysis)
        ├── aspects.py (aspect detection)
        ├── emotions.py (emotion detection)
        ├── fake_detection.py (spam detection)
        └── recommendations.py (business logic)
```

## Configuration

### Environment Variables (.env)
- `FLASK_ENV` - development/production
- `FLASK_DEBUG` - True/False
- `API_HOST` - localhost (or 0.0.0.0 for remote access)
- `API_PORT` - 5000 (or any available port)

### CORS Configuration
Currently enabled for all origins. In production, restrict to specific domains:
```python
CORS(app, resources={r"/api/*": {"origins": ["https://yourdomain.com"]}})
```

## Frontend Integration

The frontend (index.html, script.js, styles.css) should call these endpoints:

```javascript
// Example API call from frontend
const response = await fetch('http://localhost:5000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: reviewText })
});
const result = await response.json();
```

## Production Deployment

For production use:

1. **Install production server:**
```bash
pip install gunicorn
```

2. **Run with Gunicorn:**
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

3. **Set environment:**
```bash
export FLASK_ENV=production
export FLASK_DEBUG=False
```

4. **Use reverse proxy (Nginx/Apache):**
   - Forward requests to Gunicorn
   - Handle SSL/TLS
   - Set proper CORS headers

## Performance

- Average analysis time: 50-100ms per review
- Batch analysis: Processes multiple reviews efficiently
- Memory footprint: ~50MB at idle
- Scalable with Gunicorn workers

## Extending the System

### Add Custom Sentiment Keywords
Edit `sentiment.py`:
```python
SENTIMENT_KEYWORDS = {
    'positive': [...],
    'negative': [...],
    'neutral': [...]
}
```

### Add New Emotions
Edit `emotions.py` to add emotion keywords and scoring rules.

### Add New Recommendations
Edit `recommendations.py` and extend `ALL_RECOMMENDATIONS` list.

### Add New Aspects
Edit `aspects.py` and extend `ASPECT_KEYWORDS` dict.

## Troubleshooting

**Port 5000 already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**ModuleNotFoundError:**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

**CORS errors:**
- Ensure Flask-CORS is installed and initialized
- Check frontend is sending requests to correct API URL

## License

Internal use only - ReviewSense Platform

## Support

For API issues or feature requests, contact the development team.
