# FaithTalk Frontend Startup Guide

This guide will help you set up and run the FaithTalk frontend application with the backend API.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- FaithTalk backend API running (either locally or remotely)

## Setup Instructions

### 1. Install Dependencies

First, make sure you're in the project directory and install all dependencies:

```bash
npm install
```

### 2. Configure Backend Connection

The application is configured to connect to a backend API. By default, it will look for the backend at `http://localhost:5000`.

#### For Local Development

The `.env` file is already configured with:
```
REACT_APP_API_URL=http://localhost:5000
```

If your backend is running on a different URL or port, update this value.

#### For Production

If deploying to production, use the `.env.production` file, which is configured with:
```
REACT_APP_API_URL=https://api.faithtalk.com
```

Update this URL if your production API is hosted elsewhere.

### 3. Start the Application

Start the development server:

```bash
npm start
```

This will launch the application at `http://localhost:3000`.

## Testing the Connection

To verify that your frontend is correctly connected to the backend:

1. Open the application in your browser
2. Try to sign up for a new account
3. Try to log in with your credentials
4. If you can successfully log in and see the chat interface, your connection is working

## Troubleshooting

### Backend Connection Issues

If you're having trouble connecting to the backend:

1. Make sure your backend server is running
2. Check that the URL in your `.env` file matches the URL where your backend is hosted
3. Look for CORS errors in your browser's developer console - these might indicate that the backend is not configured to accept requests from your frontend
4. Check if the backend endpoints match the ones expected by the frontend (see API service configuration)

### Authentication Issues

If you're having trouble with login or registration:

1. Check the network tab in your browser's developer tools to see the exact response from the API
2. Ensure that the backend is correctly returning JWT tokens in the format expected by the frontend
3. Try clearing your browser's local storage and cookies, then log in again

## API Service Configuration

The application is set up to use the following backend API endpoints:

- Authentication:
  - Register: `POST /api/auth/register`
  - Login: `POST /api/auth/login`
  - Get User: `GET /api/auth/me`

- Admin:
  - Get All Users: `GET /api/admin/users`
  - Update User Role: `PUT /api/admin/users/:id`
  - Delete User: `DELETE /api/admin/users/:id`

- LLM:
  - Ask LLM: `POST /api/groq`

If your backend uses different endpoints, update the API service configuration in `src/services/api.js`.