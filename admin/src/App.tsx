import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext, useAuthState } from './store/auth'
import { AdminLayout } from './components/AdminLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectFormPage } from './pages/ProjectFormPage'
import { UnitsPage } from './pages/UnitsPage'
import { UnitFormPage } from './pages/UnitFormPage'
import { BookingsPage } from './pages/BookingsPage'
import { ConsultationsPage } from './pages/ConsultationsPage'
import { UsersPage } from './pages/UsersPage'
import { ClientDetailPage } from './pages/ClientDetailPage'
import { ProjectViewPage } from './pages/ProjectViewPage'
import { UnitViewPage } from './pages/UnitViewPage'
import { ReviewsPage } from './pages/ReviewsPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token')
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<ProjectFormPage />} />
        <Route path="/projects/:slug/view" element={<ProjectViewPage />} />
        <Route path="/projects/:slug" element={<ProjectFormPage />} />
        <Route path="/units" element={<UnitsPage />} />
        <Route path="/units/new" element={<UnitFormPage />} />
        <Route path="/units/:id/view" element={<UnitViewPage />} />
        <Route path="/units/:id" element={<UnitFormPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/consultations" element={<ConsultationsPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:id" element={<ClientDetailPage />} />
      </Routes>
    </AdminLayout>
  )
}

export default function App() {
  const auth = useAuthState()

  return (
    <AuthContext.Provider value={auth}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<PrivateRoute><AdminRoutes /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
