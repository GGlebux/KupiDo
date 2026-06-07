import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthContext, useAuthState } from './store/auth'
import { AdminLayout } from './components/AdminLayout'
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

  // Пока проверяем токен/роль (или уходим на форму входа сайта) — ничего не рисуем.
  if (auth.loading) return null

  return (
    <AuthContext.Provider value={auth}>
      {/* Админка живёт под префиксом /admin того же домена, что и сайт. */}
      <BrowserRouter basename="/admin">
        <AdminRoutes />
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
