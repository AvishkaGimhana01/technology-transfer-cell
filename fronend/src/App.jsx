import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import ProtectedRoute from './auth/ProtectedRoute'
import AppShell from './components/layout/AppShell'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DisclosuresPage from './pages/DisclosuresPage'
import PatentsPage from './pages/PatentsPage'
import ProsecutionPage from './pages/ProsecutionPage'
import DeadlinesPage from './pages/DeadlinesPage'
import LicensesPage from './pages/LicensesPage'
import DocumentsPage from './pages/DocumentsPage'
import ReportsPage from './pages/ReportsPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/disclosures" element={<DisclosuresPage />} />
                <Route path="/patents" element={<PatentsPage />} />
                <Route path="/prosecution" element={<ProsecutionPage />} />
                <Route path="/deadlines" element={<DeadlinesPage />} />
                <Route path="/licenses" element={<LicensesPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
