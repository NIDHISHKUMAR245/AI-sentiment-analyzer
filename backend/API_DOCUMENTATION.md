# ReviewSense API Documentation

Complete API reference for ReviewSense Backend.

## Base URL
```
http://localhost:5000/api
```

## Request/Response Format
- **Content-Type:** application/json
- **CORS:** Enabled for all origins (development)

---

## Endpoints Reference

### 1. Health Check

**GET** `/api/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "ok",
  "service": "ReviewSense API"
}
```

---

### 2. Complete Analysis

**POST** `/api/analyze`

Run complete analysis on a review (sentiment, aspects, emotions, fake detection, recommendations).

**Request Body:**
```json
{
  "text": "The product quality is excellent but delivery was slow"
}
```

**Response:**
```json
{
  "sentiment": "Positive",
  "confidence": 87,
  "scores": {
    "pos": 0.67,
    "neg": 0.22,
    "neu": 0.11,
    "raw": {"pos": 3.6, "neg": 1.2, "neu": 0.6}
  },
  "keywords": ["quality", "excellent", "delivery", "slow"],
  "aspects": [
    {
      "aspect": "Product Quality",
      "sentiment": "Positive",
      "confidence": 82
    },
    {
      "aspect": "Delivery",
      "sentiment": "Negative",
      "confidence": 75
    }
  ],
  "emotions": {
    "Happy": 72,
    "Angry": 15,
    "Frustrated": 42,
    "Satisfied": 68,
    "Neutral": 10,
    "Delighted": 58,
    "Disappointed": 18
  },
  "top_emotions": {
    "Happy": 72,
    "Satisfied": 68,
    "Delighted": 58,
    "Frustrated": 42
  },
  "fake_detection": {
    "is_fake": false,
    "confidence": 5,
    "reasons": []
  },
  "recommendations": [
    {
      "icon": "🚚",
      "title": "Overhaul Delivery & Logistics",
      "desc": "Customers repeatedly mention slow delivery...",
      "priority": "high"
    }
  ]
}
```

---

### 3. Sentiment Analysis Only

**POST** `/api/sentiment`

Get only sentiment classification (faster than complete analysis).

**Request Body:**
```json
{
  "text": "This product is amazing!"
}
```

**Response:**
```json
{
  "scores": {
    "pos": 0.85,
    "neg": 0.05,
    "neu": 0.10,
    "raw": {"pos": 3.4, "neg": 0.2, "neu": 0.4}
  },
  "sentiment": "Positive",
  "confidence": 92,
  "keywords": ["amazing"]
}
```

---

### 4. Aspects Analysis

**POST** `/api/aspects`

Analyze sentiment for specific product aspects.

**Request Body:**
```json
{
  "text": "Great battery life but camera is disappointing"
}
```

**Response:**
```json
{
  "aspects": [
    {
      "aspect": "Battery",
      "sentiment": "Positive",
      "confidence": 78
    },
    {
      "aspect": "Camera",
      "sentiment": "Negative",
      "confidence": 81
    }
  ],
  "summary": {
    "positive": 1,
    "negative": 1,
    "neutral": 0
  }
}
```

**Supported Aspects:**
- Product Quality
- Battery
- Camera
- Delivery
- Customer Support
- Price / Value
- Display
- Software
- Packaging

---

### 5. Emotion Detection

**POST** `/api/emotions`

Detect emotions expressed in the review.

**Request Body:**
```json
{
  "text": "I absolutely love this product!",
  "sentiment": "Positive"
}
```

**Response:**
```json
{
  "all_emotions": {
    "Happy": 88,
    "Angry": 5,
    "Frustrated": 8,
    "Satisfied": 75,
    "Neutral": 3,
    "Delighted": 92,
    "Disappointed": 4
  },
  "top_emotions": {
    "Delighted": 92,
    "Happy": 88,
    "Satisfied": 75,
    "Frustrated": 8
  }
}
```

**Available Emotions:**
- Happy 😊
- Angry 😠
- Frustrated 😤
- Satisfied 😌
- Neutral 😐
- Delighted 🤩
- Disappointed 😔

---

### 6. Fake Review Detection

**POST** `/api/fake-detection`

Detect if a review is likely fake or spam.

**Request Body:**
```json
{
  "text": "Best product! Best product! Amazing amazing BEST EVER!!!"
}
```

**Response:**
```json
{
  "is_fake": true,
  "confidence": 78,
  "reasons": [
    "Repetitive phrases detected",
    "Excessive exclamation marks",
    "Excessive positive superlatives"
  ],
  "metrics": {
    "repetition_ratio": 0.35,
    "exclamations": 5,
    "all_caps_words": 2,
    "positive_count": 12,
    "word_count": 8
  }
}
```

**Red Flags Detected:**
- Repetitive phrases (>20% unique words)
- Excessive exclamations (>4 marks)
- Unnatural capitalization (>2 all-caps words)
- Excessive superlatives (>8 positive words)
- Suspiciously short (<8 words)

---

### 7. Get All Recommendations

**GET** `/api/recommendations/all`

Get all 10 recommendations.

**Response:**
```json
{
  "recommendations": [
    {
      "id": 1,
      "priority": "critical",
      "icon": "🚚",
      "title": "Overhaul Delivery & Logistics",
      "trigger": "35% of negative reviews mention slow delivery",
      "impact": 88,
      "metric": "+22% positive sentiment",
      "timeframe": "Q1",
      "desc": "Customers repeatedly mention slow delivery...",
      "steps": [
        "Partner with regional couriers for faster dispatch",
        "Set SLA targets ≤3 days delivery",
        ...
      ]
    },
    ...
  ],
  "count": 10
}
```

---

### 8. Filter Recommendations by Priority

**GET** `/api/recommendations/filter?priority=critical`

Filter recommendations by priority level.

**Query Parameters:**
- `priority` - `critical`, `medium`, `low`, or `all` (default: `all`)

**Response:**
```json
{
  "priority_filter": "critical",
  "recommendations": [
    {
      "id": 1,
      "priority": "critical",
      ...
    },
    ...
  ],
  "count": 3
}
```

**Priority Levels:**
- **Critical** (3 items) - Highest impact, Q1 focus
- **Medium** (4 items) - Moderate impact, Q2-Q3
- **Low** (3 items) - Lower impact, Q3-Q4

---

### 9. Recommendations Summary

**GET** `/api/recommendations/summary`

Get statistics about recommendations.

**Response:**
```json
{
  "total": 10,
  "critical": 3,
  "medium": 4,
  "low": 3,
  "avg_impact": 68.4
}
```

---

### 10. Recommendations Roadmap

**GET** `/api/recommendations/roadmap`

Get recommendations grouped by implementation quarter.

**Response:**
```json
{
  "Q1": [
    {
      "id": 1,
      "title": "Overhaul Delivery & Logistics",
      "priority": "critical",
      ...
    },
    ...
  ],
  "Q2": [...],
  "Q3": [...],
  "Q4": [...]
}
```

---

### 11. Generate Per-Review Recommendations

**POST** `/api/recommendations/review`

Generate recommendations specific to a single review's issues.

**Request Body:**
```json
{
  "text": "Delivery was terribly slow and camera quality is poor",
  "sentiment": "Negative",
  "aspects": [
    {"aspect": "Delivery", "sentiment": "Negative"},
    {"aspect": "Camera", "sentiment": "Negative"}
  ]
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "icon": "🚚",
      "title": "Overhaul Delivery & Logistics",
      "desc": "Customers repeatedly mention slow delivery...",
      "priority": "high"
    },
    {
      "icon": "🎥",
      "title": "Improve Camera Performance",
      "desc": "Camera is a major purchase decision factor...",
      "priority": "high"
    }
  ],
  "count": 2
}
```

---

### 12. Batch Analysis

**POST** `/api/batch-analyze`

Analyze multiple reviews at once.

**Request Body:**
```json
{
  "reviews": [
    "The product is great!",
    "Terrible experience with delivery",
    "Average quality for the price"
  ]
}
```

**Response:**
```json
{
  "total_reviewed": 3,
  "sentiment_distribution": {
    "Positive": 1,
    "Negative": 1,
    "Neutral": 1
  },
  "reviews": [
    {
      "text": "The product is great!",
      "sentiment": "Positive",
      "confidence": 89
    },
    {
      "text": "Terrible experience with delivery",
      "sentiment": "Negative",
      "confidence": 91
    },
    {
      "text": "Average quality for the price",
      "sentiment": "Neutral",
      "confidence": 74
    }
  ]
}
```

---

## Error Responses

### Bad Request (400)
```json
{
  "error": "Text field is required"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error"
}
```

### Not Found (404)
```json
{
  "error": "Endpoint not found"
}
```

---

## Rate Limiting

Currently unlimited. For production:
- Implement rate limiting per IP
- Suggested: 100 requests/minute

## Authentication

Currently no authentication. For production:
- Implement JWT tokens
- API key validation
- User account system

## Performance Notes

- Average analysis: 50-100ms
- Batch processing: ~20ms per review
- Caching: Not implemented (can be added)

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing/invalid params) |
| 404 | Endpoint not found |
| 500 | Server error |

---

## Usage Examples

### Python
```python
import requests

response = requests.post('http://localhost:5000/api/analyze', json={
    'text': 'Great product but slow delivery'
})
data = response.json()
print(data['sentiment'])  # Positive
```

### JavaScript/Frontend
```javascript
const response = await fetch('http://localhost:5000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Amazing!' })
});
const data = await response.json();
console.log(data.sentiment);  // Positive
```

### cURL
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Perfect product!"}'
```

---

## Versioning

Current API Version: **1.0.0**

Future versions will maintain backward compatibility.

---

For questions or issues, contact the development team.
