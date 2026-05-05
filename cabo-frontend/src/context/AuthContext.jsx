import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, onIdTokenChanged, signOut } from 'firebase/auth';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeToken = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('cabo_token', token);
      } else {
        localStorage.removeItem('cabo_token');
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('cabo_token', token);
          // Try to get existing profile first
          try {
            const data = await api.getMe();
            setUser(data.user);
          } catch {
            // If user doesn't exist in backend yet, sync them
            const data = await api.syncUser({
              name: firebaseUser.displayName || 'User',
              phone: firebaseUser.phoneNumber || ''
            });
            setUser(data.user);
          }
        } catch (err) {
          console.error("Error fetching user profile", err);
          setUser(null);
        }
      } else {
        localStorage.removeItem('cabo_token');
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeToken();
      unsubscribeAuth();
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('cabo_token');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
