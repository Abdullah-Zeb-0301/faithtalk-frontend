import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    console.log(`Received successful response from: ${response.config.url}`);
    return response;
  },
  error => {
    if (error.response) {
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  storeAuthData: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.errors) {
        const validationError = error.response.data.errors[0];
        throw new Error(validationError.msg);
      }
      throw error.response?.data || error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (error.response?.data?.errors) {
        const validationError = error.response.data.errors[0];
        throw new Error(validationError.msg);
      }
      throw error.response?.data || error;
    }
  },

  getCurrentUser: async (email) => {
    try {
      if (!email) {
        throw new Error('Email parameter is required');
      }
      const response = await api.get(`/api/auth/me?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('User not found');
      }
      throw error.response?.data || error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export const adminService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/api/admin/users');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  updateUserRole: async (email, role) => {
    try {
      const response = await api.put(`/api/admin/users/${email}`, { role });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  deleteUser: async (email) => {
    try {
      const response = await api.delete(`/api/admin/users/${email}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export const llmService = {
  askLLM: async (message, options = {}) => {
    try {
      console.log('Sending question to LLM API:', message);
      
      const response = await api.post('/api/groq', {
        question: message
      });

      console.log('LLM API response:', response.data);
      
      return response;
    } catch (error) {
      console.error('LLM API error:', error);
      throw error.response ? error.response.data : error;
    }
  },
};

export default api;