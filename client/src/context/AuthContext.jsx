import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for token and set user on initial load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        // Set default auth header for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          // You can add an endpoint to verify the token and get user data
          // For now, we'll just set the user from localStorage if available
          const userData = localStorage.getItem('user');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        } catch (error) {
          console.error('Error loading user:', error);
          // If token is invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  // Set up axios interceptor to add token to all requests
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const setFile = (id) => {
    setFileId(id);
  }

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTimestamp');
    delete axios.defaults.headers.common['Authorization'];

    // Clear the cookie by making a request to the server
    try {
      // You can create a logout endpoint on the server to clear the cookie
      // For now, we'll just handle it on the client side
      await axios.get('/api/v1/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setFile, fileId, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
