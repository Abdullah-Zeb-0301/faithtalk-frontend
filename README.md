# FaithTalk Frontend

A faith-based chat application built with React that allows users to engage in spiritual conversations with an AI.

## Features

- User authentication (login/signup)
- AI-powered chat interface 
- Admin dashboard for user management
- Responsive design using Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend API running at http://localhost:5000 (or your custom URL)

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

## Project Structure

- `src/` - Source files
  - `api/` - API service modules
  - `services/` - Core services including API client configuration
  - `App.js` - Main application component
  - `Navbar.js` - Navigation component
  - `Loginpage.js` - User login component
  - `Signup_page.js` - User registration component
  - `chatpage.js` - Chat interface with AI
  - `Adminpage.js` - Admin dashboard for user management
  - `ProtectedRoute.js` - Route protection logic

## Backend API Integration

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

- **Chat**:
  - Send message to AI: `POST /api/groq`

## Authentication Flow

The application uses JWT token authentication:

1. When a user logs in or registers, the backend API returns a token
2. The token is stored in localStorage
3. The token is included in the `x-auth-token` header for authenticated requests
4. Protected routes verify authentication before rendering components

## User Roles

- **Regular Users**: Can access the chat interface
- **Admin Users**: Can access the admin dashboard to manage users

## Styling

The application uses Tailwind CSS for styling:

- Responsive design that works on mobile and desktop
- Custom utility classes defined in `src/App.css`
- Light/dark mode theming support (though not fully implemented in the UI)

## Build for Production

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