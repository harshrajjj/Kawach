import React from 'react'
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Signup from './pages/SignUp.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GenerateQR from './pages/GenerateQR.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Print from './pages/Print.jsx';

function App() {


    const router = createBrowserRouter(
      createRoutesFromElements(
        <Route>
          <Route path='/' element={<Home/>} />
          <Route path='/login' element={<Login/>} />
          <Route path='/signup' element={<Signup/>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-qr"
            element={
              <ProtectedRoute>
                <GenerateQR />
              </ProtectedRoute>
            }
          />
          <Route
          path="/print/:fileId"
          element={
              <Print/>
          }
          />
          <Route path="*" element={<Home/>} />
        </Route>
      )
    );

  return (
      <>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            // Default toast options
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '10px',
              padding: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            // Customize different toast types
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
              style: {
                border: '1px solid #10B981',
                padding: '16px',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
              style: {
                border: '1px solid #EF4444',
                padding: '16px',
              },
            },
          }}
        />
      </>
    );
}

export default App
