# FaithTalk Backend API Documentation

This document provides comprehensive information about the FaithTalk backend API, including authentication flows, available endpoints, and request/response formats.

## Table of Contents

1. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Setup](#environment-setup)
2. [Authentication](#authentication)
   - [User Registration](#user-registration)
   - [User Login](#user-login)
   - [Authentication Flow](#authentication-flow)
3. [API Endpoints](#api-endpoints)
   - [Authentication Endpoints](#authentication-endpoints)
   - [Admin Endpoints](#admin-endpoints)
   - [Groq LLM Integration](#groq-llm-integration)
4. [Error Handling](#error-handling)
5. [Examples](#examples)
   - [Authentication Examples](#authentication-examples)
   - [LLM Query Examples](#llm-query-examples)
6. [Security Considerations](#security-considerations)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud instance)
- Groq API key (for LLM integration)

### Installation

To run the backend server immediately:

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` file (see below)
4. Start the server: `npm start`

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/faithtalk
JWT_SECRET=your_jwt_secret_key_change_this_in_production
GROQ_API_KEY=your_groq_api_key_here
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. All protected endpoints require a valid JWT token in the `x-auth-token` header.

### User Registration

New users can register with a username, email, and password.

### User Login

Registered users can login with their email and password to receive a JWT token.

### Authentication Flow

1. Register or login to receive a JWT token
2. Include this token in the `x-auth-token` header for all subsequent requests to protected endpoints
3. The token expires after 7 days, requiring the user to login again

## API Endpoints

### Authentication Endpoints

#### Register a New User

```
POST /api/auth/register
```

Request Body:
```json
{
  "username": "username",
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Login

```
POST /api/auth/login
```

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Get Current User

```
GET /api/auth/me
```

Headers:
```
x-auth-token: jwt-token-here
```

Response:
```json
{
  "id": "user-id",
  "username": "username",
  "email": "user@example.com",
  "role": "user",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Admin Endpoints

These endpoints are only accessible to users with the `admin` role.

#### Get All Users

```
GET /api/admin/users
```

Headers:
```
x-auth-token: jwt-token-here
```

Response:
```json
[
  {
    "id": "user-id-1",
    "username": "username1",
    "email": "user1@example.com",
    "role": "user",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  {
    "id": "user-id-2",
    "username": "username2",
    "email": "user2@example.com",
    "role": "admin",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
]
```

#### Update User Role

```
PUT /api/admin/users/:id
```

Headers:
```
x-auth-token: jwt-token-here
```

Request Body:
```json
{
  "role": "admin"
}
```

Response:
```json
{
  "message": "User role updated",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "user@example.com",
    "role": "admin",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

#### Delete User

```
DELETE /api/admin/users/:id
```

Headers:
```
x-auth-token: jwt-token-here
```

Response:
```json
{
  "message": "User deleted"
}
```

### Groq LLM Integration

The backend provides a dedicated endpoint for interacting with Groq's Large Language Models (LLMs).

#### Make LLM Request

```
POST /api/groq
```

Headers:
```
x-auth-token: jwt-token-here
Content-Type: application/json
```

Request Body:
```json
{
  "prompt": "Your question or prompt for the LLM",
  "model": "llama3-70b-8192",  // Optional, defaults to llama3-70b-8192
  "temperature": 0.7,          // Optional, defaults to 0.7
  "maxTokens": 2048            // Optional, defaults to 2048
}
```

Response:
```json
{
  "id": "chatcmpl-123abc",
  "object": "chat.completion",
  "created": 1683000000,
  "model": "llama3-70b-8192",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The LLM's response text will be here."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input or missing required fields
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Authenticated but insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

Error responses follow this format:

```json
{
  "message": "Description of the error"
}
```

For validation errors, the response includes more details:

```json
{
  "errors": [
    {
      "msg": "Email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## Examples

### Authentication Examples

#### Registration Example (JavaScript)

```javascript
async function registerUser(username, email, password) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        email,
        password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Store the token in localStorage
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}
```

#### Login Example (JavaScript)

```javascript
async function loginUser(email, password) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store the token in localStorage
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

#### Making Authenticated Requests

```javascript
async function fetchUserProfile() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('User not authenticated');
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: {
        'x-auth-token': token
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user profile');
    }
    
    return data;
  } catch (error) {
    console.error('Profile fetch error:', error);
    throw error;
  }
}
```

### LLM Query Examples

#### Basic LLM Query

```javascript
async function askLLM(question) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('User not authenticated');
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/groq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({
        prompt: question
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get LLM response');
    }
    
    // Extract the actual text response
    return data.choices[0].message.content;
  } catch (error) {
    console.error('LLM query error:', error);
    throw error;
  }
}
```

## Security Considerations

1. **Store tokens securely**: In web applications, use `localStorage` or `sessionStorage`.

2. **Token expiration**: The JWT tokens expire after 7 days. Your frontend should handle cases where a token expires by redirecting to the login page.

3. **HTTPS**: Always use HTTPS in production to encrypt data in transit.

4. **Validate inputs**: Although the backend validates inputs, it's good practice to validate on the frontend as well.

## Troubleshooting

### Common Issues

1. **"Token is not valid" error**: 
   - The token may have expired. Try logging in again.
   - The token may be malformed. Check if you're sending it correctly in the header.

2. **CORS errors**:
   - The backend has CORS enabled, but if you encounter issues, ensure your frontend origin is allowed.

3. **MongoDB connection**:
   - If the server fails to start, ensure MongoDB is running and accessible.

4. **Groq API errors**:
   - Check that your Groq API key is correctly set in the `.env` file.

---

# FaithTalk Frontend

A faith-based chat application built with React that connects to the FaithTalk backend API.

## Features

- User authentication (login/signup)
- Chat interface with AI-powered responses using Groq LLM
- Admin dashboard for user management
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- FaithTalk backend API running at http://localhost:5000 (or your custom URL)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd faithtalk-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure the backend API URL:
   - For development: The application is configured to connect to `http://localhost:5000` by default
   - To change this, edit the `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```
   - For production, the API URL is configured in `.env.production`

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Backend API Connection

This frontend application connects to the FaithTalk backend API. The connection is handled through the API service layer in `src/services/api.js`.

### API Endpoints Used

- **Authentication**:
  - Register: `POST /api/auth/register`
  - Login: `POST /api/auth/login`
  - Get current user: `GET /api/auth/me`

- **Admin Functions**:
  - Get all users: `GET /api/admin/users`
  - Update user role: `PUT /api/admin/users/:id`
  - Delete user: `DELETE /api/admin/users/:id`

- **LLM Integration**:
  - Ask Groq LLM: `POST /api/groq`

### Authentication Flow

The application uses JWT token authentication. When a user logs in or registers:

1. The backend API returns a token
2. The token is stored in localStorage
3. The token is included in the `x-auth-token` header for authenticated requests
4. If a 401 response is received, the user is automatically logged out and redirected to login

## Development

### Key Files

- `src/services/api.js` - API service layer for backend communication
- `src/Loginpage.js` - User login component
- `src/Signup_page.js` - User registration component
- `src/chatpage.js` - Chat interface with Groq LLM integration
- `src/Adminpage.js` - Admin dashboard for user management

### Environment Variables

- `REACT_APP_API_URL` - The URL of the backend API

## Production Build

To create a production build:

```bash
npm run build
```

This will create an optimized build in the `build` folder, ready for deployment.

## Troubleshooting

If you encounter issues connecting to the backend:

1. Verify the backend server is running at the URL specified in your `.env` file
2. Check the browser console for any CORS-related errors
3. Ensure your backend is properly configured to accept requests from your frontend origin
4. If you get authentication errors, try clearing localStorage and logging in again

---

Last updated: May 1, 2025