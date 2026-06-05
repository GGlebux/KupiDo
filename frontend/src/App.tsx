import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './store/authContext'
import { ToastProvider } from './store/toast'
import { FavoritesProvider } from './store/favorites'
import { ScrollToTop } from './components/ScrollToTop'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HomePage } from './pages/HomePage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectPage } from './pages/ProjectPage'
import { UnitsPage } from './pages/UnitsPage'
import { UnitPage } from './pages/UnitPage'
import { ProfilePage } from './pages/ProfilePage'
import { LoginPage } from './pages/LoginPage'
import { MortgagePage } from './pages/MortgagePage'
import { ServicesPage } from './pages/ServicesPage'
import { ContactsPage } from './pages/ContactsPage'
import { InvestorsPage } from './pages/InvestorsPage'
import { ResidentsPage } from './pages/ResidentsPage'
import { VacanciesPage } from './pages/VacanciesPage'
import { AboutPage } from './pages/AboutPage'
import { TeamPage } from './pages/TeamPage'
import { GuaranteesPage } from './pages/GuaranteesPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { TradeInPage } from './pages/TradeInPage'
import { InstallmentPage } from './pages/InstallmentPage'
import { DealSupportPage } from './pages/DealSupportPage'
import { ReviewsPage } from './pages/ReviewsPage'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/catalog" element={<Layout><ProjectsPage /></Layout>} />
              <Route path="/catalog/:slug" element={<Layout><ProjectPage /></Layout>} />
              <Route path="/catalog/:slug/units" element={<Layout><UnitsPage /></Layout>} />
              <Route path="/units/:id" element={<Layout><UnitPage /></Layout>} />
              <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/mortgage" element={<Layout><MortgagePage /></Layout>} />
              <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
              <Route path="/contacts" element={<Layout><ContactsPage /></Layout>} />
              <Route path="/reviews" element={<Layout><ReviewsPage /></Layout>} />
              <Route path="/investors" element={<Layout><InvestorsPage /></Layout>} />
              <Route path="/residents" element={<Layout><ResidentsPage /></Layout>} />
              <Route path="/vacancies" element={<Layout><VacanciesPage /></Layout>} />
              <Route path="/about" element={<Layout><AboutPage /></Layout>} />
              <Route path="/team" element={<Layout><TeamPage /></Layout>} />
              <Route path="/guarantees" element={<Layout><GuaranteesPage /></Layout>} />
              <Route path="/documents" element={<Layout><DocumentsPage /></Layout>} />
              <Route path="/trade-in" element={<Layout><TradeInPage /></Layout>} />
              <Route path="/installment" element={<Layout><InstallmentPage /></Layout>} />
              <Route path="/deal-support" element={<Layout><DealSupportPage /></Layout>} />
            </Routes>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
