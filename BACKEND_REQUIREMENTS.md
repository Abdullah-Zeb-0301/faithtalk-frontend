# FaithTalk Frontend Integration Guide for Backend Developers

This document outlines all the functionality and API endpoints that the FaithTalk frontend requires from the backend server. Use this as a reference for implementing or maintaining the backend API.

## Overview

The FaithTalk frontend is a React application that connects to the backend API to provide:
- User authentication (registration, login, session management)
- Chat interface with AI-powered responses using Groq LLM
- Admin dashboard for user management
- Protected routes based on authentication status and user roles

## Required API Endpoints

### Public Endpoints (No Authentication Required)

| Endpoint | Method | Description | Request Body | Expected Response |
|----------|--------|-------------|--------------|-------------------|
| `/api/auth/register` | POST | Register new user | `{username, email, password}` | `{token, user: {id, username, email, role, createdAt}}` |
| `/api/auth/login` | POST | Login existing user | `{email, password}` | `{token, user: {id, username, email, role, createdAt}}` |
| `/api/public/test` | GET | Test connectivity | None | `{message: "Connection successful"}` |
| `/api/status` | GET | API status | None | `{status: "up", version: "1.0.0"}` |
| `/api/health` | GET | Health check | None | `{status: "healthy"}` |
| `/` | GET | Root endpoint | None | `{message: "FaithTalk API is running"}` |

### Protected Endpoints (Authentication Required via x-auth-token header)

| Endpoint | Method | Description | Request Body | Expected Response |
|----------|--------|-------------|--------------|-------------------|
| `/api/auth/me` | GET | Get current user | None | `{id, username, email, role, createdAt, updatedAt}` |
| `/api/groq` | POST | Send prompt to LLM | `{prompt, model?, temperature?, maxTokens?}` | Groq API format response with `choices[0].message.content` containing the response text |

### Admin Endpoints (Admin Authentication Required via x-auth-token header)

| Endpoint | Method | Description | Request Body | Expected Response |
|----------|--------|-------------|--------------|-------------------|
| `/api/admin/users` | GET | Get all users | None | Array of `{id, username, email, role, createdAt, updatedAt}` |
| `/api/admin/users/:id` | PUT | Update user role | `{role}` | `{id, username, email, role, createdAt, updatedAt}` |
| `/api/admin/users/:id` | DELETE | Delete user | None | `{message: "User deleted"}` |

## Authentication Implementation Requirements

### JWT Token Format

The frontend expects JWT tokens that:
- Are returned after successful registration or login
- Are included in the `x-auth-token` header for authenticated requests
- Contain user information including `id` and `role`
- Have an expiration period (recommended: 7 days)

### Registration Process

1. Frontend sends `username`, `email`, and `password` to `/api/auth/register`
2. Backend validates the input, creates the user, and returns a JWT token and user object
3. Frontend stores the token in localStorage and uses it for subsequent authenticated requests

### Login Process

1. Frontend sends `email` and `password` to `/api/auth/login`
2. Backend validates credentials and returns a JWT token and user object
3. Frontend stores the token in localStorage and uses it for subsequent authenticated requests

### Authentication Verification

1. Frontend includes token in `x-auth-token` header for protected routes
2. Backend validates the token and returns appropriate data or 401 Unauthorized response
3. If a 401 response is received, the frontend clears the token and redirects to the login page

## Groq LLM API Requirements

### Request Format

The frontend sends requests to `/api/groq` with the following format:

```json
{
  "prompt": "User's question or message",
  "model": "llama3-70b-8192",  // Optional, defaults to llama3-70b-8192
  "temperature": 0.7,          // Optional, defaults to 0.7
  "maxTokens": 2048            // Optional, defaults to 2048
}
```

### Expected Response Format

The backend should proxy requests to the Groq API and return responses in this format:

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

## Admin Dashboard Requirements

### User Management

The admin dashboard displays and manages all users in the system:

1. **List Users**: Fetches all users via GET `/api/admin/users`
2. **Update User Role**: Changes a user's role via PUT `/api/admin/users/:id` with `{role: "user"|"admin"}`
3. **Delete User**: Removes a user via DELETE `/api/admin/users/:id`

## CORS Configuration

To ensure the frontend can communicate with the backend, the backend should have CORS enabled for the following origins:
- http://localhost:3000
- http://localhost:8080
- http://127.0.0.1:3000
- http://127.0.0.1:8080

## Error Handling

The backend should provide consistent error responses:
- Use appropriate HTTP status codes (400, 401, 403, 404, 500, etc.)
- Include a message explaining the error
- For validation errors, provide details about which fields have issues

Example error response:
```json
{
  "message": "Invalid input",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Sample Backend Implementation Technologies

The recommended tech stack for implementing the backend:
- Node.js with Express
- MongoDB with Mongoose for data storage
- JSON Web Tokens (JWT) for authentication
- Axios for proxying requests to the Groq API
- Express middleware for request validation and authentication

## Testing the API

The frontend includes an API Tester component that helps diagnose connection issues. It allows testing all endpoints with proper request formatting and authentication handling.

## Version Compatibility

This frontend is designed to work with Backend API version 1.0.0 or higher. Breaking changes to the API contract should be avoided or communicated clearly.

---

Last updated: May 1, 2025