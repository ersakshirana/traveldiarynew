# Deployment Checklist - Travel Diary App

## Client-Side (React/Vite)

### Environment Variables
- [ ] Set `VITE_BASE_URL` in Vercel environment
  - Production: `https://api.traveldiary-one.vercel.app` (or your API domain)
  - Or use same domain if API is on same Vercel project

### Vercel Configuration
- [ ] Ensure `client/vercel.json` exists with correct rewrite rules
  - Routes non-API requests to `index.html`
  - Prevents 404 on spa routes like `/dashboard`

```json
{
  "rewrites": [
    { "source": "/:path((?!api|_next/static|_next/image|favicon.ico).*)", "destination": "/index.html" }
  ]
}
```

### Build Settings
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Root Directory: `client`

## Server-Side (Node.js/Express)

### Environment Variables (Set in Vercel)
- [ ] `MONGO_URI` - MongoDB connection string
- [ ] `ACCESS_TOKEN_SECRET` - Strong JWT secret key (change for each environment!)
- [ ] `PORT` - Usually auto-assigned by Vercel
- [ ] `BASE_URL` - Your server domain
- [ ] `NODE_ENV` - Set to `production`

### Security Checklist
- [ ] `ACCESS_TOKEN_SECRET` is **NOT** a weak default value
- [ ] MongoDB credentials are secure
- [ ] CORS is properly configured for production domain
- [ ] HTTPS is enabled (automatic on Vercel)

### Vercel Routing
- [ ] `server/vercel.json` configured properly
  - Should NOT redirect all routes to index.js
  - Only serverless functions are needed

```json
{
  "buildCommand": "npm install",
  "functions": {
    "index.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

## Authentication Verification

### Login/Signup Flow
- [ ] User can register with valid credentials
- [ ] User receives JWT token on signup/login
- [ ] Token is stored in localStorage
- [ ] Token is sent in Authorization header for API calls

### Protected Routes
- [ ] `/dashboard` requires valid token
- [ ] Accessing without token redirects to `/login`
- [ ] Token persists on page refresh

### Token Validation
- [ ] Server validates token with `authToken` middleware
- [ ] Invalid/expired tokens return 401
- [ ] Client intercepts 401 and clears token

### Error Handling
- [ ] Login errors show user-friendly messages
- [ ] Signup password validation works
- [ ] Network errors handled gracefully
- [ ] Toast notifications appear for feedback

## API Endpoints Verification

Test these endpoints in production:

```bash
# Sign up
curl -X POST https://api.traveldiary-one.vercel.app/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Password123"
  }'

# Login
curl -X POST https://api.traveldiary-one.vercel.app/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'

# Get user (with token)
curl -X GET https://api.traveldiary-one.vercel.app/get-user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Post-Deployment Testing

### Smoke Tests
- [ ] Navigate to `/login` - page loads
- [ ] Navigate to `/signup` - page loads
- [ ] Try login with invalid credentials - error shows
- [ ] Try signup with weak password - error shows
- [ ] Success signup/login redirects to `/dashboard`
- [ ] Direct access to `/dashboard` without token redirects to login
- [ ] Logout clears token and redirects to login
- [ ] Page refresh maintains authentication state

### Browser DevTools Checks
- [ ] localStorage has `token` key after login
- [ ] Authorization header appears in network requests
- [ ] API calls include Bearer token
- [ ] No CORS errors in console
- [ ] No 401 errors after successful login

### Monitoring
- [ ] Check Vercel logs for errors
- [ ] Monitor API response times
- [ ] Check error rates in Vercel dashboard
- [ ] Monitor database connection status

## Troubleshooting

### Issue: 404 on /dashboard after deployment
- Check `client/vercel.json` exists and is correct
- Verify redirect rules in Vercel deployment settings
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: 401 Unauthorized on API calls
- Verify `VITE_BASE_URL` environment variable
- Check server `ACCESS_TOKEN_SECRET` matches everywhere
- Ensure Authorization header is sent (check Network tab)

### Issue: CORS errors
- Verify server CORS configuration
- Check `VITE_BASE_URL` matches server domain
- Ensure credentials in axios config if needed

### Issue: Token not persisting
- Check browser localStorage is enabled
- Verify app.vercel.json rewrite isn't breaking requests
- Check AuthContext is wrapping app properly

## Rollback Plan

If deployment fails:
1. Revert to previous version in Vercel
2. Check logs for error messages
3. Verify environment variables are set
4. Test locally before redeploying
5. Deploy to staging first if available

## Performance Monitoring

- [ ] Check Time to First Byte (TTFB)
- [ ] Monitor Core Web Vitals
- [ ] Check API response times
- [ ] Monitor database query performance
- [ ] Set up alerts for errors

---

**Last Updated:** March 23, 2026
