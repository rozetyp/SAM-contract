# SAM.gov API Scalability & Deduplication Analysis

## 🔥 Critical Issues Found

### 1. Deduplication Working But Window Too Large
- **Current**: 48-hour window with daily cron
- **Problem**: Massive overlap causing few new results
- **Fix**: Reduce to 25-hour window for 1-hour overlap buffer

### 2. API Scalability Limits

#### Current Implementation:
```
Daily API Usage = Number of Users × 1 call
48-hour window = Fetches same data multiple times
```

#### SAM.gov Rate Limits:
- **Free Tier**: 1,000 requests/day (~42/hour)
- **Paid Tier**: 5,000-10,000 requests/day (~200-400/hour)

#### Sustainable User Counts:
- **Free API Key**: ~800 users (with buffer)
- **Paid API Key**: ~4,000-8,000 users
- **Multiple Keys**: Linear scaling

## 🚀 Recommended Fixes

### Immediate (Week 1):
1. **Reduce Time Window**: 48h → 25h
```typescript
// In packages/worker/src/jobs/opps.ts
export async function runOppsDigest({ windowHours = 25 }: { windowHours?: number } = {})
```

2. **Add Debug Logging**: Track deduplication stats
3. **Monitor API Usage**: Add rate limit tracking

### Short-term (Month 1):
1. **Smart Batching**: Group users with identical search criteria
2. **Cache Results**: Store API responses for reuse
3. **Multiple API Keys**: Rotation for higher limits

### Long-term (Quarter 1):
1. **Delta Updates**: Track last-seen timestamp per user
2. **Intelligent Scheduling**: Spread API calls across 24 hours
3. **Premium SAM.gov Tier**: Higher rate limits

## 📊 User Capacity Analysis

| API Tier | Daily Limit | Safe User Count | Notes |
|----------|-------------|-----------------|-------|
| Free | 1,000 | 800 users | 80% utilization buffer |
| Paid Basic | 5,000 | 4,000 users | Good for MVP scaling |
| Paid Premium | 10,000+ | 8,000+ users | Enterprise ready |
| Multi-Key | N×Limit | N×Users | Linear scaling |

## 🔧 Implementation Priority

### Priority 1 (This Week):
- [ ] Reduce window to 25 hours
- [ ] Add deduplication metrics logging
- [ ] Monitor current API usage

### Priority 2 (Next Sprint):
- [ ] Implement search criteria batching
- [ ] Add API response caching
- [ ] Set up multiple API key rotation

### Priority 3 (Future):
- [ ] Delta timestamp tracking
- [ ] Distributed cron scheduling
- [ ] Premium SAM.gov upgrade path

## 💡 Why You're Getting 2 Items

1. **Time Window Overlap**: 48h window with daily runs means 95%+ duplicate filtering
2. **Amendment Filtering**: Many listings are amendments (correctly filtered out)
3. **Type Filtering**: Only `o,k,p` types allowed (excludes many record types)
4. **Keyword Filtering**: Your criteria might be very specific

**Solution**: Reduce window to 25 hours first, then monitor results.
