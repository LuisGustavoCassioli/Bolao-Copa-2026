import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { Navbar } from './components/Navbar'
import LoginPage from './pages/Login'
import JogosPage from './pages/Jogos'
import RankingPage from './pages/Ranking'
import PerfilPage from './pages/Perfil'
import AdminPage from './pages/Admin'
import type { ReactNode } from 'react'

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <span className="text-4xl animate-spin">⚽</span>
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <span className="text-4xl animate-spin">⚽</span>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/jogos" replace /> : <LoginPage />}
      />
      <Route
        path="/jogos"
        element={
          <PrivateRoute>
            <AuthLayout>
              <JogosPage />
            </AuthLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ranking"
        element={
          <PrivateRoute>
            <AuthLayout>
              <RankingPage />
            </AuthLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <AuthLayout>
              <PerfilPage />
            </AuthLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AuthLayout>
              <AdminPage />
            </AuthLayout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/jogos" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
