import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ReceiptUpload from './pages/ReceiptUpload'
import ReceiptList from './pages/ReceiptList'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/upload" element={
            <PrivateRoute>
              <ReceiptUpload />
            </PrivateRoute>
          } />
          <Route path="/receipts" element={
            <PrivateRoute>
              <ReceiptList />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
