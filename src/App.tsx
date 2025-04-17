import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import AuthLayout from './components/auth/AuthLayout';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ThemeProvider } from './contexts/ThemeContext';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Todo = lazy(() => import('./pages/Todo'));
const Reports = lazy(() => import('./pages/Reports'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthProvider value={{ session }}>
      <ThemeProvider>
        <ProfileProvider>
          <Router>
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              }
            >
              <Routes>
                <Route
                  path="/auth/*"
                  element={
                    !session ? (
                      <AuthLayout>
                        <Routes>
                          <Route path="/login" element={<Login />} />
                          <Route path="/signup" element={<Signup />} />
                          <Route path="*" element={<Navigate to="/auth/login" />} />
                        </Routes>
                      </AuthLayout>
                    ) : (
                      <Navigate to="/" />
                    )
                  }
                />
                <Route
                  path="/*"
                  element={
                    session ? (
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/todo" element={<Todo />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                      </Layout>
                    ) : (
                      <Navigate to="/auth/login" />
                    )
                  }
                />
              </Routes>
            </Suspense>
          </Router>
        </ProfileProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;