# Authentication & Authorization Guide

## Overview
This application implements a secure authentication system using JWT (JSON Web Tokens) with React Context API for state management.

## Features

### ✅ Implemented
- **User Registration (Signup)** - Create new user accounts with email and password
- **User Login** - Authenticate users with email and password
- **Protected Routes** - Dashboard and other routes are protected from unauthorized access
- **Token Management** - JWT tokens stored in localStorage with automatic validation
- **Session Persistence** - User sessions persist across page refreshes
- **Logout Functionality** - Clear session and redirect to login
- **Loading States** - UI feedback during API calls
- **Error Handling** - User-friendly error messages
- **Password Validation** - Strong password requirements
- **Axios Interceptors** - Automatic token injection and 401 error handling

## Architecture

### Client-Side (React)

#### 1. AuthContext (`src/context/AuthContext.jsx`)
Centralized authentication state management using React Context API.

**State:**
- `user` - Current user information
- `isAuthenticated` - User authentication status
- `isLoading` - Loading state during API calls
- `error` - Error messages

**Methods:**
- `login(email, password)` - Authenticate user
- `signup(fullName, email, password)` - Create new account
- `logout()` - Clear authentication
- `validateToken()` - Verify token validity on app load

**Key Features:**
- Token validation on component mount
- Automatic localStorage management
- Error state management
- Loading indicator during API calls

```javascript
// Usage Example
const { user, isAuthenticated, login, logout } = useAuth();
```

#### 2. ProtectedRoute (`src/components/ProtectedRoute.jsx`)
A route wrapper that prevents unauthorized access to protected pages.

```javascript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  }
/>
```

Features:
- Checks authentication status before rendering
- Shows loading spinner while validating token
- Redirects to login if not authenticated

#### 3. Login & Signup Components
Enhanced forms with:
- Input validation (email format, password strength)
- Loading states during submission
- Error message display
- Toast notifications for user feedback
- Disabled buttons during submission

#### 4. Axios Instance (`src/utils/axiosinstance.js`)
Configured with interceptors:

**Request Interceptor:**
- Automatically adds JWT token to Authorization header

**Response Interceptor:**
- Handles 401 (Unauthorized) responses
- Clears token and redirects to login
- Maintains consistent error handling

### Server-Side (Node.js/Express)

#### Authentication Middleware (`server/utilities.js`)
```javascript
function authToken(req, res, next)
```
- Extracts token from Authorization header
- Verifies token signature using ACCESS_TOKEN_SECRET
- Attaches decoded user data to request
- Returns 401 if token is missing
- Returns 403 if token is invalid/expired

**Implementation:**
```javascript
app.get("/get-user", authToken, (req, res) => {
  // req.user contains decoded token data
});
```

#### Token Generation
Created during login/signup:
```javascript
const accesstoken = jwt.sign(
  { userId: isUser._id },
  ACCESS_TOKEN_SECRET,
  { expiresIn: "72h" }
);
```

**Configuration:**
- Expiration: 72 hours
- Algorithm: HS256 (HMAC-SHA256)
- Secret: Stored in environment variable `ACCESS_TOKEN_SECRET`

## Setup Instructions

### Prerequisites
- Node.js 14+
- MongoDB
- npm or yarn

### Environment Variables

#### Client (.env)
```
VITE_BASE_URL=http://localhost:8000
# For production:
# VITE_BASE_URL=https://api.traveldiary.com
```

#### Server (.env)
```
PORT=8000
MONGO_URI=mongodb://localhost:27017/traveldiary
ACCESS_TOKEN_SECRET=your-super-secret-key-here
NODE_ENV=development
```

⚠️ **Security Note:** Never commit `.env` files. Use `.env.example` as template.

### Installation

#### Client
```bash
cd client
npm install
npm run dev  # Development
npm run build  # Production
```

#### Server
```bash
cd server
npm install
node index.js  # Or use nodemon for development
```

## API Endpoints

### Authentication

#### POST /login
Register and authenticate user
```
Request:
{
  "email": "user@example.com",
  "password": "Password123"
}

Response (200):
{
  "error": false,
  "user": {
    "fullName": "John Doe",
    "email": "user@example.com"
  },
  "accesstoken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Error (400/401):
{
  "error": true,
  "message": "Invalid credentials"
}
```

#### POST /create-user
Create new user account
```
Request:
{
  "fullName": "John Doe",
  "email": "user@example.com",
  "password": "Password123"
}

Response (201):
{
  "error": false,
  "user": {
    "fullName": "John Doe",
    "email": "user@example.com"
  },
  "accesstoken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /get-user
Retrieve current user info (Protected)
```
Headers:
Authorization: Bearer <token>

Response (200):
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "user@example.com"
  }
}

Error (401):
Unauthorized
```

## Password Requirements

Passwords must meet these criteria:
- ✅ Minimum 6 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)

Example valid passwords:
- `MyPassword1`
- `Secure123Pass`
- `Travel2024Diary`

## Security Best Practices

### ✅ Implemented
1. **Password Hashing** - BCrypt (server-side)
2. **JWT Tokens** - Secure token-based authentication
3. **Token Expiration** - 72-hour expiration
4. **HTTPS** - Enabled in production (Vercel)
5. **CORS** - Configured to allow safe origins
6. **Input Validation** - Email and password validation
7. **Error Handling** - Generic error messages (no data leakage)

### 🔒 Additional Recommendations
1. **Refresh Tokens** - Implement separate refresh tokens for token rotation
2. **Rate Limiting** - Add rate limiting on login/signup endpoints
3. **CSRF Protection** - Add CSRF tokens for state-changing operations
4. **Session Timeout** - Add automatic logout on inactivity
5. **Password Reset** - Implement forgot password functionality
6. **2FA** - Add two-factor authentication for security

## Troubleshooting

### Issue: "404 Not Found" on /dashboard
**Solution:** Ensure `vercel.json` in client folder routes all non-API requests to `index.html`

### Issue: "401 Unauthorized" errors
**Solution:** 
1. Check token exists in localStorage
2. Verify token hasn't expired (73+ hours old)
3. Check `ACCESS_TOKEN_SECRET` matches server

### Issue: CORS errors
**Solution:**
1. Verify `VITE_BASE_URL` is correct
2. Check server CORS configuration
3. Ensure Authorization header is properly formatted

### Issue: Token not persisting after page refresh
**Solution:**
1. Check localStorage is enabled in browser
2. Verify token validation in AuthContext
3. Check browser DevTools Storage tab

## Token Flow Diagram

```
User Signup/Login
        ↓
Validate Input
        ↓
POST /login or /create-user
        ↓
Server Hash Password & Create JWT Token
        ↓
Return Token to Client
        ↓
Store Token in localStorage
        ↓
Update AuthContext state
        ↓
Redirect to /dashboard
        ↓
ProtectedRoute validates token
        ↓
Render Dashboard
        ↓
Each Request: Axios adds "Authorization: Bearer <token>"
        ↓
Server validates token with authToken middleware
        ↓
Access allowed ✅ OR Redirect to login ❌
```

## File Structure

```
client/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx          # Authentication state management
│   ├── components/
│   │   └── ProtectedRoute.jsx       # Route protection wrapper
│   ├── page/
│   │   └── Auth/
│   │       ├── Login.jsx             # Login form
│   │       ├── Signup.jsx            # Registration form
│   │       └── Home/
│   │           └── Home.jsx          # Protected dashboard
│   └── utils/
│       ├── axiosinstance.js         # Axios with interceptors
│       ├── constants.js              # API base URL
│       └── helper.js                 # Validation utilities
├── .env                              # Environment variables
└── .env.example                      # Environment template

server/
├── models/
│   ├── user.model.js                # User schema
│   └── travelStory.model.js         # Travel story schema
├── index.js                         # Express server
├── utilities.js                     # Auth middleware
└── .env                             # Server config
```

## Testing Authentication

### Manual Testing Checklist
- [ ] User can register with valid credentials
- [ ] User cannot register with invalid password
- [ ] User can login with correct credentials
- [ ] User cannot login with incorrect password
- [ ] Token persists on page refresh
- [ ] Accessing /dashboard without token redirects to login
- [ ] Logout clears token and redirects to login
- [ ] Protected api endpoints return 401 without token
- [ ] Toast notifications appear on errors/success

## Contributing

When implementing features that require authentication:

1. **Use `useAuth()` hook** - Access auth state where needed
```javascript
const { user, isAuthenticated, logout } = useAuth();
```

2. **Protect routes** - Wrap components in ProtectedRoute
```javascript
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

3. **Handle errors gracefully** - Show user-friendly messages
```javascript
catch (error) {
  toast.error(error.response?.data?.message || "Something went wrong");
}
```

4. **Add loading states** - Improve UX with loading indicators
```javascript
<button disabled={isLoading}>{isLoading ? "Loading..." : "Submit"}</button>
```

## Support

For authentication-related issues or questions:
1. Check this documentation
2. Review error logs in browser console
3. Check server logs in terminal
4. Verify environment variables are set
5. Test with curl/Postman for API endpoints

---

**Last Updated:** March 23, 2026
**Version:** 1.0
