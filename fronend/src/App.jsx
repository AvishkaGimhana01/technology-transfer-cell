import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import AppShell from './components/layout/AppShell'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsListPage from './pages/projects/ProjectsListPage'
import ProjectDetailPage from './pages/projects/ProjectDetailPage'
import AgreementsListPage from './pages/agreements/AgreementsListPage'
import MousListPage from './pages/mous/MousListPage'
import ApplyPage from './pages/innovation-club/ApplyPage'
import ApplicationsAdminPage from './pages/innovation-club/ApplicationsAdminPage'
import NoticeboardPage from './pages/noticeboard/NoticeboardPage'
import IprViolationsPage from './pages/ipr/IprViolationsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/apply" element={<ApplyPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsListPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/agreements" element={<AgreementsListPage />} />
              <Route path="/mous" element={<MousListPage />} />
              <Route path="/noticeboard" element={<NoticeboardPage />} />
              <Route path="/innovation-club/applications" element={<ApplicationsAdminPage />} />
              <Route path="/ipr-violations" element={<IprViolationsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
