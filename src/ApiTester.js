import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from './api/authService';

const ApiTester = () => {
  const [status, setStatus] = useState('Not tested');
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('http://localhost:5000');
  const [endpoint, setEndpoint] = useState('/api/health');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('{}');
  const [response, setResponse] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    setAuthenticated(authService.isAuthenticated());
  }, []);

  // Public endpoints as listed in FRONTEND_README.md
  const publicEndpoints = [
    { value: '/api/health', label: 'Health Check', method: 'GET', body: false },
    { value: '/api/status', label: 'API Status', method: 'GET', body: false },
    { value: '/api/public/test', label: 'Test Connectivity', method: 'GET', body: false },
    { value: '/', label: 'Root Endpoint', method: 'GET', body: false },
    { value: '/api/auth/login', label: 'Login', method: 'POST', 
      body: true, 
      template: JSON.stringify({ email: 'user@example.com', password: 'password123' }, null, 2) 
    },
    { value: '/api/auth/register', label: 'Register', method: 'POST', 
      body: true, 
      template: JSON.stringify({ username: 'newuser', email: 'newuser@example.com', password: 'password123' }, null, 2) 
    }
  ];

  // Protected endpoints (requires auth token)
  const protectedEndpoints = [
    { value: '/api/auth/me', label: 'Get Current User', method: 'GET', body: false },
    { value: '/api/groq', label: 'Send Prompt to LLM', method: 'POST', 
      body: true, 
      template: JSON.stringify({ prompt: 'Hello, how are you?', model: 'llama3-70b-8192', temperature: 0.7, maxTokens: 2048 }, null, 2) 
    }
  ];

  // Admin endpoints (requires admin auth token)
  const adminEndpoints = [
    { value: '/api/admin/users', label: 'Get All Users', method: 'GET', body: false },
    { value: '/api/admin/users/:id', label: 'Update User Role', method: 'PUT', 
      body: true, 
      template: JSON.stringify({ role: 'admin' }, null, 2) 
    },
    { value: '/api/admin/users/:id', label: 'Delete User', method: 'DELETE', body: false }
  ];

  const testConnection = async () => {
    setStatus('Testing...');
    setError(null);
    setResponse(null);
    
    try {
      // Replace ID placeholder with an actual ID if needed
      let testEndpoint = endpoint;
      if (testEndpoint.includes(':id')) {
        const idToUse = prompt('Enter user ID to use for this request:');
        if (idToUse) {
          testEndpoint = testEndpoint.replace(':id', idToUse);
        } else {
          setStatus('Cancelled');
          setError('User ID is required for this endpoint');
          return;
        }
      }
      
      let config = {
        method: method,
        url: `${apiUrl}${testEndpoint}`,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      };
      
      // Add auth token for protected endpoints
      if (authenticated && (endpoint.includes('/api/auth/me') || 
                           endpoint.includes('/api/groq') || 
                           endpoint.includes('/api/admin'))) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['x-auth-token'] = token;
        } else {
          setStatus('Authentication required');
          setError('This endpoint requires authentication but no token was found. Please login first.');
          return;
        }
      }
      
      // Add request body for POST/PUT methods
      if ((method === 'POST' || method === 'PUT') && requestBody) {
        try {
          config.data = JSON.parse(requestBody);
        } catch (e) {
          setStatus('Invalid JSON');
          setError('Request body contains invalid JSON. Please check your syntax.');
          return;
        }
      }
      
      const result = await axios(config);
      setStatus('Connected successfully');
      setResponse(result.data);
    } catch (err) {
      setStatus('Connection failed');
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Server responded with status: ${err.response.status}`);
        setResponse(err.response.data);
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response received from server. Server might be down or there might be CORS issues.');
      } else {
        // Something happened in setting up the request
        setError(`Error: ${err.message}`);
      }
    }
  };

  const handleEndpointSelect = (e) => {
    const selectedEndpoint = e.target.value;
    setEndpoint(selectedEndpoint);
    
    // Find the selected endpoint in all endpoint lists
    const allEndpoints = [...publicEndpoints, ...protectedEndpoints, ...adminEndpoints];
    const endpoint = allEndpoints.find(ep => ep.value === selectedEndpoint);
    
    if (endpoint) {
      setMethod(endpoint.method);
      if (endpoint.body && endpoint.template) {
        setRequestBody(endpoint.template);
      } else {
        setRequestBody('{}');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">API Connection Tester</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Base API URL:</label>
        <input
          type="text"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Endpoint:</label>
        <select
          value={endpoint}
          onChange={handleEndpointSelect}
          className="w-full p-2 border rounded"
        >
          <optgroup label="Public Endpoints">
            {publicEndpoints.map(ep => (
              <option key={ep.value} value={ep.value}>{ep.label} ({ep.method})</option>
            ))}
          </optgroup>
          <optgroup label="Protected Endpoints (Auth Required)">
            {protectedEndpoints.map(ep => (
              <option key={ep.value} value={ep.value}>{ep.label} ({ep.method})</option>
            ))}
          </optgroup>
          <optgroup label="Admin Endpoints (Admin Auth Required)">
            {adminEndpoints.map(ep => (
              <option key={ep.value} value={ep.value}>{ep.label} ({ep.method})</option>
            ))}
          </optgroup>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Method:</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
      
      {(method === 'POST' || method === 'PUT') && (
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Request Body (JSON):</label>
          <textarea
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            className="w-full p-2 border rounded font-mono"
            rows={6}
          />
        </div>
      )}
      
      <div className="flex mb-4">
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Connection
        </button>
        <div className="ml-4 flex items-center">
          <div className="font-bold">Status: 
            <span className={`ml-2 ${
              status === 'Connected successfully' ? 'text-green-600' : 
              status === 'Connection failed' ? 'text-red-600' : 
              'text-blue-600'}`}
            >
              {status}
            </span>
          </div>
        </div>
      </div>
      
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      {response && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Response:</h3>
          <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-60">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-bold mb-2">Troubleshooting Tips:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Make sure your backend server is running at <code className="bg-gray-100 px-1">{apiUrl}</code></li>
          <li>Check that the endpoint paths are correct and match the backend API</li>
          <li>For protected endpoints, make sure you're logged in first</li>
          <li>For admin endpoints, your user must have the admin role</li>
          <li>Check browser console (F12) for detailed error messages</li>
          <li>If you see CORS errors, your backend may need to allow requests from {window.location.origin}</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold mb-2">Connection Status:</h3>
        {authenticated ? (
          <p className="text-green-600">✓ You are authenticated. Protected endpoints will include your auth token.</p>
        ) : (
          <p className="text-red-600">✗ You are not authenticated. Protected endpoints will not work until you log in.</p>
        )}
      </div>
    </div>
  );
};

export default ApiTester;