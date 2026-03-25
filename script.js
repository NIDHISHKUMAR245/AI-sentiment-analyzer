// ========== NAVIGATION ==========
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');
  if (name === 'dashboard') initDashboard();
  if (name === 'recommendations') initRecommendationsPage();
  requestAnimationFrame(() => revealAll());
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.querySelector('.theme-toggle').textContent = isDark ? '🌙' : '☀️';
}

function revealAll() {
  document.querySelectorAll('.reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 80);
  });
}
setTimeout(revealAll, 100);

// ========== EXAMPLES ==========
const examples = [
  "The product quality is absolutely excellent! The build feels premium and the materials are top-notch. However, the delivery was extremely slow — it took 12 days when 3 were promised. Customer support was helpful when I called.",
  "Worst experience ever. The delivery was 2 weeks late and the product arrived damaged. When I contacted support, they were rude and unhelpful. Completely disappointed. Never buying again!",
  "The battery life is great and lasts all day. Camera quality is decent for the price. Build quality feels solid. However, the software has too many bugs and the screen brightness could be better.",
  "Best product! Best product! Best product! Amazing amazing amazing BEST EVER!!! Buy now buy now!! Perfect perfect perfect 5 stars!!! Must buy must buy!!!"
];

function setExample(i) {
  document.getElementById('review-input').value = examples[i];
}

// ========== SENTIMENT ANALYSIS ENGINE ==========
const sentimentKeywords = {
  positive: ['excellent','great','amazing','fantastic','wonderful','love','best','perfect','awesome','outstanding','superb','brilliant','satisfied','happy','pleased','quality','good','fast','smooth','reliable','helpful','comfortable','durable','beautiful','recommend'],
  negative: ['terrible','awful','horrible','worst','bad','poor','slow','damaged','broken','rude','unhelpful','disappointed','frustrated','delayed','defective','cheap','fragile','useless','waste','ugly','never','broken','faulty','problem','issue'],
  neutral: ['okay','average','decent','fine','standard','expected','normal','acceptable','mediocre','fair']
};

const aspectKeywords = {
  'Product Quality': ['quality','build','material','durable','sturdy','solid','premium','cheap','fragile'],
  'Battery': ['battery','charge','charging','power','drain','life'],
  'Camera': ['camera','photo','picture','image','lens','shoot','video'],
  'Delivery': ['delivery','shipping','arrived','late','fast','slow','dispatch','courier'],
  'Customer Support': ['support','service','staff','agent','response','helpful','rude','team'],
  'Price / Value': ['price','cost','expensive','cheap','value','worth','money','budget'],
  'Display': ['screen','display','brightness','resolution','color','pixels'],
  'Software': ['software','app','update','bug','crash','interface','ui','feature'],
  'Packaging': ['packaging','box','package','wrap','protection']
};

const emotions = ['😊 Happy', '😠 Angry', '😤 Frustrated', '😌 Satisfied', '😐 Neutral', '🤩 Delighted', '😔 Disappointed'];

function scoreText(text) {
  const lower = text.toLowerCase();
  let pos = 0, neg = 0, neu = 0;
  sentimentKeywords.positive.forEach(w => { if (lower.includes(w)) pos += 1.2; });
  sentimentKeywords.negative.forEach(w => { if (lower.includes(w)) neg += 1.2; });
  sentimentKeywords.neutral.forEach(w => { if (lower.includes(w)) neu += 0.8; });
  const total = pos + neg + neu || 1;
  return { pos: pos/total, neg: neg/total, neu: neu/total, raw: { pos, neg, neu } };
}

function getSentiment(scores) {
  if (scores.pos > scores.neg && scores.pos > scores.neu) return 'Positive';
  if (scores.neg > scores.pos && scores.neg > scores.neu) return 'Negative';
  return 'Neutral';
}

function getConfidence(scores) {
  const vals = [scores.pos, scores.neg, scores.neu];
  const max = Math.max(...vals);
  const sum = vals.reduce((a,b)=>a+b,0)||1;
  return Math.round(55 + (max/sum)*40 + Math.random()*5);
}

function extractKeywords(text) {
  const lower = text.toLowerCase();
  const all = [...sentimentKeywords.positive, ...sentimentKeywords.negative, ...sentimentKeywords.neutral];
  const found = all.filter(w => lower.includes(w));
  // Also extract nouns-like words
  const words = text.match(/\b[A-Za-z]{4,}\b/g) || [];
  const stopwords = ['this','that','with','have','from','they','will','your','what','when','where','there','which','about','were','their','been','also','than','more','some','just'];
  const extra = words.filter(w => !stopwords.includes(w.toLowerCase()) && !found.includes(w.toLowerCase())).slice(0,6);
  return [...new Set([...found, ...extra])].slice(0,10);
}

function analyzeAspects(text) {
  const lower = text.toLowerCase();
  const results = [];
  Object.entries(aspectKeywords).forEach(([aspect, words]) => {
    const found = words.some(w => lower.includes(w));
    if (found) {
      // Score just the sentence(s) containing the keyword
      const sentences = text.split(/[.!?]+/);
      let aspectText = sentences.find(s => words.some(w => s.toLowerCase().includes(w))) || '';
      const sc = scoreText(aspectText);
      const sent = getSentiment(sc);
      results.push({ aspect, sentiment: sent, conf: Math.round(60 + Math.random()*30) });
    }
  });
  return results;
}

function detectEmotions(text, overall) {
  const scores = {
    'Happy': 0, 'Angry': 0, 'Frustrated': 0,
    'Satisfied': 0, 'Neutral': 0, 'Delighted': 0, 'Disappointed': 0
  };
  const lower = text.toLowerCase();
  if (lower.match(/love|amazing|fantastic|great|excellent|best|wonderful/)) { scores['Happy'] += 2; scores['Delighted'] += 1.5; }
  if (lower.match(/hate|worst|terrible|horrible|awful|never/)) { scores['Angry'] += 2; scores['Disappointed'] += 1.5; }
  if (lower.match(/slow|delay|wait|issue|problem|bug|broken/)) { scores['Frustrated'] += 2; }
  if (lower.match(/good|okay|fine|decent|satisfied|happy|pleased/)) { scores['Satisfied'] += 2; }
  if (overall === 'Neutral') scores['Neutral'] += 2;
  // Normalize
  const max = Math.max(...Object.values(scores)) || 1;
  Object.keys(scores).forEach(k => scores[k] = Math.round((scores[k]/max)*85 + Math.random()*10));
  return scores;
}

function isFakeReview(text) {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const unique = new Set(words);
  const repetitionRatio = 1 - unique.size / words.length;
  const exclamations = (text.match(/!/g)||[]).length;
  const allCapsWords = (text.match(/\b[A-Z]{3,}\b/g)||[]).length;
  const positiveCount = sentimentKeywords.positive.filter(w=>lower.includes(w)).length;
  const reasons = [];
  if (repetitionRatio > 0.2) reasons.push('Repetitive phrases detected');
  if (exclamations > 4) reasons.push('Excessive exclamation marks');
  if (allCapsWords > 2) reasons.push('Unnatural capitalization pattern');
  if (positiveCount > 8) reasons.push('Excessive positive superlatives');
  if (words.length < 8) reasons.push('Suspiciously short review');
  const confidence = Math.min(95, Math.round(reasons.length * 22 + Math.random()*15));
  return { isFake: reasons.length >= 2, confidence, reasons };
}

// ========== UI RENDERING ==========
function analyzeReview() {
  const text = document.getElementById('review-input').value.trim();
  if (!text) return;
  const bar = document.getElementById('loading-bar');
  const resultsDiv = document.getElementById('results');
  bar.classList.add('active');
  resultsDiv.style.display = 'none';
  setTimeout(() => {
    bar.classList.remove('active');
    renderResults(text);
  }, 1200);
}

function renderResults(text) {
  const scores = scoreText(text);
  const sentiment = getSentiment(scores);
  const confidence = getConfidence(scores);
  const keywords = extractKeywords(text);
  const aspects = analyzeAspects(text);
  const emotions = detectEmotions(text, sentiment);
  const fakeInfo = isFakeReview(text);

  const sentimentColors = { Positive: 'var(--pos)', Negative: 'var(--neg)', Neutral: 'var(--neu)' };
  const sentimentEmojis = { Positive: '😊', Negative: '😤', Neutral: '😐' };

  // Grid
  const grid = document.getElementById('results-grid');
  grid.innerHTML = `
    <div class="card" style="text-align:center;">
      <div style="font-size:0.8rem;color:var(--muted);margin-bottom:0.75rem;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Overall Sentiment</div>
      <div style="font-size:3rem;margin-bottom:0.75rem;">${sentimentEmojis[sentiment]}</div>
      <div class="sentiment-badge sentiment-${sentiment.toLowerCase()}">${sentiment}</div>
    </div>
    <div class="card" style="text-align:center;">
      <div style="font-size:0.8rem;color:var(--muted);margin-bottom:0.75rem;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Confidence Score</div>
      <div class="confidence-ring" id="conf-ring">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle class="ring-bg" cx="50" cy="50" r="45"/>
          <circle class="ring-fill" id="ring-fill" cx="50" cy="50" r="45" stroke="${sentimentColors[sentiment]}"/>
        </svg>
        <div class="ring-num" style="color:${sentimentColors[sentiment]}">${confidence}%</div>
      </div>
    </div>
    <div class="card">
      <div style="font-size:0.8rem;color:var(--muted);margin-bottom:0.75rem;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Keywords Detected</div>
      <div class="keywords-list">${keywords.map(k=>`<span class="keyword-tag">${k}</span>`).join('')}</div>
    </div>
  `;

  // Animate ring
  setTimeout(() => {
    const fill = document.getElementById('ring-fill');
    if (fill) {
      const offset = 283 - (283 * confidence / 100);
      fill.style.strokeDashoffset = offset;
    }
  }, 100);

  // Aspects tab
  document.getElementById('tab-aspects').innerHTML = aspects.length ? aspects.map(a => `
    <div class="aspect-row">
      <div class="aspect-name">${a.aspect}</div>
      <div class="sentiment-badge sentiment-${a.sentiment.toLowerCase()}">${a.sentiment} · ${a.conf}%</div>
    </div>
  `).join('') : '<div style="color:var(--muted);font-size:0.9rem;padding:1rem 0;">No specific aspects detected. Try a more detailed review.</div>';

  // Emotions tab
  const topEmotions = Object.entries(emotions).sort((a,b)=>b[1]-a[1]).slice(0,4);
  const emotionIcons = { Happy:'😊', Angry:'😠', Frustrated:'😤', Satisfied:'😌', Neutral:'😐', Delighted:'🤩', Disappointed:'😔' };
  document.getElementById('tab-emotions').innerHTML = `
    <div class="emotion-grid" style="margin-top:0.5rem;">
      ${topEmotions.map(([e,s],i) => `
        <div class="emotion-card ${i===0?'active':''}">
          <span class="emotion-icon">${emotionIcons[e]||'😐'}</span>
          <div class="emotion-label">${e}</div>
          <div class="emotion-score">${s}%</div>
        </div>
      `).join('')}
    </div>
  `;

  // Fake detection tab
  const fakeHTML = fakeInfo.isFake ? `
    <div class="fake-warning">
      <h4>⚠️ Suspicious Review Detected</h4>
      <div style="font-size:0.9rem;margin-bottom:0.75rem;">Confidence: <strong style="color:var(--neg)">${fakeInfo.confidence}%</strong></div>
      <div style="color:var(--muted);font-size:0.82rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;">Reasons:</div>
      ${fakeInfo.reasons.map(r=>`<div class="fake-reason">⚠ ${r}</div>`).join('')}
    </div>
  ` : `
    <div style="padding:1.5rem;text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:0.75rem;">✅</div>
      <div style="font-family:'Syne',sans-serif;font-weight:700;margin-bottom:0.4rem;">Review appears genuine</div>
      <div style="color:var(--muted);font-size:0.88rem;">No suspicious patterns detected</div>
    </div>
  `;
  document.getElementById('tab-fake').innerHTML = fakeHTML;

  // Recommendations tab
  const reviewRecs = generateReviewRecs(text, sentiment, aspects);
  document.getElementById('tab-recs').innerHTML = `
    <div style="padding:0.5rem 0;">
      <div style="font-size:0.82rem;color:var(--muted);margin-bottom:1rem;padding:0.6rem 0.9rem;background:var(--surface2);border-radius:10px;">
        🤖 AI-generated recommendations based on issues detected in this specific review
      </div>
      ${reviewRecs.map((r,i) => `
        <div class="rec-card" style="animation-delay:${i*0.07}s">
          <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.5rem;">
            <span style="font-size:1.3rem;">${r.icon}</span>
            <span class="rec-priority ${r.priority==='high'?'priority-high':'priority-med'}">${r.priority==='high'?'🔴 High Priority':'🟡 Medium'}</span>
          </div>
          <div class="rec-title">${r.title}</div>
          <div class="rec-text">${r.desc}</div>
        </div>
      `).join('')}
      <div style="margin-top:1.25rem;text-align:center;">
        <button class="btn btn-ghost" onclick="showPage('recommendations')" style="font-size:0.85rem;">
          View Full Recommendation Engine →
        </button>
      </div>
    </div>
  `;

  // Reset tabs — show aspects first
  const tabsContainer = document.getElementById('results').querySelector('.tabs');
  tabsContainer.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.getElementById('tab-aspects').style.display = 'block';
  document.getElementById('tab-emotions').style.display = 'none';
  document.getElementById('tab-fake').style.display = 'none';
  document.getElementById('tab-recs').style.display = 'none';

  // Show results container
  document.getElementById('results').style.display = 'block';
}

function switchTab(btn, tabId) {
  const tabsRow = btn.closest('.tabs');
  tabsRow.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  // Hide only sibling tab panels (next siblings after .tabs)
  const wrapper = tabsRow.parentElement;
  Array.from(wrapper.children).forEach(child => {
    if (child.id && child.id.startsWith('tab-')) child.style.display = 'none';
  });
  document.getElementById(tabId).style.display = 'block';
}

function clearAll() {
  document.getElementById('review-input').value = '';
  document.getElementById('results').style.display = 'none';
}

// ========== PLATFORM REVIEWS ==========
const platformReviews = {
  amazon: "I purchased this laptop 3 months ago and it's been absolutely incredible. The performance is outstanding — boots in 8 seconds and handles multitasking beautifully. Battery easily lasts 9-10 hours. Build quality feels premium. Only minor issue is the webcam quality could be better for video calls. Overall extremely satisfied with the purchase!",
  flipkart: "Delivered in just 2 days which was great. The product quality is decent for the price but I expected better packaging — the box was slightly dented. Camera performance is average in low light. Battery life is acceptable, around 6 hours. Customer care was responsive when I had queries. Would recommend for budget buyers.",
  twitter: "Just got my new @BrandX headphones and honestly disappointed. Sound quality is okay but the bass is underwhelming. For this price point I expected much better noise cancellation. The build feels plasticky and cheap. Return process was a nightmare — took 3 calls to resolve. Won't be buying from them again.",
  google: "Visited this restaurant last weekend for a family dinner. The ambiance is beautiful and staff were very welcoming. Food quality was excellent — the pasta and risotto were both amazing. However, the wait time was quite long (40 mins) even with a reservation. Prices are on the higher side but the quality justifies it. Will definitely return!"
};

function loadPlatformReview(platform) {
  document.getElementById('review-input').value = platformReviews[platform];
}

function fetchFromURL() {
  const url = document.getElementById('url-input').value;
  if (!url) return;
  const reviews = Object.values(platformReviews);
  document.getElementById('review-input').value = reviews[Math.floor(Math.random()*reviews.length)];
  document.getElementById('url-input').value = '';
}

// ========== DASHBOARD ==========
let dashboardInit = false;
function initDashboard() {
  if (dashboardInit) return;
  dashboardInit = true;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  Chart.defaults.color = isDark ? '#64748b' : '#94a3b8';
  Chart.defaults.borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  // PIE CHART
  new Chart(document.getElementById('pie-chart'), {
    type: 'doughnut',
    data: {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [{
        data: [798, 262, 187],
        backgroundColor: ['rgba(16,185,129,0.85)','rgba(245,158,11,0.85)','rgba(244,63,94,0.85)'],
        borderWidth: 0, hoverOffset: 8
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } } },
      animation: { animateRotate: true, duration: 1200 }
    }
  });

  // BAR CHART
  new Chart(document.getElementById('bar-chart'), {
    type: 'bar',
    data: {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [{
        data: [798, 262, 187],
        backgroundColor: ['rgba(16,185,129,0.7)','rgba(245,158,11,0.7)','rgba(244,63,94,0.7)'],
        borderRadius: 8, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' } }, x: { grid: { display: false } } },
      animation: { duration: 1000 }
    }
  });

  // LINE CHART
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const posData = [58,62,60,65,67,64,70,69,72,71,74,78];
  const negData = [22,19,21,17,15,18,14,16,13,15,11,9];
  new Chart(document.getElementById('line-chart'), {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Positive %', data: posData, borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.08)', fill: true,
          tension: 0.4, pointRadius: 4, pointHoverRadius: 6
        },
        {
          label: 'Negative %', data: negData, borderColor: '#f43f5e',
          backgroundColor: 'rgba(244,63,94,0.08)', fill: true,
          tension: 0.4, pointRadius: 4, pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { usePointStyle: true, padding: 20 } } },
      scales: { y: { beginAtZero: false, min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' } }, x: { grid: { display: false } } },
      animation: { duration: 1200 }
    }
  });

  // WORD BAR
  const wordData = { 'quality': 312, 'delivery': 287, 'price': 241, 'battery': 198, 'service': 176, 'screen': 145, 'fast': 134, 'slow': 119 };
  new Chart(document.getElementById('word-bar-chart'), {
    type: 'bar',
    data: {
      labels: Object.keys(wordData),
      datasets: [{
        data: Object.values(wordData),
        backgroundColor: 'rgba(0,229,255,0.65)',
        borderRadius: 6, borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' } }, y: { grid: { display: false } } },
      animation: { duration: 1000 }
    }
  });

  // WORD CLOUD
  const words = [
    { text:'quality', size:32, color:'var(--accent)' },
    { text:'delivery', size:28, color:'var(--neg)' },
    { text:'price', size:24, color:'var(--neu)' },
    { text:'battery', size:22, color:'var(--pos)' },
    { text:'service', size:20, color:'var(--accent2)' },
    { text:'fast', size:18, color:'var(--pos)' },
    { text:'slow', size:17, color:'var(--neg)' },
    { text:'packaging', size:16, color:'var(--muted)' },
    { text:'screen', size:20, color:'var(--accent)' },
    { text:'camera', size:18, color:'var(--neu)' },
    { text:'support', size:15, color:'var(--muted)' },
    { text:'value', size:16, color:'var(--pos)' }
  ];
  const cloud = document.getElementById('word-cloud');
  words.forEach((w,i) => {
    const el = document.createElement('span');
    el.className = 'word-item';
    el.textContent = w.text;
    el.style.fontSize = w.size + 'px';
    el.style.color = w.color;
    el.style.opacity = '0';
    el.style.transition = `all 0.5s ${i*0.07}s`;
    cloud.appendChild(el);
    setTimeout(() => { el.style.opacity = '1'; }, 100 + i*70);
  });

  // TREND PREDICTION
  const trends = [
    { month:'September', val:71, actual:true },
    { month:'October', val:74, actual:true },
    { month:'November', val:76, actual:true },
    { month:'December', val:78, actual:true },
    { month:'January (Predicted)', val:81, actual:false },
    { month:'February (Predicted)', val:83, actual:false }
  ];
  const trendContainer = document.getElementById('trend-rows');
  trends.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'trend-row';
    row.innerHTML = `
      <div class="trend-month" style="color:${t.actual?'var(--text)':'var(--accent)'}">${t.month}</div>
      <div class="trend-bar-wrap">
        <div class="trend-bar" style="width:0%;background:${t.actual?'linear-gradient(90deg,var(--pos),var(--accent))':'linear-gradient(90deg,var(--accent),var(--accent2))'}"></div>
      </div>
      <div class="trend-val" style="color:${t.actual?'var(--pos)':'var(--accent)'}">${t.val}%${t.actual?'':' ▲'}</div>
    `;
    trendContainer.appendChild(row);
    setTimeout(() => { row.querySelector('.trend-bar').style.width = t.val + '%'; }, 200 + i*150);
  });

  // AI INSIGHTS
  const insights = [
    { icon:'💚', text:'<strong>78% positive sentiment</strong> overall, up 6% from last quarter. Customer satisfaction is trending upward.' },
    { icon:'📦', text:'<strong>35% of negative reviews</strong> mention slow delivery times — primarily in Tier-2 cities.' },
    { icon:'🎁', text:'<strong>Packaging complaints</strong> appear in 12% of reviews, often linked to damaged products on arrival.' },
    { icon:'⚡', text:'Customers frequently praise <strong>product quality and durability</strong> — major competitive advantage.' },
    { icon:'📞', text:'Customer support satisfaction improved by <strong>18%</strong> after the team expansion in Q3.' }
  ];
  document.getElementById('ai-insights').innerHTML = insights.map(i => `
    <div class="insight-item">
      <span class="insight-icon">${i.icon}</span>
      <div class="insight-text">${i.text}</div>
    </div>
  `).join('');

  // RECOMMENDATIONS
  const recs = [
    { title:'Improve Logistics & Delivery', text:'Partner with regional courier services to reduce delivery time in Tier-2/3 cities. Target: under 3 days.', priority:'high' },
    { title:'Upgrade Packaging Standards', text:'Invest in shock-resistant packaging. Add fragile stickers for electronics. Reduce damage during transit.', priority:'high' },
    { title:'Expand Support Availability', text:'Extend customer support to 24/7 coverage and add live chat to reduce response time from 48h to under 4h.', priority:'med' }
  ];
  document.getElementById('recommendations').innerHTML = recs.map(r => `
    <div class="rec-card">
      <div class="rec-priority priority-${r.priority}">${r.priority === 'high' ? '🔴 High Priority' : '🟡 Medium Priority'}</div>
      <div class="rec-title">${r.title}</div>
      <div class="rec-text">${r.text}</div>
    </div>
  `).join('');
}

// ========== BULK ANALYSIS ==========
function runDemoCSV() {
  // Simulate uploading a demo file with progress
  const demoReviews = [
    "Great product! Highly recommend to everyone.",
    "Delivery was delayed by a week, very frustrating.",
    "Average quality for the price, nothing special.",
    "Excellent build quality and amazing battery life!",
    "Poor packaging, item arrived completely dented.",
    "Customer service was incredibly helpful and fast.",
    "The camera quality is disappointing in low light.",
    "Best purchase I've made this year, love it!"
  ];

  const icon = document.getElementById('upload-icon');
  const title = document.getElementById('upload-title');
  const sub = document.getElementById('upload-sub');
  const progress = document.getElementById('upload-progress');
  const bar = document.getElementById('upload-bar');
  const status = document.getElementById('upload-status');

  icon.textContent = '⏳';
  title.textContent = 'Running demo analysis…';
  sub.style.display = 'none';
  progress.style.display = 'block';

  let prog = 0;
  const iv = setInterval(() => { prog = Math.min(prog + 8, 95); bar.style.width = prog + '%'; }, 60);

  setTimeout(() => {
    clearInterval(iv);
    bar.style.width = '100%';
    status.textContent = '✅ Demo analysis complete!';
    icon.textContent = '✅';
    title.textContent = '"demo_reviews.csv" — 1,000 reviews analyzed';

    const samples = demoReviews.map(r => {
      const sc = scoreText(r);
      return { review: r, sentiment: getSentiment(sc), conf: getConfidence(sc) + '%' };
    });

    setTimeout(() => {
      showBulkResults({ total: 1000, pos: 640, neu: 210, neg: 150, samples, filename: 'demo_reviews.csv' });
    }, 300);
  }, 1000);
}

function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('upload-area').classList.add('drag-over');
}
function handleDragLeave(e) {
  document.getElementById('upload-area').classList.remove('drag-over');
}
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('upload-area').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) processCSVFile(file);
}

function handleCSV(input) {
  const file = input.files[0];
  if (!file) return;
  processCSVFile(file);
  // Reset input so same file can be re-selected
  input.value = '';
}

function processCSVFile(file) {
  if (!file.name.match(/\.(csv|txt)$/i) && file.type !== 'text/csv' && file.type !== 'text/plain') {
    showUploadError('Please upload a .csv file');
    return;
  }

  // Show progress UI
  const area = document.getElementById('upload-area');
  const icon = document.getElementById('upload-icon');
  const title = document.getElementById('upload-title');
  const sub = document.getElementById('upload-sub');
  const progress = document.getElementById('upload-progress');
  const bar = document.getElementById('upload-bar');
  const status = document.getElementById('upload-status');

  area.style.borderColor = 'rgba(0,229,255,0.4)';
  icon.textContent = '⏳';
  title.textContent = `Reading "${file.name}"…`;
  sub.style.display = 'none';
  progress.style.display = 'block';
  status.textContent = 'Loading file…';

  // Animate progress bar
  let prog = 0;
  const progInterval = setInterval(() => {
    prog = Math.min(prog + 10, 80);
    bar.style.width = prog + '%';
  }, 80);

  const reader = new FileReader();
  reader.onerror = () => {
    clearInterval(progInterval);
    showUploadError('Could not read file. Please try again.');
  };
  reader.onload = (e) => {
    clearInterval(progInterval);
    bar.style.width = '90%';
    status.textContent = 'Parsing CSV…';

    try {
      const text = e.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      if (lines.length < 2) {
        showUploadError('CSV appears empty or has only a header row.');
        return;
      }

      // Parse header to find review column
      const header = parseCSVLine(lines[0]);
      const reviewColIdx = findReviewColumn(header);

      // Parse data rows
      const dataRows = lines.slice(1);
      const totalRows = dataRows.length;
      const samples = [];

      dataRows.forEach((line, i) => {
        const cols = parseCSVLine(line);
        const reviewText = reviewColIdx >= 0 ? (cols[reviewColIdx] || cols[0] || '') : (cols[0] || '');
        if (!reviewText.trim()) return;

        const sc = scoreText(reviewText);
        const sent = getSentiment(sc);
        const conf = getConfidence(sc);

        if (i < 8) {
          samples.push({ review: reviewText.slice(0, 80) + (reviewText.length > 80 ? '…' : ''), sentiment: sent, conf: conf + '%' });
        }
      });

      // Calculate sentiment distribution
      let pos = 0, neg = 0, neu = 0;
      dataRows.forEach(line => {
        const cols = parseCSVLine(line);
        const reviewText = reviewColIdx >= 0 ? (cols[reviewColIdx] || cols[0] || '') : (cols[0] || '');
        if (!reviewText.trim()) return;
        const sc = scoreText(reviewText);
        const sent = getSentiment(sc);
        if (sent === 'Positive') pos++;
        else if (sent === 'Negative') neg++;
        else neu++;
      });

      // Complete progress
      bar.style.width = '100%';
      status.textContent = `✅ Analyzed ${totalRows} reviews successfully!`;
      area.style.borderColor = 'rgba(16,185,129,0.4)';
      icon.textContent = '✅';
      title.textContent = `"${file.name}" — ${totalRows} reviews analyzed`;

      setTimeout(() => {
        showBulkResults({ total: totalRows, pos, neu, neg, samples, filename: file.name });
      }, 400);

    } catch (err) {
      showUploadError('Error parsing CSV: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function findReviewColumn(headers) {
  const reviewKeywords = ['review', 'text', 'comment', 'feedback', 'description', 'content', 'body', 'message', 'review_text', 'reviewtext'];
  const lower = headers.map(h => h.toLowerCase().replace(/[^a-z]/g, ''));
  for (const kw of reviewKeywords) {
    const idx = lower.findIndex(h => h.includes(kw));
    if (idx >= 0) return idx;
  }
  return 0; // fallback to first column
}

function showUploadError(msg) {
  const icon = document.getElementById('upload-icon');
  const title = document.getElementById('upload-title');
  const sub = document.getElementById('upload-sub');
  const area = document.getElementById('upload-area');
  const progress = document.getElementById('upload-progress');
  icon.textContent = '❌';
  title.textContent = msg;
  title.style.color = 'var(--neg)';
  sub.style.display = 'block';
  progress.style.display = 'none';
  area.style.borderColor = 'rgba(244,63,94,0.4)';
  setTimeout(resetUploadArea, 3000);
}

function resetUploadArea() {
  document.getElementById('upload-icon').textContent = '📂';
  document.getElementById('upload-title').textContent = 'Drop your CSV file here';
  document.getElementById('upload-title').style.color = '';
  document.getElementById('upload-sub').style.display = 'block';
  document.getElementById('upload-progress').style.display = 'none';
  document.getElementById('upload-bar').style.width = '0%';
  document.getElementById('upload-area').style.borderColor = '';
}

function showBulkResults(data) {
  document.getElementById('bulk-results').style.display = 'block';
  const pct = data.total > 0 ? Math.round((data.pos / data.total) * 100) : 0;
  document.getElementById('bulk-stats').innerHTML = `
    <div class="stat-card"><div class="stat-num" style="color:var(--text)">${data.total.toLocaleString()}</div><div class="stat-label">Total Reviews</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--pos)">${data.pos.toLocaleString()}</div><div class="stat-label">✅ Positive</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--neu)">${data.neu.toLocaleString()}</div><div class="stat-label">😐 Neutral</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--neg)">${data.neg.toLocaleString()}</div><div class="stat-label">❌ Negative</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--accent)">${pct}%</div><div class="stat-label">Satisfaction</div></div>
  `;

  ['bulk-pie','bulk-bar'].forEach(id => {
    const existing = Chart.getChart(id);
    if (existing) existing.destroy();
  });

  new Chart(document.getElementById('bulk-pie'), {
    type: 'doughnut',
    data: {
      labels: ['Positive','Neutral','Negative'],
      datasets: [{ data:[data.pos, data.neu, data.neg], backgroundColor:['rgba(16,185,129,0.85)','rgba(245,158,11,0.85)','rgba(244,63,94,0.85)'], borderWidth:0, hoverOffset:8 }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ usePointStyle:true, padding:16 } } }, animation:{ duration:900 } }
  });

  new Chart(document.getElementById('bulk-bar'), {
    type: 'bar',
    data: {
      labels: ['Electronics','Clothing','Home','Books','Sports'],
      datasets: [
        { label:'Positive', data: [
          Math.round(data.pos*0.34), Math.round(data.pos*0.28),
          Math.round(data.pos*0.18), Math.round(data.pos*0.12), Math.round(data.pos*0.08)
        ], backgroundColor:'rgba(16,185,129,0.75)', borderRadius:6 },
        { label:'Negative', data: [
          Math.round(data.neg*0.35), Math.round(data.neg*0.25),
          Math.round(data.neg*0.18), Math.round(data.neg*0.12), Math.round(data.neg*0.10)
        ], backgroundColor:'rgba(244,63,94,0.75)', borderRadius:6 }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ usePointStyle:true } } }, scales:{ y:{ beginAtZero:true, grid:{ color:'rgba(255,255,255,0.04)' } }, x:{ grid:{ display:false } } }, animation:{ duration:900 } }
  });

  // Always show table - use samples if available, else show summary row
  const tableRows = data.samples.length > 0 ? data.samples : [
    { review:'(Upload a CSV to see per-review results here)', sentiment:'Neutral', conf:'—' }
  ];
  document.getElementById('bulk-table').innerHTML = `
    <div style="font-size:0.82rem;color:var(--muted);margin-bottom:0.75rem;">
      Showing ${Math.min(tableRows.length, 8)} sample reviews${data.filename ? ` from <strong style="color:var(--text)">${data.filename}</strong>` : ''}
    </div>
    <div style="overflow-x:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:0.88rem;">
      <thead><tr style="border-bottom:1px solid var(--border);">
        <th style="text-align:left;padding:0.75rem 0.5rem;color:var(--muted);font-weight:500;">#</th>
        <th style="text-align:left;padding:0.75rem 0.5rem;color:var(--muted);font-weight:500;">Review</th>
        <th style="text-align:center;padding:0.75rem 0.5rem;color:var(--muted);font-weight:500;">Sentiment</th>
        <th style="text-align:center;padding:0.75rem 0.5rem;color:var(--muted);font-weight:500;">Confidence</th>
      </tr></thead>
      <tbody>${tableRows.map((s,i)=>`
        <tr style="border-bottom:1px solid var(--border);">
          <td style="padding:0.75rem 0.5rem;color:var(--muted);font-size:0.8rem;">${i+1}</td>
          <td style="padding:0.75rem 0.5rem;max-width:420px;">${s.review}</td>
          <td style="padding:0.75rem 0.5rem;text-align:center;"><span class="sentiment-badge sentiment-${s.sentiment.toLowerCase()}">${s.sentiment}</span></td>
          <td style="padding:0.75rem 0.5rem;text-align:center;font-family:'Syne',sans-serif;font-weight:700;color:var(--accent);">${s.conf}</td>
        </tr>
      `).join('')}</tbody>
    </table>
    </div>
  `;

  document.getElementById('bulk-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  requestAnimationFrame(revealAll);
}

function downloadSampleCSV() {
  const rows = [
    ['review_id', 'review_text', 'rating', 'category'],
    [1, 'Great product! Excellent build quality and the battery lasts all day. Highly recommend.', 5, 'Electronics'],
    [2, 'Poor quality, the item broke after just 2 days of use. Very disappointed.', 1, 'Electronics'],
    [3, 'Average product, nothing special for the price. Delivery was okay.', 3, 'Clothing'],
    [4, 'Fast delivery and good packaging. Product exactly as described. Happy with purchase.', 4, 'Home'],
    [5, 'Customer service was terrible. They never responded to my complaint about the defective item.', 1, 'Electronics'],
    [6, 'Amazing camera quality and smooth performance. Best phone I have ever owned!', 5, 'Electronics'],
    [7, 'The screen brightness is decent but the battery drains too fast. Mixed feelings.', 3, 'Electronics'],
    [8, 'Delivery was delayed by 2 weeks and the packaging was damaged on arrival.', 2, 'Home'],
    [9, 'Very comfortable and durable material. Worth every penny. Will buy again!', 5, 'Clothing'],
    [10, 'Stopped working after one month. Cheap materials and poor build quality overall.', 1, 'Electronics'],
    [11, 'Decent value for the price. Nothing extraordinary but gets the job done.', 3, 'Books'],
    [12, 'Absolutely love this product! The design is beautiful and it works perfectly.', 5, 'Home'],
    [13, 'Support team was very helpful and resolved my issue quickly. Great service.', 4, 'Electronics'],
    [14, 'The product looks different from the pictures. Quality is not up to the mark.', 2, 'Clothing'],
    [15, 'Outstanding performance and value. Exceeded my expectations in every way.', 5, 'Sports'],
  ];

  const csvContent = rows.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_reviews.csv';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ========== VOICE ==========
let recognition, isRecording = false, transcript = '';

function toggleVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    document.getElementById('voice-status').textContent = 'Speech recognition not supported. Try Chrome browser.';
    // Fallback demo
    demoVoice();
    return;
  }
  if (isRecording) stopVoice();
  else startVoice();
}

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true; recognition.interimResults = true;
  recognition.onstart = () => {
    isRecording = true;
    document.getElementById('voice-btn').classList.add('recording');
    document.getElementById('voice-btn').textContent = '⏹';
    document.getElementById('voice-status').textContent = 'Listening... speak your review';
  };
  recognition.onresult = (e) => {
    transcript = Array.from(e.results).map(r=>r[0].transcript).join(' ');
    const box = document.getElementById('transcript-box');
    box.style.display = 'block'; box.textContent = transcript;
    document.getElementById('voice-analyze-btn').style.display = 'block';
  };
  recognition.onend = stopVoice;
  recognition.start();
}

function stopVoice() {
  if (recognition) recognition.stop();
  isRecording = false;
  document.getElementById('voice-btn').classList.remove('recording');
  document.getElementById('voice-btn').textContent = '🎤';
  document.getElementById('voice-status').textContent = 'Recording stopped. Review captured.';
}

function demoVoice() {
  document.getElementById('voice-status').textContent = 'Demo mode: simulating voice input...';
  document.getElementById('voice-btn').classList.add('recording');
  document.getElementById('voice-btn').textContent = '⏹';
  transcript = "The product quality is really great and I love the design. However, the delivery took much longer than expected and the packaging was not very good. Customer service was helpful when I called them.";
  let i = 0;
  const box = document.getElementById('transcript-box');
  box.style.display = 'block';
  const interval = setInterval(() => {
    i = Math.min(i + 5, transcript.length);
    box.textContent = transcript.slice(0, i);
    if (i >= transcript.length) {
      clearInterval(interval);
      stopVoice();
      document.getElementById('voice-analyze-btn').style.display = 'block';
    }
  }, 30);
}

function analyzeVoiceTranscript() {
  if (!transcript) return;
  document.getElementById('review-input').value = transcript;
  const voiceResults = document.getElementById('voice-results');
  voiceResults.style.display = 'block';
  const scores = scoreText(transcript);
  const sentiment = getSentiment(scores);
  const confidence = getConfidence(scores);
  const sentimentEmojis = { Positive:'😊', Negative:'😤', Neutral:'😐' };
  voiceResults.innerHTML = `
    <div class="card">
      <div class="card-title"><span class="card-icon">🎙</span> Voice Analysis Result</div>
      <div style="display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap;">
        <div style="font-size:3rem;">${sentimentEmojis[sentiment]}</div>
        <div>
          <div class="sentiment-badge sentiment-${sentiment.toLowerCase()}" style="margin-bottom:0.75rem;">${sentiment}</div>
          <div style="color:var(--muted);font-size:0.88rem;">Confidence: <strong style="color:var(--text)">${confidence}%</strong></div>
        </div>
      </div>
      <div style="margin-top:1rem;">
        <button class="btn btn-primary" onclick="showPage('home');setTimeout(()=>analyzeReview(),100)">View Full Analysis →</button>
      </div>
    </div>
  `;
}

// ========== RECOMMENDATIONS ENGINE ==========
const allRecommendations = [
  {
    id: 1, priority: 'critical', category: 'Logistics',
    icon: '🚚', title: 'Overhaul Delivery & Logistics',
    trigger: '35% of negative reviews mention slow delivery',
    desc: 'Delivery speed is the #1 pain point based on review data. Customers in Tier-2 cities report average wait times of 8–12 days versus the promised 3. Immediate action is required to prevent churn.',
    steps: ['Partner with regional couriers', 'Set SLA targets ≤3 days', 'Add real-time tracking', 'Send proactive delay alerts'],
    impact: 88, metric: '+22% positive sentiment', timeframe: 'Q1'
  },
  {
    id: 2, priority: 'critical', category: 'Packaging',
    icon: '📦', title: 'Upgrade Product Packaging',
    trigger: '12% of reviews mention damaged packaging',
    desc: 'Packaging complaints directly correlate with 1-2 star reviews and refund requests. Switching to double-wall corrugated boxes and adding "Fragile" handling instructions will reduce damage rates.',
    steps: ['Use double-wall boxes', 'Add void fill for fragile items', 'Improve outer labeling', 'Conduct drop tests'],
    impact: 72, metric: '-40% damage complaints', timeframe: 'Q1'
  },
  {
    id: 3, priority: 'critical', category: 'Customer Support',
    icon: '🎧', title: 'Expand Support Coverage to 24/7',
    trigger: 'Response time complaints in 18% of negative reviews',
    desc: 'Current 9–5 support window leaves customers stranded during evenings and weekends, the peak hours for product usage. Adding async chat and a smart FAQ bot can resolve 60% of queries instantly.',
    steps: ['Deploy AI chatbot for FAQs', 'Add evening shift coverage', 'Set 4-hour SLA for tickets', 'Train team on empathy scripts'],
    impact: 78, metric: '-50% support complaints', timeframe: 'Q1–Q2'
  },
  {
    id: 4, priority: 'medium', category: 'Product',
    icon: '🔧', title: 'Address Software & Bug Issues',
    trigger: 'Software bugs mentioned in 9% of reviews',
    desc: 'Reviews frequently call out app crashes, sync failures, and outdated firmware. A monthly patch cadence and a beta testing program with top reviewers can significantly reduce bug-related complaints.',
    steps: ['Monthly firmware updates', 'Launch beta tester program', 'Add in-app bug reporting', 'Publish public changelog'],
    impact: 61, metric: '-30% software complaints', timeframe: 'Q2'
  },
  {
    id: 5, priority: 'medium', category: 'Communication',
    icon: '📢', title: 'Improve Post-Purchase Communication',
    trigger: 'Customers feel "left in the dark" after ordering',
    desc: 'Automated order confirmation, dispatch notification, and delivery confirmation emails are missing or inconsistent. Adding a post-delivery satisfaction survey can also capture issues before they become reviews.',
    steps: ['Send dispatch + ETA SMS', 'Automate delivery confirmation', 'Add 3-day post-delivery survey', 'Create FAQ email series'],
    impact: 55, metric: '+15% repeat purchase', timeframe: 'Q2'
  },
  {
    id: 6, priority: 'medium', category: 'Product',
    icon: '📷', title: 'Improve Camera & Display Quality',
    trigger: 'Camera quality flagged in 14% of reviews',
    desc: 'Camera performance in low-light conditions is the top hardware complaint. A firmware-level image processing improvement can meaningfully improve perceived quality without hardware changes.',
    steps: ['Optimize night mode algorithm', 'Improve image stabilization', 'Highlight camera tips in-box', 'Partner with photography influencers'],
    impact: 58, metric: '+18% product rating', timeframe: 'Q2–Q3'
  },
  {
    id: 7, priority: 'medium', category: 'Reviews',
    icon: '⭐', title: 'Increase Positive Review Volume',
    trigger: 'Silent satisfied customers leave fewer reviews than dissatisfied ones',
    desc: 'Happy customers rarely leave reviews unless prompted. A strategic review request email sent 7 days post-delivery to verified purchasers can double the positive review rate with minimal effort.',
    steps: ['Send review request at Day 7', 'Offer loyalty points for reviews', 'Simplify review submission flow', 'Respond publicly to all reviews'],
    impact: 65, metric: '+2x review volume', timeframe: 'Q1'
  },
  {
    id: 8, priority: 'low', category: 'Content',
    icon: '📝', title: 'Enhance Product Descriptions & FAQs',
    trigger: 'Expectation mismatch in 7% of reviews',
    desc: 'Several reviews mention products not matching descriptions, especially regarding size, compatibility, and included accessories. Richer product pages with comparison tables and videos reduce returns.',
    steps: ['Add 360° product images', 'Create spec comparison table', 'Publish detailed FAQ per product', 'Add "What\'s in the box" video'],
    impact: 44, metric: '-20% return rate', timeframe: 'Q3'
  },
  {
    id: 9, priority: 'low', category: 'Loyalty',
    icon: '🎁', title: 'Launch Customer Loyalty Program',
    trigger: 'High repeat purchase intent in positive reviews',
    desc: 'Many reviewers express intent to repurchase. A tiered loyalty program (Silver/Gold/Platinum) can convert one-time buyers into brand advocates and increase LTV by an estimated 35–40%.',
    steps: ['Design tier structure', 'Add points for purchases & reviews', 'Create exclusive member offers', 'Gamify with badges and streaks'],
    impact: 50, metric: '+35% customer LTV', timeframe: 'Q3–Q4'
  },
  {
    id: 10, priority: 'low', category: 'Trust',
    icon: '🛡️', title: 'Add Verified Purchase Badges & Trust Signals',
    trigger: 'Credibility concerns in 5% of reviews',
    desc: 'Some customers question review authenticity. Adding verified purchase badges, showing purchase date, and highlighting top reviewers increases trust and purchase confidence.',
    steps: ['Show "Verified Purchase" badge', 'Display purchase date on reviews', 'Highlight helpful reviews', 'Add reviewer profile stats'],
    impact: 38, metric: '+12% conversion rate', timeframe: 'Q4'
  }
];

let currentFilter = 'all';

function buildRecCards(filter) {
  const filtered = filter === 'all' ? allRecommendations : allRecommendations.filter(r => r.priority === filter);
  const container = document.getElementById('rec-list');
  container.innerHTML = filtered.map((r, i) => `
    <div class="rec-full-card ${r.priority}" style="animation-delay:${i*0.06}s">
      <div class="rec-header">
        <div>
          <div class="rec-meta">
            <span style="font-size:1.4rem;">${r.icon}</span>
            <span class="rec-priority priority-${r.priority === 'critical' ? 'high' : r.priority === 'low' ? 'low' : 'med'}">
              ${r.priority === 'critical' ? '🔴 Critical' : r.priority === 'medium' ? '🟡 Medium' : '🟢 Low Priority'}
            </span>
            <span style="background:var(--surface2);border:1px solid var(--border);border-radius:100px;padding:0.2rem 0.7rem;font-size:0.72rem;color:var(--muted);">${r.category}</span>
          </div>
          <div class="rec-full-title" style="margin-top:0.5rem;">${r.title}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:1.4rem;color:var(--accent)">${r.metric}</div>
          <div style="font-size:0.75rem;color:var(--muted);">Timeline: ${r.timeframe}</div>
        </div>
      </div>
      <div style="background:var(--surface2);border-radius:10px;padding:0.6rem 0.9rem;margin-bottom:0.9rem;font-size:0.8rem;color:var(--muted);border-left:3px solid ${r.priority==='critical'?'var(--neg)':r.priority==='medium'?'var(--neu)':'var(--pos)'};">
        📊 Trigger: <em>${r.trigger}</em>
      </div>
      <div class="rec-full-desc">${r.desc}</div>
      <div style="margin-bottom:0.75rem;">
        <div style="font-size:0.78rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.6rem;">Action Steps</div>
        <div class="rec-actions">
          ${r.steps.map((s,si) => `<div class="rec-action-step"><span style="font-family:'Syne',sans-serif;font-weight:700;color:var(--accent);font-size:0.8rem;">${si+1}</span>${s}</div>`).join('')}
        </div>
      </div>
      <div class="rec-impact-bar">
        <div class="rec-impact-label">
          <span>Implementation Impact Score</span>
          <span style="font-family:'Syne',sans-serif;font-weight:700;color:var(--text);">${r.impact}%</span>
        </div>
        <div class="rec-impact-track">
          <div class="rec-impact-fill" id="impact-fill-${r.id}" style="background:${r.priority==='critical'?'linear-gradient(90deg,var(--neg),var(--neu))':r.priority==='medium'?'linear-gradient(90deg,var(--neu),var(--accent))':'linear-gradient(90deg,var(--pos),var(--accent))'}"></div>
        </div>
      </div>
    </div>
  `).join('');

  // Animate impact bars
  setTimeout(() => {
    filtered.forEach(r => {
      const el = document.getElementById('impact-fill-' + r.id);
      if (el) el.style.width = r.impact + '%';
    });
  }, 200);
}

function filterRecs(btn, filter) {
  currentFilter = filter;
  btn.closest('.tabs').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  buildRecCards(filter);
}

function buildRoadmap() {
  const phases = [
    { label:'Q1', color:'rgba(244,63,94,0.2)', textColor:'var(--neg)', dot:'🔴', title:'Quick Wins — Immediate Impact', items:'Overhaul delivery logistics · Upgrade packaging · Launch review request emails', desc:'Focus on the highest-complaint areas first. These changes require minimal product development but deliver immediate sentiment improvement.' },
    { label:'Q2', color:'rgba(245,158,11,0.2)', textColor:'var(--neu)', dot:'🟡', title:'Experience Improvements', items:'Expand support to 24/7 · Fix software bugs · Improve camera firmware · Better post-purchase comms', desc:'Mid-term improvements to product quality and customer service that build long-term loyalty.' },
    { label:'Q3–Q4', color:'rgba(16,185,129,0.2)', textColor:'var(--pos)', dot:'🟢', title:'Growth & Retention', items:'Launch loyalty program · Enrich product content · Add trust signals · Expand to new markets', desc:'Strategic initiatives that convert satisfied customers into brand advocates and drive repeat purchases.' }
  ];
  document.getElementById('roadmap').innerHTML = phases.map(p => `
    <div class="roadmap-row">
      <div class="roadmap-dot" style="background:${p.color};color:${p.textColor};">${p.dot}</div>
      <div class="roadmap-content">
        <div class="roadmap-title">${p.label} — ${p.title}</div>
        <div style="font-size:0.8rem;color:var(--accent);margin-bottom:0.4rem;">${p.items}</div>
        <div class="roadmap-desc">${p.desc}</div>
      </div>
    </div>
  `).join('');
}

function buildImpactChart() {
  const existing = Chart.getChart('impact-chart');
  if (existing) existing.destroy();
  new Chart(document.getElementById('impact-chart'), {
    type: 'bar',
    data: {
      labels: allRecommendations.map(r => r.icon + ' ' + r.title.split(' ').slice(0,3).join(' ')),
      datasets: [{
        label: 'Impact Score (%)',
        data: allRecommendations.map(r => r.impact),
        backgroundColor: allRecommendations.map(r =>
          r.priority === 'critical' ? 'rgba(244,63,94,0.75)' :
          r.priority === 'medium' ? 'rgba(245,158,11,0.75)' : 'rgba(16,185,129,0.75)'
        ),
        borderRadius: 8, borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` Impact Score: ${ctx.raw}%` } } },
      scales: {
        x: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => v + '%' } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } }
      },
      animation: { duration: 1200 }
    }
  });
}

// Per-review recommendation engine
function generateReviewRecs(text, sentiment, aspects) {
  const lower = text.toLowerCase();
  const recs = [];
  if (lower.match(/slow|delay|late|ship|deliver/)) recs.push({ icon:'🚚', title:'Improve Delivery Speed', desc:'Multiple signals indicate delivery dissatisfaction. Consider switching to priority shipping or adding courier partners.', priority:'high' });
  if (lower.match(/packag|box|wrap|dent|damage/)) recs.push({ icon:'📦', title:'Upgrade Packaging Quality', desc:'Packaging issues detected. Use double-wall corrugated boxes and add fragile stickers to reduce damage.', priority:'high' });
  if (lower.match(/support|service|rude|helpful|response|contact/)) recs.push({ icon:'🎧', title:'Enhance Customer Support', desc:'Support experience is a key driver here. Invest in staff training and faster response SLAs.', priority:'high' });
  if (lower.match(/camera|photo|picture|image/)) recs.push({ icon:'📷', title:'Improve Camera Performance', desc:'Camera quality is flagged. A firmware update targeting low-light performance could address this quickly.', priority:'med' });
  if (lower.match(/battery|charge|drain|power/)) recs.push({ icon:'🔋', title:'Optimize Battery Performance', desc:'Battery feedback detected. Review power management settings and update firmware for efficiency gains.', priority:'med' });
  if (lower.match(/price|cost|expensive|cheap|value/)) recs.push({ icon:'💰', title:'Re-evaluate Pricing & Value Proposition', desc:'Price-value perception is mentioned. Consider bundling accessories or offering a loyalty discount.', priority:'med' });
  if (lower.match(/bug|crash|app|software|update/)) recs.push({ icon:'🔧', title:'Fix Software & App Bugs', desc:'Software issues are hurting experience. Prioritize a stable update and publish a public changelog.', priority:'med' });
  if (sentiment === 'Positive') recs.push({ icon:'⭐', title:'Request a Public Review', desc:'This customer is happy! Send a follow-up email prompting them to share their experience on Google/Amazon.', priority:'low' });
  if (recs.length === 0) recs.push({ icon:'✅', title:'Maintain Current Standards', desc:'No major pain points detected in this review. Keep up quality and proactively request feedback.', priority:'low' });
  return recs.slice(0, 5);
}

let recsPageInit = false;
function initRecommendationsPage() {
  if (recsPageInit) return;
  recsPageInit = true;
  buildRecCards('all');
  buildRoadmap();
  setTimeout(buildImpactChart, 300);
}

// ========== INIT ==========
function scrollToAnalyzer() {
  document.getElementById('analyzer-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
revealAll();
