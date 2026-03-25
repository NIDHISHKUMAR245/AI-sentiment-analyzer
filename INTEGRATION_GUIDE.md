# Frontend-Backend Integration Guide

This document explains how to update the frontend (`script.js`) to call the new backend API instead of running analysis locally.

## Architecture Change

### Before (Client-Side Only)
```
Browser (HTML/CSS/JS)
    ↓
All analysis logic runs in JavaScript (frontend)
    ↓
Display results in UI
```

### After (With Backend)
```
Browser (HTML/CSS/JS)
    ↓
API Calls (HTTP) to Flask Backend
    ↓
Backend runs analysis (Python)
    ↓
Returns results to frontend
    ↓
Display results in UI
```

## Key Changes Needed

### 1. Update analyzeReview() Function

**Current (Client-Side):**
```javascript
function analyzeReview() {
  const text = document.getElementById('review-input').value.trim();
  if (!text) return;
  
  // Runs locally
  const scores = scoreText(text);
  const sentiment = getSentiment(scores);
  // ... more local processing
}
```

**Updated (With API):**
```javascript
async function analyzeReview() {
  const text = document.getElementById('review-input').value.trim();
  if (!text) return;
  
  const bar = document.getElementById('loading-bar');
  bar.classList.add('active');
  
  try {
    const response = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    bar.classList.remove('active');
    
    renderResults(data);
  } catch (error) {
    bar.classList.remove('active');
    alert('Error analyzing review: ' + error.message);
  }
}
```

### 2. Update renderResults() Function

**Current (Expects Local Analysis):**
```javascript
function renderResults(text) {
  const scores = scoreText(text);
  const sentiment = getSentiment(scores);
  // ... more processing
}
```

**Updated (Expects API Response):**
```javascript
function renderResults(data) {
  // data now contains: sentiment, confidence, keywords, aspects, emotions, fake_detection, recommendations
  
  const sentiment = data.sentiment;       // "Positive", "Negative", "Neutral"
  const confidence = data.confidence;     // 87
  const keywords = data.keywords;         // ["quality", "delivery", ...]
  const aspects = data.aspects;           // [{aspect, sentiment, confidence}, ...]
  const emotions = data.emotions;         // {Happy: 72, Angry: 15, ...}
  const fakeInfo = data.fake_detection;   // {is_fake, confidence, reasons}
  
  // Rest of rendering logic stays the same
}
```

### 3. Remove Local Analysis Functions (Optional)

Once backend is integrated, these functions can be removed to reduce client-side code:

- `scoreText()`
- `getSentiment()`
- `getConfidence()`
- `extractKeywords()`
- `analyzeAspects()`
- `detectEmotions()`
- `isFakeReview()`
- `generateReviewRecs()`

Keep for **demonstration purposes only** or if you want client-side fallback.

### 4. Update Dashboard Initialization

**Current:**
```javascript
function initDashboard() {
  // Data is hardcoded in JavaScript
  const data = {
    sentiment: { Positive: 798, Neutral: 262, Negative: 187 },
    // ...
  };
}
```

**Updated (Optional - Call Backend API):**
```javascript
async function initDashboard() {
  try {
    // Option 1: Fetch real data from backend
    const response = await fetch('http://localhost:5000/api/recommendations/summary');
    const summary = await response.json();
    
    // Use real data for charts
    // ... create charts with summary data
  } catch (error) {
    console.log('Using demo data');
    // Fall back to hardcoded demo data
  }
}
```

### 5. Update Bulk CSV Analysis

**Current:**
```javascript
async function procesCSVFile(file) {
  // CSV parsing and analysis happens in JavaScript
  for (let review of reviews) {
    const result = analyzeReview(review text);
    // ...
  }
}
```

**Updated (With Batch API):**
```javascript
async function processCSVFile(file) {
  const reviews = parseCSVFile(file);  // Parse CSV locally
  
  try {
    const response = await fetch('http://localhost:5000/api/batch-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews })
    });
    
    const data = await response.json();
    
    // data contains: total_reviewed, sentiment_distribution, reviews
    showBulkResults(data);
  } catch (error) {
    showUploadError('Batch analysis failed: ' + error.message);
  }
}
```

### 6. Update Voice Analysis

**Current:**
```javascript
function analyzeVoiceTranscript() {
  const transcript = capturedVoice;
  // Local analysis
  const result = analyzeReview(transcript);
  // ...
}
```

**Updated (With API):**
```javascript
async function analyzeVoiceTranscript() {
  const transcript = document.getElementById('transcript-box').textContent;
  if (!transcript) return;
  
  try {
    const response = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: transcript })
    });
    
    const data = await response.json();
    renderVoiceResults(data);
  } catch (error) {
    alert('Error analyzing voice: ' + error.message);
  }
}
```

## Step-by-Step Integration

### Step 1: Start Backend Server
```bash
cd backend
pip install -r requirements.txt
python app.py
```

Server will run on `http://localhost:5000`

### Step 2: Test API Connection
```javascript
// Add to browser console to test
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

Should return: `{status: 'ok', service: 'ReviewSense API'}`

### Step 3: Update Key Functions
Update `analyzeReview()`, `renderResults()`, and `processCSVFile()` as shown above.

### Step 4: Test Frontend
- Test single review analysis
- Test bulk CSV analysis
- Test voice analysis
- Test recommendations filtering

### Step 5: Remove Local Analysis (Optional)
Once backend is working, optionally remove unused local analysis functions to reduce bundle size.

## API Endpoints Used by Frontend

| Feature | Endpoint | Method |
|---------|----------|--------|
| Single Review | `/api/analyze` | POST |
| Batch CSV | `/api/batch-analyze` | POST |
| Get Recommendations | `/api/recommendations/all` | GET |
| Filter Recommendations | `/api/recommendations/filter` | GET |
| Roadmap | `/api/recommendations/roadmap` | GET |
| Health Check | `/api/health` | GET |

## Error Handling

Add try-catch for all API calls:

```javascript
async function analyzeWithErrorHandling(text) {
  try {
    const response = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    // Check HTTP status
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for API errors in response
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    // Handle network errors, parsing errors, API errors
    console.error('Analysis error:', error);
    showErrorMessage(error.message);
    return null;
  }
}
```

## CORS Troubleshooting

If you see CORS errors:

1. **Check backend is running:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Check correct API URL in frontend:**
   - Should be: `http://localhost:5000/api/...`
   - Not: `http://localhost:5000`

3. **If using different ports/domains:**
   - Update CORS in `backend/app.py`
   - Change API URL in frontend

## Performance Improvements

### 1. Loading States
Show loading indicator while waiting for API response:
```javascript
showLoadingBar();
const data = await fetch(...);
hideLoadingBar();
```

### 2. Request Debouncing
For voice transcripts, debounce analysis requests:
```javascript
const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

const debouncedAnalyze = debounce(analyzeVoiceTranscript, 500);
```

### 3. Response Caching
Cache recent analysis results:
```javascript
const analysisCache = {};

async function analyzeWithCache(text) {
  if (analysisCache[text]) return analysisCache[text];
  
  const data = await fetch(...).then(r => r.json());
  analysisCache[text] = data;
  return data;
}
```

## Migration Checklist

- [ ] Backend server installed and running
- [ ] API endpoints tested with curl/Postman
- [ ] `analyzeReview()` updated to call `/api/analyze`
- [ ] `renderResults()` updated to use API response
- [ ] `processCSVFile()` updated to call `/api/batch-analyze`
- [ ] Voice analysis updated with API call
- [ ] Error handling added to all API calls
- [ ] CORS errors resolved
- [ ] All features tested in frontend
- [ ] Console shows no errors

## Rollback Plan

If API integration causes issues:

1. Keep old local analysis functions commented out
2. Revert function calls to use local analysis
3. Disable API calls temporarily
4. Debug backend server

## Next Steps

1. Implement authentication for production
2. Add caching layer (Redis)
3. Deploy backend to cloud (Heroku, AWS, GCP)
4. Implement rate limiting
5. Add API monitoring and logging
6. Setup CI/CD pipeline for deployments

---

For questions, refer to `backend/API_DOCUMENTATION.md` for complete API reference.
