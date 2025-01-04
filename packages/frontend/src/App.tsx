import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardLayout from './components/DashboardLayout'
import Home from './pages/Home'
import Try from './pages/Try'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Jobs from './pages/Jobs'
import Settings from './pages/Settings'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <Layout><Home /></Layout>
              </PublicRoute>
            } 
          />
          <Route path="/try" element={<Layout><Try /></Layout>} />
          <Route 
            path="/sign-up" 
            element={
              <PublicRoute>
                <Layout><SignUp /></Layout>
              </PublicRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Layout><Login /></Layout>
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <DashboardLayout><Profile /></DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs" 
            element={
              <ProtectedRoute>
                <DashboardLayout><Jobs /></DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <DashboardLayout><Settings /></DashboardLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
