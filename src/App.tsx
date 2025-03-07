
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/layout/Layout';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const Index = lazy(() => import('./pages/Index'));
const Profile = lazy(() => import('./pages/Profile'));
const Progress = lazy(() => import('./pages/Progress'));
const Essay = lazy(() => import('./pages/Essay'));
const Quiz = lazy(() => import('./pages/Quiz'));
const ChatAI = lazy(() => import('./pages/ChatAI'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }
        >
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Index />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Progress />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/essay"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Essay />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Quiz />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat-ai"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChatAI />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
