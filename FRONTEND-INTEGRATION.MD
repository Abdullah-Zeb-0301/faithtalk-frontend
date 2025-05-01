# Frontend Integration Guide for FaithTalk Backend

This guide provides detailed instructions for connecting your frontend application to the FaithTalk backend API. Follow these steps to configure your frontend for proper integration.

## Backend Connection Information

- **Base URL**: `http://localhost:5000`
- **API Prefix**: `/api`
- **Protocol**: HTTP (not HTTPS)
- **Authentication**: JWT-based (via `x-auth-token` header)

## Available Endpoints

### Public Endpoints (No Authentication Required)

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/auth/register` | POST | Register new user | `{username, email, password}` | JWT token & user object |
| `/api/auth/login` | POST | Login existing user | `{email, password}` | JWT token & user object |
| `/api/public/test` | GET | Test connectivity | None | Status message |
| `/api/status` | GET | API status | None | Status message |
| `/api/health` | GET | Health check | None | Status message |
| `/` | GET | Root endpoint | None | "FaithTalk API is running" |

### Protected Endpoints (Authentication Required)

| Endpoint | Method | Description | Headers | Request Body | Response |
|----------|--------|-------------|---------|--------------|----------|
| `/api/auth/me` | GET | Get current user | `x-auth-token` | None | User object |
| `/api/groq` | POST | Send prompt to LLM | `x-auth-token` | `{prompt, model?, temperature?, maxTokens?}` | LLM response |

### Admin Endpoints (Admin Authentication Required)

| Endpoint | Method | Description | Headers | Request Body | Response |
|----------|--------|-------------|---------|--------------|----------|
| `/api/admin/users` | GET | Get all users | `x-auth-token` | None | Array of users |
| `/api/admin/users/:id` | PUT | Update user role | `x-auth-token` | `{role}` | Updated user |
| `/api/admin/users/:id` | DELETE | Delete user | `x-auth-token` | None | Success message |

## Frontend Configuration Steps

### 1. Set Up API Client

Create an API client utility to handle requests to the backend. Here's an example using Axios:

```javascript
// src/api/client.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Handle auth errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if using a router
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. Create API Service Modules

Organize API calls into service modules by feature:

```javascript
// src/api/authService.js
import apiClient from './client';

export const authService = {
  register: (userData) => {
    return apiClient.post('/auth/register', userData);
  },
  
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },
  
  getCurrentUser: () => {
    return apiClient.get('/auth/me');
  }
};
```

```javascript
// src/api/llmService.js
import apiClient from './client';

export const llmService = {
  askGroq: (prompt, options = {}) => {
    return apiClient.post('/groq', {
      prompt,
      model: options.model || 'llama3-70b-8192',
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 2048
    });
  }
};
```

```javascript
// src/api/adminService.js
import apiClient from './client';

export const adminService = {
  getAllUsers: () => {
    return apiClient.get('/admin/users');
  },
  
  updateUserRole: (userId, role) => {
    return apiClient.put(`/admin/users/${userId}`, { role });
  },
  
  deleteUser: (userId) => {
    return apiClient.delete(`/admin/users/${userId}`);
  }
};
```

### 3. Set Up Authentication Management

Create an authentication context to manage user authentication state:

```javascript
// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      
      // Validate token with backend
      authService.getCurrentUser()
        .then(response => {
          setCurrentUser(response.data);
        })
        .catch(err => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentUser(null);
          setError('Session expired. Please log in again.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login({ email, password });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setCurrentUser(response.data.user);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (username, email, password) => {
    try {
      setError(null);
      const response = await authService.register({ username, email, password });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setCurrentUser(response.data.user);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    error,
    loading,
    isAdmin: currentUser?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
```

### 4. Set Up Protected Routes

Create protected route components to handle authentication requirements:

```javascript
// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { currentUser, loading, isAdmin } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};
```

### 5. Define Frontend Routes

When defining your routes, make sure to use unique keys for routes that share similar paths:

```javascript
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ChatWithLLM from './pages/ChatWithLLM';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import UsersList from './pages/UsersList';
import EditUser from './pages/EditUser';
import DeleteUser from './pages/DeleteUser';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatWithLLM /></ProtectedRoute>} />
          
          {/* Admin routes - Note the unique keys for shared paths */}
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UsersList /></AdminRoute>} />
          <Route 
            path="/admin/users/:id/edit" 
            key="edit-user"
            element={<AdminRoute><EditUser /></AdminRoute>} 
          />
          <Route 
            path="/admin/users/:id/delete" 
            key="delete-user"
            element={<AdminRoute><DeleteUser /></AdminRoute>} 
          />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

Notice how we've separated the user management routes and given them unique keys:
- `/admin/users/:id/edit` for updating user roles
- `/admin/users/:id/delete` for deleting users

### 6. Implement Authentication Components

Create login and registration forms:

```javascript
// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by auth context
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
```

### 7. Implement LLM Chat Component

Create a component to interact with the Groq LLM API:

```javascript
// src/pages/ChatWithLLM.js
import React, { useState } from 'react';
import { llmService } from '../api/llmService';

const ChatWithLLM = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      const result = await llmService.askGroq(prompt);
      setResponse(result.data.choices[0].message.content);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get LLM response');
      console.error('LLM error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Chat with AI</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your question here..."
            rows={4}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Getting response...' : 'Send'}
        </button>
      </form>
      
      {response && (
        <div className="response">
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default ChatWithLLM;
```

### 8. Implement Admin Component

Create a component for the admin panel:

```javascript
// src/pages/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { adminService } from '../api/adminService';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load users: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      // Refresh user list
      loadUsers();
    } catch (err) {
      setError('Failed to update user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId);
        // Refresh user list
        loadUsers();
      } catch (err) {
        setError('Failed to delete user: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h2>Admin Panel</h2>
      {error && <div className="error">{error}</div>}
      
      <button onClick={loadUsers}>Refresh Users</button>
      
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <select 
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleDeleteUser(user.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
```

## Troubleshooting Connection Issues

If you encounter connection issues between your frontend and the backend:

1. **Verify Backend is Running**:
   - Confirm the server is running at http://localhost:5000
   - Check that MongoDB is running (`brew services list | grep mongodb`)
   - Test public endpoints in a browser or with tools like Postman

2. **Check CORS Configuration**:
   - The backend has CORS enabled for the following origins:
     - http://localhost:3000
     - http://localhost:8080
     - http://127.0.0.1:3000
     - http://127.0.0.1:8080
   - If your frontend runs on a different port, update the CORS configuration in the backend

3. **Authentication Issues**:
   - Ensure you're storing the token correctly after login/registration
   - Verify the token is included in the `x-auth-token` header for protected requests
   - Check the token format and expiration (JWT tokens expire after 7 days)

4. **Network Issues**:
   - Ensure both frontend and backend use the same protocol (HTTP, not HTTPS)
   - Check browser console for detailed error messages
   - Verify your network allows connections to localhost

5. **Testing Authentication Flow**:
   - First test the public endpoints to verify basic connectivity
   - Then test login/registration to verify the authentication system
   - Finally test protected endpoints with the token

## Complete Endpoint Documentation

For detailed information about all available endpoints, request/response formats, and authentication requirements, see the complete [API Documentation](http://localhost:5000/api/docs) (if available) or refer to the backend README.