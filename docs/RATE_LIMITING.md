# Rate Limiting Implementation

## Overview

The metadata extraction API implements rate limiting to prevent abuse and ensure fair usage for all users. Additionally, free users are limited to 3 requests per 24 hours to encourage sign-ups.

## Configuration

- **Server Rate Limit**: 10 requests per minute per IP address
- **Free User Limit**: 3 requests per 24 hours (client-side)
- **Window**: 60 seconds (1 minute) for server, 24 hours for free users
- **Client Throttle**: 2 seconds between submissions

## Free User Limitations

### Implementation

Free (unauthenticated) users are limited to 3 metadata extraction requests per 24 hours:

- Request count stored in `localStorage`
- Counter resets after 24 hours
- After 3 requests, input is disabled
- User prompted to sign in for unlimited access

### User Experience

When limit is reached:
1. Input field is disabled
2. Beautiful notice card is displayed with:
   - Lock icon and clear messaging
   - "Sign In to Continue" button (primary CTA)
   - "View Pricing" button (secondary CTA)
3. Request counter shows progress (e.g., "2 of 3 free requests used")

### Storage

```typescript
localStorage.setItem('linkPreviewRequestCount', '3');
localStorage.setItem('linkPreviewRequestTime', '1234567890000');
```

Counter automatically resets after 24 hours.

## Server-Side Rate Limiting

### Implementation

Located in `src/lib/utils/rate-limiter.ts`, the rate limiter:

- Tracks requests by IP address
- Uses in-memory storage (Map)
- Automatically cleans up expired entries
- Returns rate limit headers in responses

### Rate Limit Headers

All API responses include these headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1234567890000
```

When rate limit is exceeded (HTTP 429):

```
Retry-After: 45
```

### IP Detection

The rate limiter checks these headers in order:

1. `x-forwarded-for` (for proxies/load balancers)
2. `x-real-ip`
3. Falls back to "unknown" if neither is present

## Client-Side Throttling

### Implementation

Located in `src/lib/utils/throttle.ts`, provides:

- **Throttle**: Ensures function is called at most once per specified time
- **Debounce**: Delays execution until after specified time has passed

### Usage in Links Page

The form submission is throttled to prevent spam:

```typescript
const throttledSubmit = useRef(
  throttle((urlToFetch: string) => {
    performSubmit(urlToFetch);
  }, 2000)
).current;
```

This ensures:
- Maximum one request every 2 seconds from client
- Prevents accidental double-clicks
- Improves user experience

## Error Handling

### Rate Limit Exceeded (Server)

When server rate limit is exceeded, users see:

```
Too many requests. Please wait 45 seconds before trying again.
```

### Free Limit Reached (Client)

When free user limit is reached:

```
You've used all 3 free requests. Sign in to unlock unlimited metadata extraction and access premium features.
```

The error message includes clear CTAs for sign-in and pricing.

## Testing Rate Limits

### Server Rate Limit

To test the server rate limiter:

1. Make 10 requests within 1 minute
2. The 11th request will return HTTP 429
3. Wait for the time specified in `Retry-After` header
4. Requests will be allowed again

### Free User Limit

To test the free user limit:

1. Make 3 successful requests
2. The 4th request will be blocked client-side
3. Input will be disabled with sign-in prompt
4. Clear localStorage or wait 24 hours to reset

To manually reset:
```javascript
localStorage.removeItem('linkPreviewRequestCount');
localStorage.removeItem('linkPreviewRequestTime');
```

## Production Considerations

For production deployment, consider:

1. **Redis-based rate limiting** for multi-server deployments
2. **Different limits for authenticated users** (higher limits)
3. **IP-based + User-based** rate limiting
4. **Monitoring and alerting** for rate limit violations
5. **Graceful degradation** when rate limiter fails
6. **Database storage** for user request counts (instead of localStorage)

## Future Enhancements

- [ ] Redis integration for distributed rate limiting
- [ ] User-based rate limits (higher for authenticated users)
- [ ] Configurable limits via environment variables
- [ ] Rate limit analytics and monitoring
- [ ] Whitelist for trusted IPs
- [ ] Database-backed request counting for authenticated users
- [ ] Email notifications when approaching limits
