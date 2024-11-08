import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { SignUp } from './pages/SignUp'
import { Studio } from './pages/Studio'
import { FileManagement } from './pages/FileManagement'
import { VoiceCloning } from './pages/VoiceCloning'
import { Settings } from './pages/Settings'
import { Help } from './pages/Help'
import { Notifications } from './pages/Notifications'
import { About } from './pages/About'
import { Admin } from './pages/Admin'
import { TTSTest } from './pages/TTSTest'
import { NotFound } from './pages/NotFound'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminRoute } from './components/auth/AdminRoute'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="studio" element={
          <ProtectedRoute>
            <Studio />
          </ProtectedRoute>
        } />
        <Route path="files" element={
          <ProtectedRoute>
            <FileManagement />
          </ProtectedRoute>
        } />
        <Route path="voice-cloning" element={
          <ProtectedRoute>
            <VoiceCloning />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="help" element={
          <ProtectedRoute>
            <Help />
          </ProtectedRoute>
        } />
        <Route path="notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="about" element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        } />
        <Route path="tts-test" element={
          <ProtectedRoute>
            <TTSTest />
          </ProtectedRoute>
        } />
        <Route path="admin/*" element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
