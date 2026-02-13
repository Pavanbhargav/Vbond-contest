# Next.js Caching Strategies

This project uses Next.js App Router, which implements aggressive caching defaults. Here's how caching works and how to control it:

## 1. Default Caching (Static Generation)
By default, Next.js caches all `fetch` requests indefinitely (`force-cache`). This is great for data that rarely changes (like configuration or static content).

```javascript
// Default behavior
const res = await fetch('https://api.example.com/data'); 
// Equivalent to:
const res = await fetch('https://api.example.com/data', { cache: 'force-cache' });
```

## 2. Dynamic Data (No Cache)
For data that changes frequently (like user data, real-time transactions), you should disable caching.

```javascript
// Always fetch fresh data
const res = await fetch('https://api.example.com/data', { cache: 'no-store' });
```

In this project, for Appwrite or other dynamic database calls, ensure you are not relying on cached data if real-time updates are needed. React Server Components using `cookies()` or `headers()` usually opt out of static caching automatically.

## 3. Time-Based Revalidation (ISR)
If you want data to be cached but updated periodically (e.g., a leaderboard that updates every minute), use `next: { revalidate: <seconds> }`.

```javascript
// Cache for 60 seconds, then revalidate in the background
const res = await fetch('https://api.example.com/data', { next: { revalidate: 60 } });
```

## Route Segment Config
You can also force a page to be dynamic by adding this line at the top of a `page.tsx` or `layout.tsx` file:

```javascript
export const dynamic = 'force-dynamic';
```

This is useful if you are using libraries (like Appwrite SDK) that don't use the standard `fetch` API but you still want to ensure the page is always rendered freshly on the server.
