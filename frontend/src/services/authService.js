import api from '../config/api';

export const authService = {
  register: async (userData) => {
    try {
      console.log('📤 Registering user:', { ...userData, password: '***' });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(api.auth.register, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('📥 Register API response status:', response.status, response.statusText);

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('❌ Non-JSON response:', text);
          return {
            success: false,
            message: `Server error: ${response.status} ${response.statusText}`,
            error: text.substring(0, 200)
          };
        }

        const data = await response.json();
        console.log('📥 Register API response data:', data);
        
        if (!response.ok) {
          console.error('❌ Registration failed:', data);
          return {
            success: false,
            message: data.message || data.error || `Registration failed: ${response.status}`,
            error: data.error || data.message
          };
        }
        
        if (data.success && data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('✅ Registration successful, token saved');
        }
        return data;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error('❌ Register timeout');
          return {
            success: false,
            message: 'Request timeout. Please check your connection and try again.',
            error: 'Timeout'
          };
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('❌ Register fetch error:', error);
      // Standardize network error reporting
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        return {
          success: false,
          message: 'Network error. Please check if the server is running and try again.',
          error: error.message
        };
      }
      return {
        success: false,
        message: error.message || 'Network error. Please check your connection.',
        error: error.message
      };
    }
  },

  login: async (credentials) => {
    try {
      console.log('Logging in user:', { ...credentials, password: '***' });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch(api.auth.login, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('❌ Non-JSON response:', text);
          return {
            success: false,
            message: `Server error: ${response.status} ${response.statusText}`,
            error: text.substring(0, 200)
          };
        }

        const data = await response.json();
        console.log('Login API response:', data);
        
        if (data.success && data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          return data;
        }
        
        // If not successful, return the error message from server
        return {
          success: false,
          message: data.message || data.error || 'Login failed. Please check your credentials.',
          error: data.error || data.message
        };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error('❌ Login timeout');
          return {
            success: false,
            message: 'Request timeout. Please check your connection and try again.',
            error: 'Timeout'
          };
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Login fetch error:', error);
      // Check if it's a network error
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'AbortError') {
        return {
          success: false,
          message: 'Network error. Please check if the server is running and try again.',
          error: error.message
        };
      }
      return {
        success: false,
        message: error.message || 'Network error. Please check your connection.',
        error: error.message
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch(api.auth.me, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return data.success ? data.data.user : null;
    } catch (error) {
      return null;
    }
  },

  parentLogin: async (credentials) => {
    try {
      console.log('Parent login request:', { ...credentials, dob: credentials.dob ? '***' : 'missing' });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch(`${api.baseUrl}/api/auth/parent-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('❌ Non-JSON response:', text);
          return {
            success: false,
            message: `Server error: ${response.status} ${response.statusText}`,
            error: text.substring(0, 200)
          };
        }

        const data = await response.json();
        console.log('Parent login API response:', data);
        
        if (data.success && data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          return data;
        }
        
        // If not successful, return the error message from server
        return {
          success: false,
          message: data.message || data.error || 'Parent login failed. Please check your credentials.',
          error: data.error || data.message
        };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error('❌ Parent login timeout');
          return {
            success: false,
            message: 'Request timeout. Please check your connection and try again.',
            error: 'Timeout'
          };
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Parent login fetch error:', error);
      // Check if it's a network error
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'AbortError') {
        return {
          success: false,
          message: 'Network error. Please check if the server is running and try again.',
          error: error.message
        };
      }
      return {
        success: false,
        message: error.message || 'Network error. Please check your connection.',
        error: error.message
      };
    }
  }
};

export default authService;

