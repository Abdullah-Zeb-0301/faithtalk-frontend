import axios from 'axios';

// Get the API URL from environment variables, with a fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// For debugging - log the API URL being used
console.log('Connecting to API at:', API_URL);

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true
});

// Add an interceptor to include the auth token with every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    // For debugging - log outgoing requests
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => {
    // For debugging - log successful responses
    console.log(`Received successful response from: ${response.config.url}`);
    return response;
  },
  error => {
    // For debugging - log detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers,
        url: error.response.config.url
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
      console.log('Check if the server is running at:', API_URL);
    } else {
      console.error('Error setting up request:', error.message);
    }

    if (error.response && error.response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Login a user
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Logout - clear localStorage
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user from localStorage
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Admin services
export const adminService = {
  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/api/admin/users');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update user role (admin only)
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/api/admin/users/${userId}`, { role });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// LLM services
export const llmService = {
  // Make an LLM request - updated to match the README implementation
  askLLM: async (prompt, options = {}) => {
    try {
      const response = await api.post('/api/groq', {
        prompt,
        model: options.model || 'llama3-70b-8192',
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 2048
      });
      
      // Extract the text response and return both the text and full response
      // as recommended in the README
      return {
        text: response.data.choices[0].message.content,
        fullResponse: response.data
      };
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default api;